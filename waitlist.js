"use strict";
// Registration is intentionally gated: no subscriber data is collected or sent
// until a separate opt-in service, privacy notice and production-origin delivery
// tests are verified. The existing service-inquiry endpoint is not a marketing list.
(() => {
  const form = document.getElementById("waitlist-form");
  if (!form) return;
  form.addEventListener("submit", event => event.preventDefault());
  const captcha = document.getElementById("waitlist-captcha");
  if (captcha) captcha.disabled = true;
  const status = document.getElementById("waitlist-status");
  if (status) status.textContent = "Registration is not open yet. No details are collected or submitted. Check this page for launch announcements.";
})();
