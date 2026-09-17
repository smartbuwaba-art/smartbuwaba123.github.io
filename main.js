
const firebaseConfig={
 apiKey:"AIzaSyC5ia_DjqTg-cepVQcbYiM7m3tBTGhtnNs",
 authDomain:"smartbuwaba-40422.firebaseapp.com",
 projectId:"smartbuwaba-40422",
 storageBucket:"smartbuwaba-40422.firebasestorage.app",
 messagingSenderId:"840135135664",
 appId:"1:840135135664:web:7a22f7deaf2e40557ba475",
 measurementId:"G-QHR81JB1D6"
};
firebase.initializeApp(firebaseConfig);
const db=firebase.firestore();
const defaultPosts=[
 {id:"demo1",title:"Welcome to Smart Buwaba",category:"Other",desc:"Welcome to the official Smart Buwaba creative space.",thumb:"",video:"",date:new Date().toISOString()},
 {id:"demo2",title:"Coming Soon",category:"Film",desc:"Your next Smart Buwaba film can appear here.",thumb:"",video:"",date:new Date().toISOString()}
];
let posts=[];
let category="All";
const $=id=>document.getElementById(id);
function showPage(id){
 const page=$(id);
 if(!page){ console.warn("Smart Buwaba: page not found",id); return; }
 document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));
 page.classList.remove("hidden");
 document.querySelectorAll(".navlinks button[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
 const nav=$("nav"); if(nav)nav.classList.remove("open");
 if(id==="videos")renderVideos();
 if(id==="home")renderHome();
 if(id==="feed")loadFeed();
 if(id==="chat")loadChatUsers();
 if(id==="profile"){
   const n=$("profileName"),e=$("profileEmail"),c=$("profileVideoCount");
   if(n)n.textContent=currentUser?.displayName||currentUser?.email?.split("@")[0]||"Your Profile";
   if(e)e.textContent=currentUser?.email||"Sign in to manage your account.";
   if(c)c.textContent=posts.length;
 }
 window.scrollTo({top:0,behavior:"smooth"});
}
function card(p){
 const thumb=p.thumbnailUrl||p.thumbUrl||p.thumb||"";
 const desc=p.description||p.desc||"Smart Buwaba video";
 const video=p.videoUrl||p.video||"";
 const liked=likedPosts.has(String(p.id));
 const following=followingUsers.has(String(p.ownerId||""));
 const thumbHtml=thumb?`<img src="${esc(thumb)}" alt="">`:`<div class="placeholder"><div class="sbmark">SB</div></div>`;
 return `<article class="card">
 <div class="thumb">${thumbHtml}<span class="badge">${esc(p.category||"Other")}</span>
 <button class="play" onclick="playPost('${String(p.id).replace(/'/g,"\\'")}')">▶</button></div>
 <div class="cardBody"><h3>${esc(p.title||"Untitled video")}</h3><p>${esc(desc)}</p>
 <div class="meta"><span>${esc(p.category||"Other")}</span><span>👁️ ${p.viewCount||0} views</span><span>${p.date?new Date(p.date).toLocaleString():""}</span></div>
 <div class="socialBar">
 <button class="socialBtn ${liked?"liked":""}" onclick="toggleLike('${String(p.id).replace(/'/g,"\\'")}')">❤️ <span id="like-${esc(p.id)}">${p.likeCount||0}</span></button>
 <button class="socialBtn" onclick="openComments('${String(p.id).replace(/'/g,"\\'")}')">💬 <span id="comment-${esc(p.id)}">${p.commentCount||0}</span></button><button class="socialBtn" onclick="downloadPost('${String(p.id).replace(/'/g,"\\'")}')">⬇ Download</button>
 ${p.ownerId?`<button class="socialBtn ${following?"following":""}" onclick="toggleFollow('${String(p.ownerId).replace(/'/g,"\\'")}')">＋ ${following?"Following":"Follow"}</button>`:""}
 ${canDeleteVideo(p)?`<button class="socialBtn dangerBtn" onclick="deleteVideo('${String(p.id).replace(/'/g,"\'")}')">🗑 Delete</button>`:""}
 </div></div></article>`;
}
function isVideoAdmin(){return !!currentUser && String(currentUser.email||'').toLowerCase()==='mmuhammadallie@gmail.com'}
function canDeleteVideo(p){return !!currentUser && (String(p.ownerId||'')===String(currentUser.uid||'') || isVideoAdmin())}
async function deleteVideo(id){
 const p=posts.find(x=>String(x.id)===String(id)); if(!p || !canDeleteVideo(p)) return;
 if(!confirm('Delete this video/post?')) return;
 try{
   await db.collection('videos').doc(String(id)).delete();
   posts=posts.filter(x=>String(x.id)!==String(id));
   renderHome(); renderVideos();
   notify('Video deleted successfully.');
 }catch(e){console.error(e);alert('Could not delete this video.\n\n'+e.message);}
}
function renderHome(){ $("homeGrid").innerHTML=posts.slice().reverse().slice(0,4).map(card).join("")||empty(); $("countStat").textContent=posts.length }
function renderVideos(){
 const q=($("search").value||"").toLowerCase();
 let arr=posts.slice().reverse().filter(p=>(category==="All"||(p.category||"Other")==category)&&((p.title+" "+(p.description||p.desc||"")).toLowerCase().includes(q)));
 $("videoGrid").innerHTML=arr.map(card).join("")||empty();
}
function empty(){return `<div class="empty" style="grid-column:1/-1">No posts found yet.<br><button class="btn" style="margin-top:12px" onclick="openAddPost()">＋ Add your first post</button></div>`}
function setCategory(c,el){category=c;document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));el.classList.add("active");renderVideos()}
function openAddPost(){ $("postModal").classList.remove("hidden"); $("pTitle").focus() }
async function savePost(){
 const title=$("pTitle").value.trim(); if(!title){alert("Please enter a title.");return}
 const post={title,category:$("pCategory").value,description:$("pDesc").value.trim(),thumbnailUrl:$("pThumb").value.trim(),videoUrl:$("pVideo").value.trim(),date:new Date().toISOString(),likeCount:0,commentCount:0,viewCount:0};
 if(currentUser) post.ownerId=currentUser.uid;
 try{
   const ref=await db.collection("videos").add(post);
   posts.push({...post,id:ref.id});
   ["pTitle","pDesc","pThumb","pVideo"].forEach(x=>$(x).value="");
   closeModal("postModal");renderHome();renderVideos();notify("Post published successfully.");
 }catch(e){console.error(e);alert("Could not save the post. Check Firestore Rules and make sure Anonymous sign-in is enabled.\n\n"+e.message);}
}
async function playPost(id){
 const p=posts.find(x=>String(x.id)===String(id)); if(!p)return;
 try{
   await db.collection("videos").doc(String(id)).update({viewCount:firebase.firestore.FieldValue.increment(1)});
 }catch(e){console.warn("View count could not be saved:",e.message)}
 p.viewCount=(p.viewCount||0)+1;
 $("playerTitle").textContent=p.title||"Video";
 $("playerDesc").textContent=(p.description||p.desc||"")+" • 👁️ "+p.viewCount+" views";
 const url=p.videoUrl||p.video||"";
 const yt=getYouTubeId(url);
 if(yt){
   $("playerArea").innerHTML=`<iframe class="videoFrame" src="https://www.youtube.com/embed/${yt}" title="${esc(p.title||"Smart Buwaba video")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
   $("playerActions").innerHTML=`<button class="btn secondary" onclick="downloadPost('${String(id).replace(/'/g,"\\'")}')">⬇ Download</button><span class="small">YouTube videos can be watched/shared here; downloading depends on the source's permissions.</span>`;
 }else if(url){
   $("playerArea").innerHTML=`<div class="player"><video controls autoplay src="${esc(url)}" style="width:100%;border-radius:14px"></video></div>`;
   $("playerActions").innerHTML=`<a class="btn" href="${esc(url)}" download>⬇ Download video</a>`;
 }else{
   $("playerArea").innerHTML=`<div class="empty">This post does not have a video URL yet.</div>`;
   $("playerActions").innerHTML="";
 }
 $("playerModal").classList.remove("hidden");
 renderHome();renderVideos();
}
function openSettings(){ $("settingsModal").classList.remove("hidden") }
function closeModal(id){$(id).classList.add("hidden"); if(id==="playerModal")$("playerArea").innerHTML=""}
function resetPosts(){alert("Smart Buwaba posts are stored in Firestore. Use the Firebase Console to delete database documents.")}
function toggleTheme(el){document.body.style.filter=el.checked?"none":"invert(.92) hue-rotate(180deg)";localStorage.setItem("sb_theme",el.checked?"dark":"light")}
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function loadPosts(){
 try{
   const snap=await db.collection("videos").get();
   posts=snap.docs.map(d=>{
 const data=d.data();
 return {
  id:d.id,...data,
  category:data.category||"Other",
  likeCount:data.likeCount ?? (Array.isArray(data.likes)?data.likes.length:0),
  commentCount:data.commentCount ?? 0,
  viewCount:data.viewCount ?? 0
 };
});
   posts.sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
 }catch(e){
   console.error(e);posts=[];alert("Could not load videos from Firestore. Check Firestore Rules.\n\n"+e.message);
 }
 renderHome();renderVideos();
}

