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
for(const section of document.querySelectorAll(".exchange-overview, .market-panel"))section.hidden=page!=="dashboard";
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
const detail=document.createElement("p");detail.textContent="Preview only. No authenticated API is connected. Integration pending. No live listings, balances, token issuance, orders, or settlement are available.";
card.append(tag,heading,detail);area.append(card);
}
if(page==="dashboard" || page==="blockchain")appendLifecycle(area);
if(page==="blockchain"){
  const panel=document.createElement("section");
  panel.className="tokenization-panel";
  panel.setAttribute("aria-label","Tokenization process explorer");
  const title=document.createElement("h2");title.textContent="Tokenization architecture";
  const intro=document.createElement("p");
  intro.textContent="Explore the approval gates for representing real-world asset rights. This is an educational workflow, not an issuance service.";
  const stages=[
    ["Asset registration","Create a controlled asset record with seller authority and evidence."],
    ["Independent verification","Confirm identity, title, custody, quantity, restrictions and independent review."],
    ["Legal rights mapping","Define exactly what the token represents, who may hold it, and redemption rules."],
    ["Compliance authorization","Approve eligibility, transfer restrictions, jurisdiction and issuance limits."],
    ["Controlled issuance","Only an authorized production backend may sign and submit a blockchain transaction."],
    ["Reconciliation","Compare issuance receipts with the asset registry, inventory, settlement and custody records."]
  ];
  const tabs=document.createElement("div");tabs.className="token-stage-tabs";tabs.setAttribute("role","group");tabs.setAttribute("aria-label","Tokenization stages");
  const detail=document.createElement("div");detail.className="token-stage-detail";
  const stepName=document.createElement("h3");const stepDescription=document.createElement("p");
  const stepWarning=document.createElement("p");stepWarning.className="asset-detail-warning";
  stepWarning.textContent="ARCHITECTURE PREVIEW · No token is created, signed, transferred or issued.";
  detail.append(stepName,stepDescription,stepWarning);
  const buttons=[];
  stages.forEach(([name,description],index)=>{
    const button=document.createElement("button");button.type="button";
    button.textContent=String(index+1).padStart(2,"0")+" · "+name;
    button.addEventListener("click",()=>{
      buttons.forEach(item=>item.setAttribute("aria-pressed","false"));
      button.setAttribute("aria-pressed","true");
      stepName.textContent=name;stepDescription.textContent=description;
    });
    tabs.append(button);buttons.push(button);
  });
  buttons[0].click();
  panel.append(title,intro,tabs,detail);
  area.prepend(panel);
}

