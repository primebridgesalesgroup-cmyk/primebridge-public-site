"use strict";
// Current-session native-balance observations only; no prices or invented history.
window.createAPlusPortfolio = () => {
 const $ = id => document.getElementById(id), ns = "http://www.w3.org/2000/svg";
 let context = "", observations = [], range = "all", latest = null;
 const windows = {week:7*86400000,month:30*86400000,year:365*86400000,all:Infinity};
 function reset(){context="";observations=[];latest=null;}
 function observe({account,chain,balance}){
  const key=account.toLowerCase()+":"+chain;
  if(context!==key){context=key;observations=[];}
  observations.push({time:Date.now(),balance});
  if(observations.length>500)observations.shift();
 }
 function svgElement(tag,attributes){const node=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));return node;}
 function drawChart(view){
  const holder=$("portfolio-chart"),empty=$("portfolio-chart-empty");holder.replaceChildren();
  const svg=svgElement("svg",{viewBox:"0 0 900 250","aria-hidden":"true"});
  svg.append(svgElement("path",{class:"chart-grid",d:"M0 20H900M0 70H900M0 120H900M0 170H900M0 220H900"}));
  const points=view.readable?observations.filter(point=>point.time>=Date.now()-windows[range]):[];
  empty.hidden=points.length>=2;
  $("chart-start").textContent=points.length?new Date(points[0].time).toLocaleTimeString():"No observations";
  $("chart-end").textContent=points.length?new Date(points.at(-1).time).toLocaleTimeString():"—";
  if(points.length>=2){
   let low=points[0].balance,high=low;
   for(const p of points){if(p.balance<low)low=p.balance;if(p.balance>high)high=p.balance;}
   const duration=Math.max(1,points.at(-1).time-points[0].time),span=high-low;
   const coordinates=points.map(point=>[10+(point.time-points[0].time)/duration*880,span===0n?120:220-Number((point.balance-low)*1000000n/span)/1000000*200]);
   const data=coordinates.map(([x,y])=>`${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
   svg.append(svgElement("polygon",{class:"chart-area",points:`${coordinates[0][0]},230 ${data} ${coordinates.at(-1)[0]},230`}));
   svg.append(svgElement("polyline",{class:"chart-line",points:data}));
   const label=`${points.length} successful native-balance observations on ${view.network}. Latest: ${view.balance}. Current session only.`;
   holder.setAttribute("aria-label",label);
   $("portfolio-chart-subtitle").textContent=label;
  }else{
   holder.setAttribute("aria-label",points.length?"One balance observation; chart needs another read":"No wallet balance observations");
   $("portfolio-chart-subtitle").textContent=points.length?"One observation recorded. Refresh your wallet to record the next observation.":"Connect a wallet to begin recording balance observations.";
  }
  holder.append(svg);
 }
 function renderAssets(rows){
  const body=$("portfolio-asset-rows");body.replaceChildren();
  if(!rows.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=5;td.className="empty-cell";td.textContent="Connect your wallet to view supported holdings. Private account records are not connected.";tr.append(td);body.append(tr);return;}
  for(const row of rows){
   const tr=document.createElement("tr");
   for(const value of [row.name,row.categoryName,row.quantity,"—",row.category==="native"?"Wallet read":"Contract read · unverified"]){const td=document.createElement("td");td.textContent=value;tr.append(td);}
   body.append(tr);
  }
 }
 function render(view){latest=view;$("portfolio-account").textContent=view.account||"Not connected";$("portfolio-native").textContent=view.readable?view.balance:"—";drawChart(view);renderAssets(view.rows);}
 document.querySelectorAll("[data-range]").forEach(button=>button.addEventListener("click",()=>{
  const chosen=button.dataset.range;if(!Object.hasOwn(windows,chosen))return;range=chosen;
  document.querySelectorAll("[data-range]").forEach(item=>item.setAttribute("aria-pressed",String(item.dataset.range===range)));
  if(latest)drawChart(latest);
 }));
 return {observe,reset,render};
};