let currentUser=null, currentCommentVideoId=null;
const likedPosts=new Set(JSON.parse(localStorage.getItem("sb_likes")||"[]"));
const followingUsers=new Set(JSON.parse(localStorage.getItem("sb_follows")||"[]"));
let notifications=JSON.parse(localStorage.getItem("sb_notifications")||"[]");

function persistSocial(){
 localStorage.setItem("sb_likes",JSON.stringify([...likedPosts]));
 localStorage.setItem("sb_follows",JSON.stringify([...followingUsers]));
 localStorage.setItem("sb_notifications",JSON.stringify(notifications));
 updateNotifCount();
}
function notify(text){
 notifications.unshift({text,date:new Date().toISOString(),read:false});
 notifications=notifications.slice(0,50);persistSocial();
}
function updateNotifCount(){
 const n=notifications.filter(x=>!x.read).length, el=$("notifCount");
 el.textContent=n;if(n)el.classList.remove("hidden");else el.classList.add("hidden");
}
function openNotifications(){
 notifications.forEach(x=>x.read=true);persistSocial();
 $("notificationList").innerHTML=notifications.length?notifications.map(n=>`<div class="notifItem">🔔 ${esc(n.text)}<div class="muted" style="font-size:11px;margin-top:4px">${new Date(n.date).toLocaleString()}</div></div>`).join(""):`<div class="empty">No notifications yet.</div>`;
 $("notificationsModal").classList.remove("hidden");
}
async function toggleLike(id){
 const key=String(id), p=posts.find(x=>String(x.id)===key); if(!p)return;
 const ref=db.collection("videos").doc(key);
 try{
   if(likedPosts.has(key)){likedPosts.delete(key);p.likeCount=Math.max(0,(p.likeCount||0)-1)}
   else{likedPosts.add(key);p.likeCount=(p.likeCount||0)+1;notify("You liked “"+(p.title||"this video")+"”.")}
   await ref.update({likeCount:p.likeCount});
   renderHome();renderVideos();
 }catch(e){alert("Like could not be saved. Check Firestore Rules.");console.error(e)}
}
function downloadPost(id){
 const p=posts.find(x=>String(x.id)===String(id)); if(!p)return;
 const url=p.videoUrl||p.video||"";
 if(!url){alert("This post has no downloadable video file.");return}
 const yt=getYouTubeId(url);
 if(yt){alert("This is a YouTube video. Smart Buwaba does not download it directly.");return}
 const a=document.createElement("a");a.href=url;a.download=(p.title||"smart-buwaba-video").replace(/[^a-z0-9-_]+/gi,"-")+".mp4";a.target="_blank";document.body.appendChild(a);a.click();a.remove();
}
/* Smart Buwaba professional text moderation.
   This is a first-line client-side filter; Firebase Rules/server-side moderation
   should be added later for stronger enforcement. */
