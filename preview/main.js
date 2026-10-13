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