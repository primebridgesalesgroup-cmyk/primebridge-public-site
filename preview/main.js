"use strict";
const pages={
dashboard:["Exchange Overview","Verified asset exchange workspace",["Asset Markets","Tokenization Center","Trading Terminal","Settlement & Fulfillment","Network Analytics"]],
inventory:["Asset Markets & Inventory","Verified assets, listings and reservations",["Browse asset classes","Verified asset registry","Inventory reservations"]],
trading:["Trading Terminal","Seller-to-buyer orders and authorization",["Seller listings","Buyer offers","Trade authorization"]],
checkout:["Settlement","Controlled checkout and transaction integrity",["Authorized checkout","Settlement controls","Receipts & reconciliation"]],
fulfillment:["Fulfillment","Asset handoff, shipping and verified delivery",["Asset release","Shipping & receiving","Verified delivery"]],
analytics:["Exchange Analytics","Evidence-based operational reporting",["Asset metrics","Trading metrics","Reconciliation exports"]],
blockchain:["Tokenization & Blockchain","Verified asset rights and transaction evidence",["Asset verification","Tokenization readiness","Blockchain evidence"]]
};
const lifecycle = [
  ["01", "Seller onboarding", "Register the seller and validate identity, eligibility, and authority to list."],
  ["02", "Asset verification", "Validate evidence, legal rights, asset identity, quantity, and independent approval."],
  ["03", "Tokenization controls", "Define enforceable rights and check issuance, encumbrance, and redemption limits before any token is created."],
  ["04", "Exchange matching", "Present eligible listings and require buyer/seller authorization before an order."],
  ["05", "Settlement & delivery", "Coordinate authorized checkout, payment-provider settlement, and verified asset fulfillment."],
  ["06", "Audit & reconciliation", "Reconcile inventory, delivery evidence, transaction state, and validated blockchain receipts."]
];
function appendLifecycle(area) {
  const section=document.createElement("section");
  section.className="lifecycle";
  section.setAttribute("aria-label","Asset exchange lifecycle");
  const heading=document.createElement("h2");
  heading.textContent="How the A+ asset exchange works";
  const description=document.createElement("p");
  description.textContent="Planned workflow · informational only · real transactions and token issuance are not enabled.";
  const steps=document.createElement("div");
  steps.className="lifecycle-steps";
  for(const [number,name,detail] of lifecycle) {
    const card=document.createElement("article");
    card.className="card lifecycle-step";
    const marker=document.createElement("span");
    marker.className="tag";
    marker.textContent="STEP "+number;
    const title=document.createElement("h3");
    title.textContent=name;
    const body=document.createElement("p");
    body.textContent=detail;
    card.append(marker,title,body);
    steps.append(card);
  }
  section.append(heading,description,steps);
  area.append(section);
}
function render(){
let key="";
try{key=decodeURIComponent(location.hash.slice(1));}catch{key="dashboard";}
const page=Object.prototype.hasOwnProperty.call(pages,key)?key:"dashboard";
if(key && key!==page){history.replaceState(null,"",location.pathname+location.search+"#dashboard");}
const [title,description,items]=pages[page];
document.title=title+" | A+ Ecosystem";
const hero=document.getElementById("home-hero");if(hero)hero.hidden=page!=="dashboard";
const label=document.getElementById("section-label");if(label)label.textContent=page==="dashboard"?"EXPLORE THE PLATFORM":"PLATFORM MODULE";
document.getElementById("breadcrumb").textContent=title;
document.getElementById("page-title").textContent=title;
document.getElementById("page-description").textContent=description;
const area=document.getElementById("content");
area.replaceChildren();
for(const name of items){
const card=document.createElement("article");card.className="card";
const tag=document.createElement("span");tag.className="tag";tag.textContent="DEVELOPMENT PREVIEW";
const heading=document.createElement("h2");heading.textContent=name;
const detail=document.createElement("p");detail.textContent="Integration pending. No live listings, balances, token issuance, orders, or settlement are available.";
card.append(tag,heading,detail);area.append(card);
}
if(page==="dashboard" || page==="blockchain")appendLifecycle(area);
if(page==="inventory"){
const section=document.createElement("section");
section.className="lifecycle";
section.setAttribute("aria-label","Seller asset verification requirements");
const heading=document.createElement("h2");
heading.textContent="Seller asset verification";
const note=document.createElement("p");
note.textContent="Listing readiness checklist only. This public preview does not collect identity documents, store assets, or issue tokens.";
const requirements=[
["Seller identity","Verify the seller and their authority to act"],
["Asset record","Record asset identity, category, quantity and location"],
["Ownership evidence","Validate custody, title and transfer restrictions"],
["Independent review","Confirm eligibility, evidence and asset condition"],
["Token rights","Define issuance limits, redemption and legal rights"],
["Listing approval","Authorize a listing before buyers can trade"]
];
const grid=document.createElement("div");
grid.className="lifecycle-steps";
for(const [name,detail] of requirements){
const card=document.createElement("article");card.className="card";
const title=document.createElement("h3");title.textContent=name;
const text=document.createElement("p");text.textContent=detail;
card.append(title,text);grid.append(card);
}
section.append(heading,note,grid);area.append(section);
}

for(const link of document.querySelectorAll("[data-view]")){
if(link.dataset.view===page)link.setAttribute("aria-current","page");
else link.removeAttribute("aria-current");
}
}
window.addEventListener("hashchange",render);
window.addEventListener("pageshow",render);
render();

/**
 * Opt-in authenticated metadata reader for future same-origin integration.
 * No token persistence, no automatic requests, no write methods.
 * Caller supplies a short-lived token directly; never expose it in URLs.
 */
async function readScopedMetadata(kind, resourceId, token, fetchImpl = fetch) {
  const routes = {inventory_batch: "inventory/batches", trade: "trades"};
  if (!Object.prototype.hasOwnProperty.call(routes, kind) ||
      typeof resourceId !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/.test(resourceId) ||
      typeof token !== "string" || token.length === 0) {
    throw new TypeError("Invalid authenticated metadata request");
  }
  const response = await fetchImpl(
    "/api/v1/" + routes[kind] + "/" + encodeURIComponent(resourceId),
    {method: "GET", credentials: "same-origin", cache: "no-store",
     headers: {Authorization: "Bearer " + token, Accept: "application/json"}}
  );
  if (!response.ok) {
    throw new Error("Metadata unavailable");
  }
  return response.json();
}