const SB_BLOCKED_WORDS = [
  "fuck","fucking","motherfucker","shit","bullshit","bitch","asshole",
  "bastard","dickhead","piss off","stupid idiot"
];

function normalizeModerationText(text){
  return String(text||"")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[@4]/g,"a")
    .replace(/[3]/g,"e")
    .replace(/[1!|]/g,"i")
    .replace(/[0]/g,"o")
    .replace(/[$5]/g,"s")
    .replace(/[^a-z0-9\s]/g," ")
    .replace(/\s+/g," ")
    .trim();
}

function moderateText(text){
  const clean=normalizeModerationText(text);
  if(!clean) return {ok:true};
  const hit=SB_BLOCKED_WORDS.find(w=>clean.includes(w));
  return hit ? {ok:false,word:hit} : {ok:true};
}

function moderationMessage(){
  return `<div class="moderationNotice">⚠️ Please keep Smart Buwaba respectful. Insults or abusive language are not allowed.</div>`;
}

async function openComments(id){
 currentCommentVideoId=String(id);
 const list=$("commentList");list.innerHTML=`<div class="muted">Loading comments...</div>`;
 $("commentsModal").classList.remove("hidden");
 try{
   const snap=await db.collection("comments").where("videoId","==",currentCommentVideoId).get();
   const arr=snap.docs.map(d=>d.data()).sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
   list.innerHTML=arr.length?arr.map(c=>`<div class="comment">${esc(c.text)}<small>${esc(c.authorName||"Smart Buwaba user")} • ${c.date?new Date(c.date).toLocaleString():""}</small></div>`).join(""):`<div class="empty">No comments yet. Be the first.</div>`;
 }catch(e){list.innerHTML=`<div class="empty">Comments are not available yet. Check Firestore Rules.</div>`;console.error(e)}
}
async function sendComment(){
 const text=$("commentText").value.trim();
 if(!text||!currentCommentVideoId)return;
 if(!currentUser)return openAuth();
 if(text.length>500)return alert("Comment is too long. Please keep it under 500 characters.");
 const moderation=moderateText(text);
 if(!moderation.ok)return alert("Please rewrite your comment respectfully. Abusive language is not allowed on Smart Buwaba.");
 const btn=$("postCommentBtn"); if(btn){btn.disabled=true;btn.textContent="Posting...";}
 try{
   await db.collection("comments").add({videoId:currentCommentVideoId,text,authorId:currentUser.uid,authorName:currentUser.displayName||currentUser.email?.split("@")[0]||"Smart Buwaba user",date:new Date().toISOString()});
   const p=posts.find(x=>String(x.id)===currentCommentVideoId);
   if(p){p.commentCount=(p.commentCount||0)+1;await db.collection("videos").doc(currentCommentVideoId).update({commentCount:p.commentCount});}
   $("commentText").value="";notify("Your comment was posted.");await openComments(currentCommentVideoId);renderHome();renderVideos();
 }catch(e){alert("Comment could not be saved. Check Firestore Rules.");console.error(e)}
 finally{if(btn){btn.disabled=false;btn.textContent="Post comment";}}
}
async function toggleFollow(uid){
 const key=String(uid);if(!key||key==="undefined")return;
 if(followingUsers.has(key)){followingUsers.delete(key);notify("You unfollowed this creator.")}
 else{followingUsers.add(key);notify("You are now following this creator.")}
 persistSocial();renderHome();renderVideos();
}
function getYouTubeId(url){
 try{
   const u=new URL(url);
   if(u.hostname.includes("youtu.be"))return u.pathname.slice(1).split("/")[0];
   if(u.hostname.includes("youtube.com")){
     if(u.pathname==="/watch")return u.searchParams.get("v");
     if(u.pathname.startsWith("/shorts/"))return u.pathname.split("/")[2];
     if(u.pathname.startsWith("/embed/"))return u.pathname.split("/")[2];
   }
 }catch(e){}
 return null;
}
firebase.auth().onAuthStateChanged(u=>{currentUser=u;});
// Anonymous sign-in disabled: users should explicitly sign in or register.
updateNotifCount();

