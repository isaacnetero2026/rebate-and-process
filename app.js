const processes=[
{name:"CTS",icon:"⌕",desc:"Customer / case process reference and quick lookup."},
{name:"MSP",icon:"▦",desc:"MSP process information and reference materials."},
{name:"ZIP",icon:"⌁",desc:"ZIP-related process, rules and lookup resources."},
{name:"PLAN",icon:"▤",desc:"Plans, procedures and planning references."},
{name:"SPIEL",icon:"✦",desc:"SPIEL scripts, talking points and reference content."},
{name:"POLICIES",icon:"⚖",desc:"Policy documents, rules and compliance references."},
{name:"PROCESS",icon:"⚙",desc:"General process instructions and workflow references."},
{name:"UPDATES",icon:"↻",desc:"Recent changes, announcements and process updates."},
{name:"OTHERS",icon:"•••",desc:"Miscellaneous resources that do not fit another category."}
];

const pages={
dashboard:["Dashboard","Welcome to your process and tools center."],
search:["Search Process","Find process information quickly."],
calculators:["Calculators","Useful business calculation tools."],
updates:["Updates","Recent website and process changes."],
policies:["Policies","Policy and reference library."],
help:["Help","How to use and customize the website."]
};

function renderProcesses(list=processes){
 const grid=document.getElementById("processGrid");
 const dash=document.getElementById("dashboardCategories");
 const html=list.map(p=>`<button class="category" data-process="${p.name}"><b>${p.icon} ${p.name}</b><small>${p.desc}</small></button>`).join("");
 grid.innerHTML=html;
 dash.innerHTML=processes.map(p=>`<button class="category" data-page="search"><b>${p.icon} ${p.name}</b><small>${p.desc}</small></button>`).join("");
 document.getElementById("resultCount").textContent=`${list.length} result${list.length!==1?"s":""}`;
}
function showPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
 document.getElementById(id).classList.add("active");
 document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===id));
 document.getElementById("pageTitle").textContent=pages[id][0];
 document.getElementById("pageSubtitle").textContent=pages[id][1];
 document.getElementById("sidebar").classList.remove("open");
 window.scrollTo({top:0,behavior:"smooth"});
}
document.addEventListener("click",e=>{
 const target=e.target.closest("[data-page]");
 if(target) showPage(target.dataset.page);
 const proc=e.target.closest("[data-process]");
 if(proc){
   showPage("search");
   const input=document.getElementById("processSearch");
   input.value=proc.dataset.process;
   filterProcesses();
 }
});
document.getElementById("processSearch").addEventListener("input",filterProcesses);
document.getElementById("clearSearch").addEventListener("click",()=>{document.getElementById("processSearch").value="";filterProcesses()});
function filterProcesses(){
 const q=document.getElementById("processSearch").value.toLowerCase().trim();
 renderProcesses(processes.filter(p=>(p.name+" "+p.desc).toLowerCase().includes(q)));
}
document.getElementById("calcRebate").addEventListener("click",()=>{
 const sales=Number(document.getElementById("sales").value)||0;
 const rate=Number(document.getElementById("rate").value)||0;
 document.getElementById("rebateResult").textContent=new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(sales*rate/100);
});
document.getElementById("menu").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("themeBtn").addEventListener("click",()=>document.body.classList.toggle("dark"));
document.getElementById("policyList").innerHTML=processes.filter(p=>p.name==="POLICIES"||p.name==="PROCESS").map(p=>`<div><b>${p.name}</b><p>${p.desc}</p></div>`).join("");
renderProcesses();
