"use strict";
const pages={
dashboard:["Dashboard","A+ operational overview",["Inventory","Trading","Blockchain"]],
inventory:["Inventory","Inventory and reservations",["Inventory records","Reservations","Reconciliation"]],
trading:["Trading","Order lifecycle and matching",["Orders","Product matching","Trade authorization"]],
checkout:["Checkout","Transaction integrity and checkout",["Checkout","Idempotency","Receipts"]],
fulfillment:["Fulfillment","Shipping, receiving, and verified delivery",["Coordination","Shipping","Delivery"]],
analytics:["Analytics","Operational metrics and reporting",["Trade metrics","Reporting","Exports"]],
blockchain:["Blockchain","Energy Coin Sepolia testnet development",["Energy Coin","Wallet","Transactions"]]
};
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
const detail=document.createElement("p");detail.textContent="Preview only. No authenticated API or blockchain transaction connection.";
card.append(tag,heading,detail);area.append(card);
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
