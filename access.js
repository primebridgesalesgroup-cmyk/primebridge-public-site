"use strict";
(() => {
 const mode = new URLSearchParams(location.search).get("mode");
 const variants = {register:["Create your account","Customer registration will open when secure account access is released."],recovery:["Recover your account","Secure recovery will be available when the identity service is connected."]};
 if (Object.hasOwn(variants,mode)) {
  document.getElementById("access-heading").textContent=variants[mode][0];
  document.getElementById("access-intro").textContent=variants[mode][1];
 }
 document.getElementById("access-form").addEventListener("submit",event=>event.preventDefault());
})();
