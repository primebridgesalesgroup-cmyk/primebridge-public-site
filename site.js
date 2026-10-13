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
