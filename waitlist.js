"use strict";
(() => {
  const form=document.getElementById("waitlist-form");
  if(!form)return;
  const fields=document.getElementById("waitlist-fields");
  const status=document.getElementById("waitlist-status");
  const send=document.getElementById("waitlist-send");
  const load=document.getElementById("waitlist-captcha");
  const endpoint="https://api.web3forms.com/submit";
  // Web3Forms public form identifier, not a mailbox password or validator secret.
  const access_key="6aace9f5-88b7-41d8-a387-4b20f43378d7";
  let sending=false,accepted=false,uncertain=false;
  const report=s=>{status.textContent=s};
  fields.disabled=false;send.disabled=false;
  report("No registration has been sent. Complete the consent and spam check before registering.");
  load.addEventListener("click",()=>{
    if(load.disabled)return;
    load.disabled=true;
    const script=document.createElement("script");
    script.src="https://web3forms.com/client/script.js";
    script.async=true;
    script.onerror=()=>{script.remove();load.disabled=false;report("Spam protection could not load. Nothing was submitted.");};
    document.head.append(script);
    report("Complete the spam check to register.");
  });
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(sending||accepted||uncertain)return;
    if(!form.checkValidity()){form.reportValidity();return;}
    const email=form.elements.namedItem("email").value.trim();
    const name=form.elements.namedItem("name").value.trim();
    const role=form.elements.namedItem("role").value;
    if(!email||email.length>254||name.length>100||!["asset-owner","merchant","technology","other"].includes(role)||!form.elements.namedItem("consent").checked){
      report("Complete the required fields and consent. Nothing was sent.");return;
    }
    if(form.elements.namedItem("botcheck").value){report("Request blocked.");return;}
    const token=form.querySelector('[name="h-captcha-response"]')?.value;
    if(!token){report("Complete the spam protection challenge before joining.");return;}
    if(!navigator.onLine){report("Offline. Nothing was submitted.");return;}
    const payload={access_key,subject:"A+ launch waitlist — explicit opt-in",from_name:"A+ launch waitlist",email,name,interest:role,
      consent:"I explicitly request A+ product launch announcement emails. I may unsubscribe by emailing primebridgesalesgroup@gmail.com with subject UNSUBSCRIBE A+.",
      "h-captcha-response":token,botcheck:false};
    sending=true;fields.disabled=true;send.textContent="Registering…";form.setAttribute("aria-busy","true");
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
        credentials:"omit",cache:"no-store",referrerPolicy:"no-referrer",redirect:"error",signal:controller.signal,body:JSON.stringify(payload)});
      const result=await response.json();
      if(response.ok&&result?.success===true){
        accepted=true;form.reset();
        report("Your launch interest was accepted by our form provider. This does not confirm email inbox delivery or platform access. Please avoid duplicate submissions.");
      }else if(response.status>=400&&response.status<500&&result?.success===false){
        report("Registration was rejected. Your information remains here; complete a new spam check or contact primebridgesalesgroup@gmail.com.");
      }else{uncertain=true;report("Registration status is uncertain. It may have arrived. Contact us before submitting again.");}
    }catch{uncertain=true;report("Registration status is uncertain. Contact us before submitting again.");}
    finally{
      clearTimeout(timeout);sending=false;form.removeAttribute("aria-busy");
      fields.disabled=accepted||uncertain;send.disabled=accepted||uncertain;
      send.textContent=accepted?"Registration accepted":uncertain?"Check before resending":"Join launch waitlist";
      try{window.hcaptcha?.reset()}catch{}
    }
  });
})();
