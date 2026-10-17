"use strict";
// Deliberately local only: no endpoint, storage, analytics, or automatic delivery.
(() => {
  const form = document.getElementById("inquiry-form");
  if (!form) return;
  const output = document.getElementById("inquiry-draft");
  const status = document.getElementById("inquiry-status");
  const copy = document.getElementById("copy-inquiry");
  const field = name => form.elements.namedItem(name);
  const clear = () => {
    output.value = "";
    copy.disabled = true;
    status.textContent = "Draft cleared. Nothing has been sent.";
  };
  // Any change invalidates the previous draft so outdated details cannot be copied.
  form.addEventListener("input", clear);
  form.addEventListener("change", clear);
  form.addEventListener("reset", clear);
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const service = field("service");
    const kind = field("request-kind");
    output.value = [
      "Prime Bridge Sales Group Corp — inquiry draft",
      "Service: " + service.options[service.selectedIndex].text,
      "Request: " + kind.options[kind.selectedIndex].text,
      "General project area: " + field("area").value.trim(),
      "Project summary: " + field("summary").value.trim(),
      "",
      "Prepared locally only. Not sent, booked, accepted, or quoted.",
      "Scope, qualifications, availability, and pricing require separate confirmation."
    ].join("\n");
    copy.disabled = false;
    status.textContent = "Draft ready for review. Nothing has been sent. Delivery is not available yet.";
    output.focus();
  });
  copy.addEventListener("click", async () => {
    const draft = output.value;
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      if (output.value === draft) status.textContent = "Draft copied to your clipboard. Nothing has been sent.";
    } catch {
      if (output.value !== draft) return;
      status.textContent = "Clipboard unavailable. Select and copy the draft manually. Nothing has been sent.";
      output.focus();
      output.select();
    }
  });
  // Enable only after handlers are installed; without JavaScript no values can submit.
  document.getElementById("inquiry-fields").disabled = false;
})();