$("year").textContent=new Date().getFullYear();
$("pVideoFile")?.addEventListener("change",function(){
 const f=this.files?.[0], st=$("publishStatus");
 if(f && st){st.style.display="block";st.textContent="Video selected: "+f.name+" ("+(f.size/1024/1024).toFixed(1)+" MB). Ready to upload.";}
});

if(localStorage.getItem("sb_theme")==="light"){$("darkSwitch").checked=false;toggleTheme($("darkSwitch"))}
loadPosts();

/* ===== SMART BUWABA V2 ===== */
const storage = firebase.storage();
const ADMIN_EMAIL = "mmuhammadallie@gmail.com";

/* Smart Buwaba Storage compatibility:
   Firebase projects can use either the newer .firebasestorage.app bucket name
   or the older .appspot.com bucket name. We try the configured bucket first,
   then the legacy bucket if the first one does not start uploading. */
let legacyStorage = null;
try {
  const legacyConfig = {...firebaseConfig, storageBucket:"smartbuwaba-40422.appspot.com"};
  const legacyApp = firebase.apps.find(a => a.name === "smart-buwaba-legacy-storage") || firebase.initializeApp(legacyConfig,"smart-buwaba-legacy-storage");
  legacyStorage = legacyApp.storage();
} catch(e) { console.warn("Legacy Storage bucket unavailable:", e.message); }

let activeChatUser = null;

