"use strict";
// Holdings come only from explicit wallet reads. Portfolio valuation/history need their own service.
window.createAPlusPortfolio = () => {
 const $ = id => document.getElementById(id);
 document.querySelectorAll("[data-range]").forEach(button => {
  button.disabled = true;
  button.title = "Portfolio history is not connected";
 });
 $("portfolio-chart").setAttribute("aria-label", "Portfolio history unavailable");
 function render(view) {
  $("portfolio-account").textContent = view.account || "Not connected";
  $("portfolio-native").textContent = view.readable ? view.balance : "—";
  const body = $("portfolio-asset-rows"); body.replaceChildren();
  if (!view.rows.length) {
   const tr = document.createElement("tr"), td = document.createElement("td");
   td.colSpan = 5; td.className = "empty-cell"; td.textContent = view.hasHoldings ? "No displayed holdings match this filter." : "No holdings loaded. Manage wallet balance reads in Accounts.";
   tr.append(td); body.append(tr); return;
  }
  for (const row of view.rows) {
   const tr = document.createElement("tr");
   for (const value of [row.name, row.categoryName, row.quantity, "—", row.category === "native" ? "Wallet read" : "Contract read · unverified"]) {
    const td = document.createElement("td"); td.textContent = value; tr.append(td);
   }
   body.append(tr);
  }
 }
 return {render};
};
