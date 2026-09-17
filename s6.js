
// Smart Buwaba navigation safety layer
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[onclick=\"openSettings()\"]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();openSettings();}));
  document.querySelectorAll("[onclick=\"openAuth()\"]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();openAuth();}));
});
