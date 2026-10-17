"use strict";
(() => {
  // Enabled for owner-authorized release after protected inbox verification.
  // This flag is a rollout switch, not an authentication control.
  const DELIVERY_ENABLED = true;
  // Web3Forms defines this as a public form identifier, never a mailbox credential.
  const ACCESS_KEY = "6aace9f5-88b7-41d8-a387-4b20f43378d7";
  const ENDPOINT = "https://api.web3forms.com/submit";
  if (!DELIVERY_ENABLED) return;
  const form = document.getElementById("delivery-form");
  if (!form) return;
  const panel = document.getElementById("inquiry-delivery");
  const fields = document.getElementById("delivery-fields");
  const status = document.getElementById("delivery-status");
  const button = document.getElementById("send-inquiry");
  const loadCaptcha = document.getElementById("load-inquiry-captcha");
  const field = name => form.elements.namedItem(name);
  let busy = false;
  let accepted = false;
  let uncertain = false;
  const report = message => { status.textContent = message; };
  const resetCaptcha = () => {
    try { window.hcaptcha?.reset(); } catch { /* Keep customer details on failure. */ }
  };
  loadCaptcha.addEventListener("click", () => {
    if (loadCaptcha.disabled) return;
    loadCaptcha.disabled = true;
    report("Loading spam protection. Complete the check before sending.");
    const script = document.createElement("script");
    script.src = "https://web3forms.com/client/script.js";
    script.async = true;
    script.onerror = () => {
      script.remove();
      loadCaptcha.disabled = false;
      report("Spam protection could not load. Nothing was sent. Try loading it again or email primebridgesalesgroup@gmail.com.");
    };
    document.head.append(script);
  });
  form.addEventListener("reset", event => {
    if (busy) { event.preventDefault(); return; }
    // Keep accepted/uncertain locked until an intentional fresh page load, so a
    // reset or double click cannot resend an accepted or ambiguous request.
    resetCaptcha();
    report(accepted ? "Web3Forms accepted your inquiry. Inbox delivery is not confirmed here." : uncertain ? "The earlier request may have arrived. Contact us before sending another copy." : "Fields cleared. Nothing was sent.");
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || accepted || uncertain || !form.reportValidity()) return;
    for (const name of ["name", "area", "message"]) {
      if (!field(name).value.trim()) {
        report("Enter a name, general area, and project summary using more than spaces.");
        field(name).focus();
        return;
      }
    }
    if (field("botcheck").checked) { report("Request blocked. Nothing was sent."); return; }
    const token = form.querySelector('[name="h-captcha-response"]')?.value;
    if (!token) { report("Load and complete the spam check before sending. Nothing was sent."); return; }
    if (!navigator.onLine) { report("You appear to be offline. Nothing was sent. Reconnect before trying again."); return; }
    // Explicit allowlist; no arbitrary form fields, URLs, cookies or private APIs.
    const payload = {
      access_key: ACCESS_KEY,
      subject: "A+ Global Asset Network — customer service inquiry",
      from_name: "Prime Bridge website inquiries",
      name: field("name").value.trim(),
      email: field("email").value.trim(),
      service: field("service").value,
      request_type: field("request_type").value,
      area: field("area").value.trim(),
      message: field("message").value.trim(),
      inquiry_acknowledgment: "Customer requested a reply about this inquiry; no marketing signup.",
      "h-captcha-response": token,
      botcheck: false
    };
    busy = true;
    fields.disabled = true;
    button.textContent = "Sending…";
    report("Sending your inquiry once. Please wait.");
    form.setAttribute("aria-busy", "true");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer",
        redirect: "error", signal: controller.signal, body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok && result?.success === true) {
        accepted = true;
        // Clear customer details only after explicit provider acceptance.
        busy = false;
        form.reset();
        fields.disabled = true;
        report("Web3Forms accepted your inquiry for processing. This does not confirm inbox delivery, a booking, a quote, or project acceptance. Please do not send another copy.");
      } else if (response.status >= 400 && response.status < 500 && result?.success === false) {
        report(response.status === 429 ? "The service is temporarily limited. Your details are still here. Wait before trying again, or email primebridgesalesgroup@gmail.com." : "The service rejected this request. Your details are still here. Complete a new spam check before retrying, or email primebridgesalesgroup@gmail.com.");
      } else {
        uncertain = true;
        report("Delivery could not be confirmed. Your request may have arrived. Your details are still here; contact primebridgesalesgroup@gmail.com before sending another copy.");
      }
    } catch {
      uncertain = true;
      report("Delivery could not be confirmed. Your request may have arrived. Your details are still here; contact primebridgesalesgroup@gmail.com before sending another copy.");
    } finally {
      clearTimeout(timer);
      busy = false;
      form.removeAttribute("aria-busy");
      fields.disabled = accepted;
      button.disabled = accepted || uncertain;
      button.textContent = accepted ? "Inquiry accepted for processing" : uncertain ? "Check delivery before resending" : "Send inquiry";
      resetCaptcha();
    }
  });
  panel.hidden = false;
  fields.disabled = false;
})();
