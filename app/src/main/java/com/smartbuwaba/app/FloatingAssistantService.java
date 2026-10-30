package com.smartbuwaba.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.TextView;

public class FloatingAssistantService extends Service {
    private static final String CHANNEL_ID = "chat_buwaba_floating";
    private static final int NOTIFICATION_ID = 4701;
    private WindowManager windowManager;
    private View bubble;
    private WindowManager.LayoutParams bubbleParams;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        Notification notification = buildNotification();
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIFICATION_ID, notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
        showBubble();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID, "Chat Buwaba floating button", NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Keeps your Chat Buwaba floating shortcut available.");
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
    }

    private Notification buildNotification() {
        Intent open = new Intent(this, MainActivity.class);
        open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pending = PendingIntent.getActivity(this, 0, open,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? new Notification.Builder(this, CHANNEL_ID)
            : new Notification.Builder(this);
        return builder.setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Chat Buwaba is ready")
            .setContentText("Tap the floating B button to open your assistant.")
            .setContentIntent(pending)
            .setOngoing(true)
            .build();
    }

    private void showBubble() {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        int size = (int) (62 * getResources().getDisplayMetrics().density);
        FrameLayout shell = new FrameLayout(this);
        GradientDrawable circle = new GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            new int[] { Color.rgb(141, 247, 194), Color.rgb(128, 232, 255) });
        circle.setShape(GradientDrawable.OVAL);
        circle.setStroke((int) (2 * getResources().getDisplayMetrics().density),
            Color.WHITE);
        TextView logo = new TextView(this);
        logo.setText("B");
        logo.setTextColor(Color.rgb(8, 18, 30));
        logo.setTextSize(27);
        logo.setTypeface(Typeface.create("sans-serif-black", Typeface.BOLD));
        logo.setGravity(Gravity.CENTER);
        logo.setBackground(circle);
        shell.addView(logo, new FrameLayout.LayoutParams(size, size));

        TextView close = new TextView(this);
        close.setText("×");
        close.setTextColor(Color.WHITE);
        close.setTextSize(15);
        close.setGravity(Gravity.CENTER);
        GradientDrawable closeBg = new GradientDrawable();
        closeBg.setColor(Color.rgb(34, 48, 72));
        closeBg.setShape(GradientDrawable.OVAL);
        close.setBackground(closeBg);
        FrameLayout.LayoutParams closeParams = new FrameLayout.LayoutParams(
            (int) (21 * getResources().getDisplayMetrics().density),
            (int) (21 * getResources().getDisplayMetrics().density), Gravity.TOP | Gravity.END);
        shell.addView(close, closeParams);
        close.setOnClickListener(v -> stopSelf());

        bubbleParams = new WindowManager.LayoutParams(
            size, size, Build.VERSION.SDK_INT >= 26
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT);
        bubbleParams.gravity = Gravity.TOP | Gravity.END;
        bubbleParams.x = (int) (18 * getResources().getDisplayMetrics().density);
        bubbleParams.y = (int) (180 * getResources().getDisplayMetrics().density);

        shell.setOnTouchListener(new View.OnTouchListener() {
            private int startX, startY;
            private float downX, downY;
            private boolean moved;

            @Override
            public boolean onTouch(View view, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        startX = bubbleParams.x;
                        startY = bubbleParams.y;
                        downX = event.getRawX();
                        downY = event.getRawY();
                        moved = false;
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        int dx = (int) (downX - event.getRawX());
                        int dy = (int) (event.getRawY() - downY);
                        if (Math.abs(dx) + Math.abs(dy) > 10) moved = true;
                        bubbleParams.x = Math.max(0, startX + dx);
                        bubbleParams.y = Math.max(0, startY + dy);
                        windowManager.updateViewLayout(bubble, bubbleParams);
                        return true;
                    case MotionEvent.ACTION_UP:
                        if (!moved) {
                            Intent launch = new Intent(FloatingAssistantService.this, MainActivity.class);
                            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                            startActivity(launch);
                        }
                        return true;
                }
                return false;
            }
        });

        bubble = shell;
        try {
            windowManager.addView(bubble, bubbleParams);
        } catch (RuntimeException error) {
            stopSelf();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (windowManager != null && bubble != null) {
            try { windowManager.removeView(bubble); } catch (Exception ignored) {}
        }
        bubble = null;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
