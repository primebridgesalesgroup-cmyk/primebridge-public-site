"use strict";
const year=document.getElementById("year");
if(year)year.textContent=String(new Date().getFullYear());
const toggle=document.querySelector(".menu-toggle");
const nav=document.getElementById("site-nav");
if(toggle&&nav){
  toggle.addEventListener("click",()=>{
    const open=toggle.getAttribute("aria-expanded")!=="true";
    toggle.setAttribute("aria-expanded",String(open));
    nav.classList.toggle("open",open);
  });
  nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
    toggle.setAttribute("aria-expanded","false");
    nav.classList.remove("open");
  }));
}

const sections=[...document.querySelectorAll("main section[id]")];
const sectionLinks=[...document.querySelectorAll('#site-nav a[href^="#"]')];
function syncActiveNavigation(){
  const hash=window.location.hash;
  for(const link of sectionLinks){
    if(hash && link.getAttribute("href")===hash)link.setAttribute("aria-current","location");
    else link.removeAttribute("aria-current");
  }
}
window.addEventListener("hashchange",syncActiveNavigation);
syncActiveNavigation();
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&toggle&&nav&&nav.classList.contains("open")){
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded","false");
    toggle.focus();
  }
});