if(page==="inventory" || page==="trading"){
  const market=document.createElement("section");
  market.className="market-workspace";
  market.setAttribute("aria-label","Interactive illustrative asset market");
  const head=document.createElement("div");
  head.className="market-workspace-head";
  const title=document.createElement("h2");
  title.textContent="Asset market explorer";
  const note=document.createElement("p");
  note.textContent="Interactive demonstration · all assets below are fictional examples, not verified listings or offers.";
  head.append(title,note);
  const tools=document.createElement("div");
  tools.className="market-controls";
  const search=document.createElement("input");
  search.type="search";search.placeholder="Search example assets";search.setAttribute("aria-label","Search example assets");
  const filter=document.createElement("select");
  filter.setAttribute("aria-label","Filter asset class");
  for(const name of ["All asset classes","Commodities","Equipment","Energy","Materials","Inventory"]){
    const option=document.createElement("option");option.value=name;option.textContent=name;filter.append(option);
  }
  tools.append(search,filter);
  const tableWrap=document.createElement("div");
  tableWrap.className="market-table-scroll";
  const table=document.createElement("table");
  table.className="market-table";
  const thead=document.createElement("thead");
  const headerRow=document.createElement("tr");
  for(const name of ["Asset example","Class","Illustrative unit","Verification","Action"]){
    const cell=document.createElement("th");cell.scope="col";cell.textContent=name;headerRow.append(cell);
  }
  thead.append(headerRow);
  const tbody=document.createElement("tbody");
  table.append(thead,tbody);tableWrap.append(table);
  const examples=[
    ["Industrial copper lot","Commodities","Metric ton"],
    ["Commercial excavator","Equipment","Unit"],
    ["Solar generation rights","Energy","Defined right"],
    ["Structural steel batch","Materials","Metric ton"],
    ["Warehouse inventory lot","Inventory","Lot"],
    ["Agricultural grain lot","Commodities","Metric ton"]
  ];
  const renderRows=()=>{
    tbody.replaceChildren();
    const term=search.value.trim().toLowerCase();
    const selected=filter.value;
    const matches=examples.filter(item=>(selected==="All asset classes"||item[1]===selected)&&item.join(" ").toLowerCase().includes(term));
    for(const item of matches){
      const row=document.createElement("tr");
      for(const value of item){
        const cell=document.createElement("td");cell.textContent=value;row.append(cell);
      }
      const status=document.createElement("td");
      const tag=document.createElement("span");tag.className="market-demo-tag";tag.textContent="NOT VERIFIED · DEMO";
      status.append(tag);row.append(status);
      const action=document.createElement("td");
      const button=document.createElement("button");
      button.type="button";button.textContent="View example";
      button.className="market-detail-button";
      button.addEventListener("click",()=>{
        detailTitle.textContent=item[0];
        detailText.textContent="Example asset class: "+item[1]+" · illustrative unit: "+item[2]+". Before any real listing, the seller, asset identity, custody, legal rights and independent verification must be approved.";
        details.hidden=false;
        detailTitle.setAttribute("tabindex","-1");
        detailTitle.focus();
      });
      button.title="Open example asset details; live trading is unavailable";
      action.append(button);row.append(action);tbody.append(row);
    }
    if(!matches.length){
      const row=document.createElement("tr");const cell=document.createElement("td");
      cell.colSpan=5;cell.textContent="No example assets match these filters.";
      row.append(cell);tbody.append(row);
    }
  };
  search.addEventListener("input",renderRows);
  filter.addEventListener("change",renderRows);
  renderRows();
  const details=document.createElement("aside");
  details.className="asset-detail-panel";
  details.setAttribute("aria-label","Selected example asset details");
  details.hidden=true;
  const detailTitle=document.createElement("h3");
  const detailText=document.createElement("p");
  const readiness=document.createElement("section");
  readiness.className="asset-readiness";
  readiness.setAttribute("aria-label","Asset tokenization readiness checklist");
  const readinessTitle=document.createElement("h4");
  readinessTitle.textContent="Tokenization readiness";
  const readinessIntro=document.createElement("p");
  readinessIntro.textContent="All controls must be independently confirmed before a real asset can be tokenized or listed.";
  const checklist=document.createElement("ul");
  checklist.className="asset-readiness-list";
  const checks=[
    ["Seller identity","KYC and authority to list"],
    ["Ownership and custody","Evidence of title, possession and encumbrances"],
    ["Asset inspection","Independent evidence and valuation review"],
    ["Rights definition","Legally enforceable token rights and redemption terms"],
    ["Compliance approval","Jurisdiction, transfer restrictions and eligibility"],
    ["Issuance authorization","Approval, limits and audit evidence"]
  ];
  for(const [name,description] of checks){
    const li=document.createElement("li");
    const label=document.createElement("strong");label.textContent=name;
    const info=document.createElement("span");info.textContent=description;
    const status=document.createElement("small");status.textContent="NOT VERIFIED";
    li.append(label,info,status);checklist.append(li);
  }
  readiness.append(readinessTitle,readinessIntro,checklist);
  const detailStatus=document.createElement("p");
  detailStatus.className="asset-detail-warning";
  detailStatus.textContent="DEMO ONLY · No verified ownership, token issuance, market price, custody or trade authorization.";
  const close=document.createElement("button");
  close.type="button";close.className="asset-detail-close";close.textContent="Close details";
  close.addEventListener("click",()=>{details.hidden=true;search.focus();});
  details.append(detailTitle,detailText,readiness,detailStatus,close);
  market.append(head,tools,tableWrap,details);
  area.prepend(market);
}

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