function safeText(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function isRealAccount(){ return !!currentUser && !currentUser.isAnonymous; }
function isAdmin(){ return isRealAccount() && !!currentUser.email && currentUser.email.toLowerCase()===ADMIN_EMAIL.toLowerCase(); }

function openAuth(){
  const logged=isRealAccount();
  $("authLoggedOut").classList.toggle("hidden",logged);
  $("authLoggedIn").classList.toggle("hidden",!logged);
  if(logged){$("accountName").textContent=currentUser.displayName||"Smart Buwaba user";$("accountEmail").textContent=currentUser.email||"";}
  $("authModal").classList.remove("hidden");
}
async function registerUser(){
 try{
  const name=$("regName").value.trim(), email=$("regEmail").value.trim(), pass=$("regPassword").value;
  if(!name||!email||pass.length<6)return alert("Enter name, email and a password of at least 6 characters.");
  const cred=await firebase.auth().createUserWithEmailAndPassword(email,pass);
  await cred.user.updateProfile({displayName:name});
  await db.collection("users").doc(cred.user.uid).set({uid:cred.user.uid,name,email,createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  currentUser=cred.user; openAuth(); notify("Account created.");
 }catch(e){alert(e.message)}
}
async function signIn(){
 try{const c=await firebase.auth().signInWithEmailAndPassword($("loginEmail").value.trim(),$("loginPassword").value);currentUser=c.user;openAuth();notify("Signed in.");}
 catch(e){alert(e.message)}
}
async function signOut(){await firebase.auth().signOut();closeModal("authModal");notify("Signed out.");}
firebase.auth().onAuthStateChanged(async u=>{
 currentUser=u;
 if($("userLabel")){
   $("userLabel").textContent =
     u ? (u.displayName || u.email?.split("@")[0] || "Smart Buwaba user") : "Sign in";
 }
 if(u){
   try{
     await db.collection("users").doc(u.uid).set({
       uid:u.uid,
       name:u.displayName || u.email?.split("@")[0] || "Smart Buwaba user",
       email:u.email || ""
     },{merge:true});
   }catch(e){}
 }
});

function openCommunityPost(){
 if(!isRealAccount())return openAuth(),alert("Sign in or create an account first to create a community post.");
 $("communityModal").classList.remove("hidden");
}

function uploadToStorageService(storageService,file,path,label,timeoutMs=15000){
 return new Promise((resolve,reject)=>{
  if(!storageService) return reject(new Error("Storage service is unavailable."));
  const ref=storageService.ref().child(path);
  const progress=$("uploadProgress"), status=$("publishStatus");
  if(progress){progress.classList.remove("hidden"); const bar=progress.querySelector("i"); if(bar)bar.style.width="0%";}
  if(status){status.style.display="block";status.textContent=(label||"Uploading file")+" — connecting...";}
  let task, finished=false, timer;
  try { task=ref.put(file,{contentType:file.type||"application/octet-stream",cacheControl:"public,max-age=31536000"}); }
  catch(e){ return reject(e); }
  timer=setTimeout(()=>{
    if(finished)return;
    try{task.cancel();}catch(e){}
    reject(Object.assign(new Error("Upload did not start receiving data from this Firebase Storage bucket."),{code:"storage/no-bytes"}));
  },timeoutMs);
  task.on("state_changed",snap=>{
    const pct=snap.totalBytes?Math.floor((snap.bytesTransferred/snap.totalBytes)*100):0;
    if(progress){const bar=progress.querySelector("i");if(bar)bar.style.width=pct+"%";}
    if(status)status.textContent=(label||"Uploading file")+" — "+pct+"%";
  },err=>{
    finished=true;clearTimeout(timer);reject(err);
  },async()=>{
    try{
      const url=await ref.getDownloadURL();
      finished=true;clearTimeout(timer);resolve(url);
    }catch(e){finished=true;clearTimeout(timer);reject(e);}
  });
 });
}

async function uploadFile(file,path,label){
 if(!file)return "";
 if(file.size > 199*1024*1024) throw new Error("This file is too large. Please use a video smaller than 199 MB.");
 if(!window.firebase || !firebase.storage) throw new Error("Firebase Storage SDK is not loaded. Refresh the page.");
 const status=$("publishStatus");
 if(status){status.style.display="block";status.textContent=(label||"Uploading file")+" — trying Firebase Storage...";}
 const services=[];
 if(storage)services.push({name:"current",service:storage});
 if(legacyStorage)services.push({name:"legacy",service:legacyStorage});
 let lastError=null;
 for(const item of services){
   try{
     if(status)status.textContent=(label||"Uploading file")+" — connecting to "+(item.name==="legacy"?"backup":"Firebase")+" Storage...";
     const url=await uploadToStorageService(item.service,file,path,label,15000);
     if(status)status.textContent=(label||"Uploading file")+" — 100%";
     return url;
   }catch(e){
     lastError=e;
     console.warn("Storage upload attempt failed:",item.name,e?.code,e?.message);
   }
 }
 const code=lastError?.code?" ("+lastError.code+")":"";
 throw new Error("Firebase Storage upload could not start"+code+". Make sure Storage is initialized in Firebase Console and that the Storage bucket shown there matches the website configuration. Also make sure Storage Rules are published.");
}

let publishStatus=null;
async function savePostV2(){
 if(!isAdmin())return openAuth(),alert("Sign in using the Smart Buwaba admin email: "+ADMIN_EMAIL);
 const title=$("pTitle").value.trim();
 const desc=$("pDesc").value.trim();
 if(!title)return alert("Add a title.");
 const moderation=moderateText(title+" "+desc);
 if(!moderation.ok)return alert("Please keep Smart Buwaba respectful. Offensive language is not allowed.");
 const publishBtn=document.querySelector('#postModal .btn');
 publishStatus=document.querySelector('#postModal .publishStatus');
 if(publishBtn){publishBtn.disabled=true;publishBtn.textContent="Publishing...";}
 if(publishStatus)publishStatus.textContent="Preparing your post...";
 try{
  if(!currentUser || currentUser.isAnonymous)throw new Error("Please sign in with the admin email account first.");
  let video=$("pVideo").value.trim(), thumb=$("pThumb").value.trim();
  const vf=$("pVideoFile").files[0], tf=$("pThumbFile").files[0];
  if(!video && !vf){ throw new Error("Add a Video URL or choose a video file before publishing."); }
  const stamp=Date.now();
  if(vf)video=await uploadFile(vf,`videos/${currentUser.uid}/${stamp}_${vf.name}`,"Uploading video");
  if(tf)thumb=await uploadFile(tf,`thumbnails/${currentUser.uid}/${stamp}_${tf.name}`,"Uploading thumbnail");
  if(publishStatus)publishStatus.textContent="Saving post to Smart Buwaba...";
  const post={title,category:$("pCategory").value,description:desc,videoUrl:video,thumbUrl:thumb,ownerId:currentUser.uid,ownerName:currentUser.displayName||currentUser.email,date:new Date().toISOString(),likes:[],viewCount:0,type:"video"};
  const ref=await db.collection("videos").add(post);
  posts.push({...post,id:ref.id});
  ["pTitle","pDesc","pThumb","pVideo"].forEach(x=>$(x).value="");
  $("pVideoFile").value=""; $("pThumbFile").value="";
  if($("uploadProgress")){ $("uploadProgress").classList.add("hidden"); const bar=$("uploadProgress").querySelector("i"); if(bar)bar.style.width="0%";}
  closeModal("postModal"); renderHome();renderVideos();notify("Post uploaded successfully.");
 }catch(e){
  console.error("Smart Buwaba publish error:",e);
  const code=e&&e.code?"\nCode: "+e.code:"";
  alert("Could not publish the video.\n\n"+(e&&e.message?e.message:"Unknown error")+code+"\n\nIf you selected a video file, the website tried both Firebase Storage bucket formats. If you used a Video URL only, check Firestore Rules.");
  if(publishStatus)publishStatus.textContent="Publish failed — check the error message.";
 }finally{
  if(publishBtn){publishBtn.disabled=false;publishBtn.textContent="Publish Post";}
 }
}
const oldSavePost=window.savePost; window.savePost=savePostV2;

async function publishCommunityPost(){
 if(!isRealAccount())return openAuth();
 try{
  const text=$("cText").value.trim(), pf=$("cPhoto").files[0], vf=$("cVideo").files[0];
  if(!text&&!pf&&!vf)return alert("Add some text, a photo, or a video.");
  const moderation=moderateText(text);
  if(!moderation.ok)return alert("Please keep Smart Buwaba respectful. Offensive language is not allowed.");
  let mediaUrl="",mediaType="";
  if(pf){mediaUrl=await uploadFile(pf,`community/${currentUser.uid}/${Date.now()}_${pf.name}`);mediaType="image";}
  if(vf){mediaUrl=await uploadFile(vf,`community/${currentUser.uid}/${Date.now()}_${vf.name}`);mediaType="video";}
  await db.collection("communityPosts").add({text,mediaUrl,mediaType,ownerId:currentUser.uid,ownerName:currentUser.displayName||currentUser.email,createdAt:firebase.firestore.FieldValue.serverTimestamp(),likes:[]});
  $("cText").value="";$("cPhoto").value="";$("cVideo").value="";closeModal("communityModal");loadFeed();notify("Community post published.");
 }catch(e){alert("Could not publish: "+e.message)}
}
async function loadFeed(){
 const box=$("feedList"); if(!box)return;
 try{
  const snap=await db.collection("communityPosts").orderBy("createdAt","desc").limit(50).get();
  if(snap.empty){box.innerHTML='<div class="panel"><div class="muted">No community posts yet. Be the first to post.</div></div>';return;}
  box.innerHTML=snap.docs.map(d=>{const p=d.data(),id=d.id,liked=(p.likes||[]).includes(currentUser?.uid);
   let media=p.mediaType==="image"?`<img class="feedMedia" src="${safeText(p.mediaUrl)}" alt="">`:p.mediaType==="video"?`<video class="feedMedia" controls src="${safeText(p.mediaUrl)}"></video>`:"";
   return `<article class="feedCard"><div class="feedHead"><div class="avatar"></div><div class="feedMeta"><div class="feedName">${safeText(p.ownerName||"User")}</div><div class="feedTime">${p.createdAt?.toDate?p.createdAt.toDate().toLocaleString():"Just now"}</div></div></div><div class="postText">${safeText(p.text)}</div>${media}<div class="actions" style="margin-top:10px"><button class="socialBtn ${liked?"liked":""}" onclick="toggleCommunityLike('${id}')">❤️ ${p.likes?.length||0}</button><button class="socialBtn" onclick="alert('Comments can be added next in the moderation/chat upgrade.')">💬 Comment</button><button class="socialBtn" onclick="sharePost('${id}')">↗ Share</button></div></article>`}).join("");
 }catch(e){box.innerHTML='<div class="panel">Could not load community feed. Check Firestore rules/indexes.</div>'}
}
async function toggleCommunityLike(id){
 if(!currentUser)return openAuth();
 const ref=db.collection("communityPosts").doc(id), snap=await ref.get(), arr=snap.data().likes||[];
 const next=arr.includes(currentUser.uid)?arr.filter(x=>x!==currentUser.uid):[...arr,currentUser.uid];
 await ref.update({likes:next});loadFeed();
}
async function sharePost(id){
 const url=location.href+"#feed/"+id;
 if(navigator.share){try{await navigator.share({title:"Smart Buwaba",url})}catch(e){}}
 else {await navigator.clipboard?.writeText(url);notify("Post link copied.");}
}

async function loadChatUsers(){
 const box=$("chatUsers"); if(!box)return;
 if(!currentUser){box.innerHTML='<div class="muted" style="margin-top:8px">Sign in to chat.</div>';return;}
 const snap=await db.collection("users").limit(30).get();
 box.innerHTML=snap.docs.filter(d=>d.id!==currentUser.uid).map(d=>{const u=d.data();const name=safeText(u.name||u.email||"User");const initials=safeText((u.name||u.email||"U").trim().slice(0,2).toUpperCase());const online=u.online===true;return `<div class="chatUser" onclick="selectChatUser('${d.id}','${name}')"><div class="chatUserAvatar">${initials}${online?'<span class="onlineDot"></span>':''}</div><div class="chatUserInfo"><div class="chatUserName">${name}</div><div class="chatUserStatus">${online?'● Online':'○ Offline'}</div></div></div>`}).join("")||'<div class="muted">No other users yet.</div>';
}
function chatId(a,b){return [a,b].sort().join("_")}
function selectChatUser(uid,name){activeChatUser={uid,name};$("chatTitle").textContent=name;$("chatTopStatus").textContent="● Online";$("chatTopAvatar").firstChild.nodeValue=(name||"SB").slice(0,2).toUpperCase();loadMessages();}
async function loadMessages(){
 if(!activeChatUser||!currentUser)return;
 const id=chatId(currentUser.uid,activeChatUser.uid),box=$("chatMessages");
 const snap=await db.collection("chats").doc(id).collection("messages").orderBy("createdAt","asc").limit(100).get();
 box.innerHTML=snap.docs.map(d=>{const m=d.data();const voice=m.audioUrl?`<audio controls preload="metadata" src="${safeText(m.audioUrl)}" style="max-width:230px;width:100%;margin-top:5px"></audio><div class="muted" style="font-size:11px">${Number(m.audioDuration||0)}s</div>`:"";return `<div class="bubble ${m.senderId===currentUser.uid?"mine":""}">${safeText(m.text||"")}${voice}</div>`}).join("");
 box.scrollTop=box.scrollHeight;
}
let voiceRecorder=null, voiceChunks=[], voiceStream=null, voiceRecordingStartedAt=0;
async function toggleVoiceRecording(){
 if(!isRealAccount())return openAuth();
 if(!activeChatUser)return alert("Select a person first.");
 const btn=$("voiceBtn"), status=$("voiceStatus");
 if(voiceRecorder && voiceRecorder.state==="recording"){ voiceRecorder.stop(); return; }
 try{
   voiceStream=await navigator.mediaDevices.getUserMedia({audio:true});
   const mime=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":(MediaRecorder.isTypeSupported("audio/webm")?"audio/webm":"audio/mp4");
   voiceRecorder=new MediaRecorder(voiceStream,{mimeType:mime}); voiceChunks=[]; voiceRecordingStartedAt=Date.now();
   voiceRecorder.ondataavailable=e=>{if(e.data.size)voiceChunks.push(e.data)};
   voiceRecorder.onstop=async()=>{
     const blob=new Blob(voiceChunks,{type:voiceRecorder.mimeType||"audio/webm"});
     const duration=Math.max(1,Math.round((Date.now()-voiceRecordingStartedAt)/1000));
     voiceStream?.getTracks().forEach(t=>t.stop()); voiceStream=null;
     if(status){status.style.display="block";status.textContent="Sending voice message...";}
     try{
       const form=new FormData(); form.append("file",blob,"smart-buwaba-voice.webm"); form.append("upload_preset","smart buwaba upload");
       const r=await fetch("https://api.cloudinary.com/v1_1/ehwhaqzt/video/upload",{method:"POST",body:form});
       const data=await r.json(); if(!r.ok||!data.secure_url)throw new Error(data.error?.message||"Voice upload failed.");
       const id=chatId(currentUser.uid,activeChatUser.uid);
       await db.collection("chats").doc(id).collection("messages").add({text:"🎙️ Voice message",audioUrl:data.secure_url,audioDuration:duration,senderId:currentUser.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
       await loadMessages();
       if(status){status.textContent="Voice message sent ✓";setTimeout(()=>status.style.display="none",1800);}
     }catch(e){console.error("Voice send error:",e);alert("Voice message could not be sent. "+(e?.message||"Unknown error"));if(status)status.style.display="none";}
     if(btn){btn.disabled=false;btn.textContent="🎙️";}
   };
   voiceRecorder.start(); if(btn){btn.textContent="⏹️";} if(status){status.style.display="block";status.textContent="Recording... tap ⏹️ to send";}
 }catch(e){alert("Microphone permission is required to record voice messages.");console.error(e);if(btn){btn.disabled=false;btn.textContent="🎙️";}}
}
async function sendChat(){
 if(!isRealAccount())return openAuth();
 if(!activeChatUser)return alert("Select a person first.");
 const text=$("chatText").value.trim();if(!text)return;
 const btn=document.querySelector('.chatInput .btn');
 if(btn){btn.disabled=true;btn.textContent="Sending...";}
 try{
   const id=chatId(currentUser.uid,activeChatUser.uid);
   await db.collection("chats").doc(id).collection("messages").add({
     text,
     senderId:currentUser.uid,
     createdAt:firebase.firestore.FieldValue.serverTimestamp()
   });
   $("chatText").value="";
   await loadMessages();
 }catch(e){
   console.error("Chat send error:",e);
   alert("Message could not be sent.\n\n"+(e?.message||"Unknown error")+"\n\nCheck that the Firestore Rules below are published in Firebase Console.");
 }finally{
   if(btn){btn.disabled=false;btn.textContent="Send";}
 }
}

function addAI(text,who){
 const box=$("aiMessages");box.insertAdjacentHTML("beforeend",`<div class="aiMsg ${who==="user"?"user":""}">${safeText(text)}</div>`);box.scrollTop=box.scrollHeight;
}
let cameraStream=null, mediaRecorder=null, recordedChunks=[], cameraMedia=null;
async function startCamera(){
 try{
  if(cameraStream)return;
  cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:true});
  $("cameraPreview").srcObject=cameraStream;
 }catch(e){alert("Camera access failed. Please allow camera/microphone permission and use HTTPS.");console.error(e);}
}
function stopCamera(){
 if(mediaRecorder&&mediaRecorder.state!=="inactive")mediaRecorder.stop();
 if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}
 const v=$("cameraPreview"); if(v)v.srcObject=null;
}
function capturePhoto(){
 if(!cameraStream)return startCamera().then(capturePhoto);
 const v=$("cameraPreview"),c=$("cameraCanvas"); c.width=v.videoWidth||640;c.height=v.videoHeight||480;
 c.getContext("2d").drawImage(v,0,0,c.width,c.height);
 cameraMedia={blob:null,type:"image",preview:c.toDataURL("image/jpeg",.9)};
 c.toBlob(b=>{cameraMedia.blob=b},"image/jpeg",.9);
 $("cameraResult").innerHTML='<img src="'+cameraMedia.preview+'" style="max-width:100%;border-radius:14px">';
}
function toggleRecording(){
 if(!cameraStream)return startCamera().then(toggleRecording);
 if(mediaRecorder&&mediaRecorder.state==="recording"){mediaRecorder.stop();return;}
 recordedChunks=[];
 try{mediaRecorder=new MediaRecorder(cameraStream,{mimeType:"video/webm"});}catch(e){mediaRecorder=new MediaRecorder(cameraStream);}
 mediaRecorder.ondataavailable=e=>{if(e.data.size)recordedChunks.push(e.data)};
 mediaRecorder.onstop=()=>{const blob=new Blob(recordedChunks,{type:mediaRecorder.mimeType||"video/webm"});cameraMedia={blob,type:"video",preview:URL.createObjectURL(blob)};$("cameraResult").innerHTML='<video controls src="'+cameraMedia.preview+'" style="max-width:100%;border-radius:14px"></video>';$("recordBtn").textContent="🔴 Start Recording"};
 mediaRecorder.start();$("recordBtn").textContent="⏹ Stop Recording";
}
async function postCameraMedia(){
 if(!currentUser)return openAuth();
 if(!cameraMedia?.blob)return alert("Take a photo or record a video first.");
 try{
  const ext=cameraMedia.type==="image"?"jpg":"webm";
  const path=`community/${currentUser.uid}/camera_${Date.now()}.${ext}`;
  const url=await uploadFile(cameraMedia.blob,path);
  await db.collection("communityPosts").add({ownerId:currentUser.uid,ownerName:currentUser.displayName||currentUser.email?.split("@")[0]||"User",text:"Created with Smart Buwaba Camera",mediaUrl:url,mediaType:cameraMedia.type,likes:[],createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  notify("Camera post published!");showPage("feed");loadFeed();
 }catch(e){alert("Camera post failed: "+e.message);console.error(e)}
}
const SB_DEFAULT_AI_BACKEND="https://smart-buwaba-ai-theta.vercel.app/api/chat";
function sbAIEndpoint(){
 const v=(localStorage.getItem("sb_ai_backend")||"").trim();
 return /^https?:\/\//i.test(v)&&!/git-main-smartbuwaba-art\.vercel\.app/i.test(v)?v:SB_DEFAULT_AI_BACKEND;
}
let sbAIHistory=JSON.parse(localStorage.getItem("sb_ai_history")||"[]");
function saveAIHistory(){localStorage.setItem("sb_ai_history",JSON.stringify(sbAIHistory.slice(-24)));}
function restoreAIHistory(){
 const box=$("aiMessages"); if(!box)return;
 const saved=sbAIHistory.slice(-20); if(!saved.length)return;
 box.innerHTML="";
 saved.forEach(x=>addAI(x.content,x.role==="user"?"user":"ai"));
}
async function askAI(){
 const input=$("aiText"),q=input.value.trim();if(!q)return;
 addAI(q,"user"); input.value="";
 sbAIHistory.push({role:"user",content:q}); saveAIHistory();
 const btn=input.parentElement?.querySelector("button"); if(btn){btn.disabled=true;btn.textContent="…";}
 const status=$("aiStatus"); if(status)status.textContent="AI: thinking…";
 try{
  const r=await fetch(sbAIEndpoint(),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,history:sbAIHistory.slice(-12)})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.error||data.detail||("Server error "+r.status));
  const answer=String(data.reply||"").trim()||"Pepani bro, AI sinapeze yankho pano.";
  addAI(answer,"ai"); sbAIHistory.push({role:"assistant",content:answer}); saveAIHistory();
  if(status)status.textContent="AI: connected • Smart Buwaba AI";
 }catch(e){
  console.error("Remote AI error:",e);
  if(status)status.textContent="AI: connection failed";
  addAI("Pepani bro, AI server sikuyankha pano. Tionenso backend/Vercel connection.","ai");
 }finally{if(btn){btn.disabled=false;btn.textContent="Ask";}}
}
window.addEventListener("load",restoreAIHistory);
const SB_DEFAULT_IMAGE_BACKEND="https://smart-buwaba-ai-theta.vercel.app/api/image";
function sbImageEndpoint(){
 const v=(localStorage.getItem("sb_ai_image_backend")||"").trim();
 return /^https?:\/\//i.test(v)&&!/git-main-smartbuwaba-art\.vercel\.app/i.test(v)?v:SB_DEFAULT_IMAGE_BACKEND;
}
function clearAIImage(){
 const f=$("aiImageFile"),p=$("aiImagePrompt"),r=$("aiImageResult"),st=$("aiImageStatus");
 if(f)f.value=""; if(p)p.value=""; if(r)r.innerHTML=""; if(st)st.textContent="";
}
function fileToDataURL(file){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(file);});}
async function generateAIImage(){
 const prompt=$("aiImagePrompt")?.value.trim(); const file=$("aiImageFile")?.files?.[0];
 const st=$("aiImageStatus"),out=$("aiImageResult");
 if(!prompt){alert("Write what you want the AI to create or edit first.");return;}
 if(file&&file.size>10*1024*1024){alert("Please use an image smaller than 10 MB.");return;}
 try{
  if(st)st.textContent="Image AI: creating..."; if(out)out.innerHTML="";
  const body={prompt}; if(file)body.imageData=await fileToDataURL(file);
  const r=await fetch(sbImageEndpoint(),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await r.json().catch(()=>({})); if(!r.ok)throw new Error(data.error||data.detail||("Server error "+r.status));
  if(!data.image)throw new Error("Image service returned no image.");
  if(out)out.innerHTML=`<img src="${esc(data.image)}" alt="AI generated image" style="width:100%;max-width:760px;border-radius:16px;border:1px solid var(--line);display:block"><div class="actions" style="margin-top:9px"><a class="btn" href="${data.image}" download="smart-buwaba-ai-image.png">⬇ Save Image</a></div>`;
  if(st)st.textContent="Image AI: ready";
 }catch(e){console.error("Image AI error",e);if(st)st.textContent="Image AI: connection failed";if(out)out.innerHTML=`<div class="note">Image AI failed: ${esc(e.message||String(e))}</div>`;}
}


const oldShowPage=window.showPage;
window.showPage=function(id){oldShowPage(id);if(id==="feed")loadFeed();if(id==="chat")loadChatUsers();};


const _openAddPost = window.openAddPost;
window.openAddPost = function(){
 if(!isAdmin()){
   openAuth();
   if(!isRealAccount()) notify("Sign in with the Smart Buwaba admin account to publish official Smart Buwaba videos.");
   else alert("Only the Smart Buwaba admin account can publish official Smart Buwaba videos.\n\nAdmin: mmuhammadallie@gmail.com");
   return;
 }
 _openAddPost();
};

