package com.smartbuwaba.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.provider.Settings;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class MainActivity extends Activity {
    private static final String HOME_HOST = "smart-buwaba-ai-app.vercel.app";
    private static final int WEB_PERMISSION_REQUEST = 9101;
    private static final int OVERLAY_PERMISSION_REQUEST = 9102;

    private WebView webView;
    private PermissionRequest pendingWebPermissionRequest;
    private volatile boolean trustedPageLoaded = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.addJavascriptInterface(new SmartBuwabaNativeBridge(), "SmartBuwabaNative");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                Uri uri = Uri.parse(url);
                trustedPageLoaded = isSmartBuwabaHost(uri.getHost());
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleNavigation(request.getUrl());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleNavigation(Uri.parse(url));
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> handleWebPermissionRequest(request, true));
            }
        });
        webView.loadUrl("https://" + HOME_HOST + "/");

        if (Settings.canDrawOverlays(this)) {
            startFloatingAssistant();
        } else if (!getPreferences(MODE_PRIVATE).getBoolean("overlay_prompt_shown", false)) {
            getPreferences(MODE_PRIVATE).edit().putBoolean("overlay_prompt_shown", true).apply();
            new AlertDialog.Builder(this)
                .setTitle("Chat Buwaba floating button")
                .setMessage("Allow Chat Buwaba to show a small movable B button over other apps? You can close it any time using the × on the button.")
                .setPositiveButton("Allow", (dialog, which) -> requestOverlayPermission())
                .setNegativeButton("Not now", null)
                .show();
        }
    }

    private void requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= 23 && !Settings.canDrawOverlays(this)) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + getPackageName()));
            startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST);
        }
    }

    private void startFloatingAssistant() {
        if (!Settings.canDrawOverlays(this)) return;
        Intent service = new Intent(this, FloatingAssistantService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startForegroundService(service);
        else startService(service);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == OVERLAY_PERMISSION_REQUEST) {
            if (Settings.canDrawOverlays(this)) startFloatingAssistant();
            else Toast.makeText(this, "Floating button permission was not enabled.", Toast.LENGTH_LONG).show();
        }
    }

    private boolean isSmartBuwabaHost(String host) {
        return host != null && HOME_HOST.equalsIgnoreCase(host);
    }

    private boolean isWebViewHost(Uri uri) {
        if (uri == null || !"https".equalsIgnoreCase(uri.getScheme())) return false;
        String host = uri.getHost();
        if (isSmartBuwabaHost(host)) return true;
        return host != null && (
            "accounts.google.com".equalsIgnoreCase(host) ||
            "myaccount.google.com".equalsIgnoreCase(host) ||
            host.endsWith(".firebaseapp.com")
        );
    }

    private boolean handleNavigation(Uri uri) {
        if (uri == null) return true;
        if ("about".equalsIgnoreCase(uri.getScheme())) return false;
        if (isWebViewHost(uri)) return false;
        try {
            Intent intent;
            if ("intent".equalsIgnoreCase(uri.getScheme())) {
                intent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME);
                String fallback = intent.getStringExtra("browser_fallback_url");
                try {
                    startActivity(intent);
                    return true;
                } catch (ActivityNotFoundException ex) {
                    if (fallback != null && !fallback.trim().isEmpty()) startExternalUri(Uri.parse(fallback));
                    return true;
                }
            }
            startExternalUri(uri);
        } catch (Exception e) {
            Toast.makeText(this, "Could not open that link on this device.", Toast.LENGTH_SHORT).show();
        }
        return true;
    }

    private void startExternalUri(Uri uri) {
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        if (intent.resolveActivity(getPackageManager()) != null) startActivity(intent);
        else Toast.makeText(this, "No app is available to open that link.", Toast.LENGTH_SHORT).show();
    }

    private void handleWebPermissionRequest(PermissionRequest request, boolean askForMissing) {
        if (request == null) return;
        List<String> grant = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        for (String resource : request.getResources()) {
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) grant.add(resource);
                else missing.add(Manifest.permission.RECORD_AUDIO);
            } else if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) grant.add(resource);
                else missing.add(Manifest.permission.CAMERA);
            }
        }
        if (!missing.isEmpty() && askForMissing) {
            pendingWebPermissionRequest = request;
            requestPermissions(missing.toArray(new String[0]), WEB_PERMISSION_REQUEST);
            return;
        }
        if (!grant.isEmpty()) request.grant(grant.toArray(new String[0]));
        else request.deny();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == WEB_PERMISSION_REQUEST && pendingWebPermissionRequest != null) {
            PermissionRequest request = pendingWebPermissionRequest;
            pendingWebPermissionRequest = null;
            handleWebPermissionRequest(request, false);
        }
    }

    private class SmartBuwabaNativeBridge {
        private final Map<String, String> packages = new HashMap<>();

        SmartBuwabaNativeBridge() {
            packages.put("youtube", "com.google.android.youtube");
            packages.put("youtube_music", "com.google.android.apps.youtube.music");
            packages.put("spotify", "com.spotify.music");
            packages.put("whatsapp", "com.whatsapp");
            packages.put("facebook", "com.facebook.katana");
            packages.put("instagram", "com.instagram.android");
            packages.put("google_maps", "com.google.android.apps.maps");
            packages.put("gmail", "com.google.android.gm");
            packages.put("play_store", "com.android.vending");
            packages.put("chrome", "com.android.chrome");
        }

        @JavascriptInterface
        public boolean openApp(String requestedName) {
            if (!trustedPageLoaded || requestedName == null) return false;
            final String name = requestedName.trim().toLowerCase(Locale.ROOT);
            Intent intent;
            if ("settings".equals(name)) intent = new Intent(Settings.ACTION_SETTINGS);
            else if ("camera".equals(name)) intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            else if ("calculator".equals(name)) {
                intent = new Intent(Intent.ACTION_MAIN);
                intent.addCategory(Intent.CATEGORY_APP_CALCULATOR);
            } else {
                String packageName = packages.get(name);
                if (packageName == null) return false;
                intent = getPackageManager().getLaunchIntentForPackage(packageName);
                if (intent == null) return false;
            }
            if (intent.resolveActivity(getPackageManager()) == null) return false;
            final Intent launchIntent = intent;
            runOnUiThread(() -> {
                try { startActivity(launchIntent); }
                catch (ActivityNotFoundException | SecurityException e) {
                    Toast.makeText(MainActivity.this, "That app could not be opened.", Toast.LENGTH_SHORT).show();
                }
            });
            return true;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
