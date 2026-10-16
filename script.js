const STAGES=["New","Review","Interview","Offer","Hired"];
const TABS=["Dashboard","Jobs","Candidates","Matching","Insights","Hiring Pipeline"];
const LEVELS={Junior:0,Mid:3,Senior:5};
const KEY="smarthire_ai_v2";
let S,tab="Dashboard",ui={jq:"",cq:"",cs:"",mj:"",mc:"",ej:null,ec:null};
function seed(){return{nid:10,jobs:[
{id:1,title:"Frontend Developer",dept:"Engineering",desc:"Build and maintain the customer web app.",skills:["JavaScript","React","CSS","Git"],level:"Mid"},
{id:2,title:"Data Analyst",dept:"Analytics",desc:"Create reports and dashboards for HR.",skills:["SQL","Excel","Python","Statistics"],level:"Junior"}],
cands:[
{id:1,name:"Aziza Karimova",exp:4,edu:"BSc Computer Science",skills:["javascript","CSS","HTML","Git"],status:"Review",jobId:1},
{id:2,name:"Timur Rashidov",exp:1,edu:"",skills:["SQL","Excel","Tableau"],status:"New",jobId:2},
{id:3,name:"Dilnoza Yusupova",exp:6,edu:"MSc Statistics",skills:["Python","SQL","Statistics","Excel"],status:"Interview",jobId:2}]}}
function load(){try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){S=null}if(!S||!S.jobs){S=seed();save()}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const parse=v=>[...new Set(v.split(",").map(x=>x.trim()).filter(Boolean))];
const tags=(a,c="")=>a.map(x=>`<span class="tag ${c}">${esc(x)}</span>`).join("")||'<span class="mute">none</span>';
const job=id=>S.jobs.find(j=>j.id==id),cand=id=>S.cands.find(c=>c.id==id);
function toast(m){const t=$("#toast");t.textContent=m;t.style.display="block";clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display="none",2200)}
function go(t){tab=t;render()}
function match(c,j){
 const have=c.skills.map(s=>s.toLowerCase());
 const hit=j.skills.filter(s=>have.includes(s.toLowerCase()));
 const miss=j.skills.filter(s=>!have.includes(s.toLowerCase()));
 return{hit,miss,score:j.skills.length?Math.round(hit.length/j.skills.length*100):0};
}
function insights(c,j){
 const m=match(c,j),q=[],clar=[];
 m.hit.forEach(s=>q.push(`Describe a project where you used ${s}. What exactly did you do?`));
 m.miss.forEach(s=>{q.push(`${s} is required but not listed in the profile. Do you have experience with it?`);clar.push(`Confirm whether the candidate has ${s} experience.`)});
 const need=LEVELS[j.level]??0;
 if(c.exp<need){clar.push(`Experience is ${c.exp} yr; ${j.level} level usually expects about ${need}+. Ask how other work covers the gap.`);q.push(`Tell us about the most complex work you've done so far, given this is a ${j.level} role.`)}
 if(!c.edu.trim())clar.push("Education is not provided. Ask for relevant education or training.");
 q.push(`What interests you about the ${j.title} role in ${j.dept}?`);
 return{q,clar};
}
function render(){
 $("#nav").innerHTML=TABS.map(t=>`<button class="${t==tab?"on":""}" onclick="go('${t}')">${t}</button>`).join("");
 $("#app").innerHTML=views[tab]();
}
function keep(id){const el=document.getElementById(id),p=el.selectionStart;render();const n=document.getElementById(id);n.focus();n.setSelectionRange(p,p)}
const views={
Dashboard(){
 return `<h2>Dashboard</h2><div class="grid">
 <div class="card stat"><b>${S.jobs.length}</b>Jobs</div>
 <div class="card stat"><b>${S.cands.length}</b>Candidates</div>
 ${STAGES.map(s=>`<div class="card stat"><b>${S.cands.filter(c=>c.status==s).length}</b>${s}</div>`).join("")}</div>
 <div class="card"><h3>Try the workflow</h3><div class="row"><button class="btn" onclick="go('Jobs')">1. Create a job</button><button class="btn sec" onclick="go('Candidates')">2. Add a candidate</button><button class="btn sec" onclick="go('Matching')">3. Compare skills</button><button class="btn sec" onclick="go('Insights')">4. See insights</button><button class="btn sec" onclick="go('Hiring Pipeline')">5. Update stage</button></div>
 <button class="btn del sm" onclick="resetData()">Reset sample data</button>
 <p class="mute">Data is stored only in this browser on this device. A shared system for several HR users would need a backend, database, authentication and access control.</p></div>`;
},
Jobs(){
 const e=job(ui.ej),L=S.jobs.filter(j=>[j.title,j.dept,j.desc,j.skills.join(" "),j.level].join(" ").toLowerCase().includes(ui.jq.toLowerCase()));
 return `<h2>Jobs</h2><div class="card"><h3>${e?"Edit job":"Add a job"}</h3>
 <form onsubmit="saveJob(event)">
 <label>Job title<input name="title" required value="${e?esc(e.title):""}"></label>
 <label>Department<input name="dept" required value="${e?esc(e.dept):""}"></label>
 <label>Experience level<select name="level">${Object.keys(LEVELS).map(l=>`<option ${e&&e.level==l?"selected":""}>${l}</option>`).join("")}</select></label>
 <label>Required skills (comma separated)<input name="skills" required value="${e?esc(e.skills.join(", ")):""}" placeholder="Python, SQL"></label>
 <label class="full">Description<textarea name="desc" rows="2">${e?esc(e.desc):""}</textarea></label>
 <div class="full row" style="margin:0"><button class="btn">${e?"Save changes":"Save job"}</button>${e?'<button type="button" class="btn sec" onclick="ui.ej=null;render()">Cancel</button>':""}</div></form></div>
 <div class="row"><label>Search jobs<input id="jq" placeholder="Title, department, skill" value="${esc(ui.jq)}" oninput="ui.jq=this.value;keep('jq')"></label></div>
 ${L.map(j=>`<div class="card item"><div><h3>${esc(j.title)} <span class="tag">${j.level}</span></h3><div class="mute">${esc(j.dept)} · ${S.cands.filter(c=>c.jobId==j.id).length} candidates</div><div class="mute">${esc(j.desc)}</div>${tags(j.skills)}</div><div><button class="btn sec sm" onclick="ui.ej=${j.id};render();scrollTo(0,0)">Edit</button> <button class="btn del sm" onclick="delJob(${j.id})">Delete</button></div></div>`).join("")||'<div class="empty">No jobs match. Add one above.</div>'}`;
},
Candidates(){
 const e=cand(ui.ec),L=S.cands.filter(c=>[c.name,c.edu,c.skills.join(" ")].join(" ").toLowerCase().includes(ui.cq.toLowerCase())&&(!ui.cs||c.status==ui.cs));
 return `<h2>Candidates</h2><div class="card"><h3>${e?"Edit candidate":"Add a candidate"} <span class="mute">(fictional data only)</span></h3>
 <form onsubmit="saveCand(event)">
 <label>Full name<input name="name" required value="${e?esc(e.name):""}"></label>
 <label>Experience (years)<input name="exp" type="number" min="0" max="60" required value="${e?e.exp:0}"></label>
 <label>Education<input name="edu" value="${e?esc(e.edu):""}" placeholder="e.g. BSc Economics"></label>
 <label>Applying for<select name="jobId">${S.jobs.map(j=>`<option value="${j.id}" ${e&&e.jobId==j.id?"selected":""}>${esc(j.title)}</option>`).join("")}</select></label>
 <label>Skills (comma separated)<input name="skills" required value="${e?esc(e.skills.join(", ")):""}"></label>
 <label>Status<select name="status">${STAGES.map(s=>`<option ${e&&e.status==s?"selected":""}>${s}</option>`).join("")}</select></label>
 <div class="full row" style="margin:0"><button class="btn" ${S.jobs.length?"":"disabled"}>${e?"Save changes":"Save candidate"}</button>${e?'<button type="button" class="btn sec" onclick="ui.ec=null;render()">Cancel</button>':""}</div></form></div>
 <div class="row"><label>Search<input id="cq" placeholder="Name, education, skill" value="${esc(ui.cq)}" oninput="ui.cq=this.value;keep('cq')"></label>
 <label>Status filter<select onchange="ui.cs=this.value;render()"><option value="">All</option>${STAGES.map(s=>`<option ${ui.cs==s?"selected":""}>${s}</option>`).join("")}</select></label></div>
 ${L.map(c=>`<div class="card item"><div><h3>${esc(c.name)}</h3><div class="mute">${c.exp} yr experience · ${esc(c.edu||"education not provided")} · ${esc(job(c.jobId)?.title||"no job")}</div>${tags(c.skills)}</div><div><span class="tag">${c.status}</span><br><button class="btn sec sm" onclick="ui.ec=${c.id};render();scrollTo(0,0)">Edit</button> <button class="btn del sm" onclick="delCand(${c.id})">Delete</button></div></div>`).join("")||'<div class="empty">No candidates match.</div>'}`;
},
Matching(){
 const sel=pick();if(!sel)return `<h2>Matching</h2><div class="empty">Add at least one job and one candidate first.</div>`;
 const{j,c}=sel,m=match(c,j);
 return `<h2>Matching</h2>${pickers(j,c)}
 <div class="card"><div class="item"><div><h3>${esc(c.name)} vs ${esc(j.title)}</h3><div class="score">${m.score}%</div></div><div style="flex:1;min-width:200px;align-self:center"><div class="bar"><i style="width:${m.score}%"></i></div></div></div>
 <p><b>Matching skills:</b><br>${tags(m.hit,"ok")}</p>
 <p><b>Skills not found in the profile:</b><br>${tags(m.miss,"miss")}</p>
 <div class="formula"><b>Formula:</b> matching required skills ÷ total required skills × 100 = ${m.hit.length} ÷ ${j.skills.length} × 100 = ${m.score}%. Skills are compared ignoring upper/lower case and use only the skills listed in the profile. This does not verify real experience.</div></div>
 <div class="card"><h3>Explanation <span class="tag unk">Demo prototype</span></h3><p>${esc(c.name)} lists ${m.hit.length} of ${j.skills.length} skills required for ${esc(j.title)}. ${m.hit.length?"Listed and matching: "+esc(m.hit.join(", "))+". ":""}${m.miss.length?"Not found in the profile: "+esc(m.miss.join(", "))+". ":""}This score is a screening aid only. It is not a hiring decision; a person should review every candidate.</p></div>`;
},
Insights(){
 const sel=pick();if(!sel)return `<h2>Insights</h2><div class="empty">Add at least one job and one candidate first.</div>`;
 const{j,c}=sel,r=insights(c,j);
 return `<h2>Insights</h2>${pickers(j,c)}
 <div class="card"><h3>Suggested interview questions <span class="tag unk">Demo prototype</span></h3><ol>${r.q.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div>
 <div class="card"><h3>Details to clarify</h3>${r.clar.length?`<ul>${r.clar.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:'<div class="mute">Nothing flagged. The profile covers all required skills, experience level and education.</div>'}<div class="mute">Generated from job requirements and the candidate profile with fixed rules, not a real AI model.</div></div>`;
},
"Hiring Pipeline"(){
 return `<h2>Hiring Pipeline</h2><div class="pipe">${STAGES.map((s,i)=>`<div class="col"><h3>${s} (${S.cands.filter(c=>c.status==s).length})</h3>${S.cands.filter(c=>c.status==s).map(c=>`<div class="pc"><b>${esc(c.name)}</b><div class="mute">${esc(job(c.jobId)?.title||"–")}</div><div class="row" style="margin:6px 0 0">${i>0?`<button class="btn sec sm" onclick="move(${c.id},${i-1})">◀ Back</button>`:""}${i<4?`<button class="btn sm" onclick="move(${c.id},${i+1})">Advance ▶</button>`:""}</div></div>`).join("")||'<div class="mute">Empty</div>'}</div>`).join("")}</div>`;
}};
function pick(){const j=job(ui.mj)||S.jobs[0];if(!j)return null;const c=cand(ui.mc)||S.cands.find(x=>x.jobId==j.id)||S.cands[0];return c?{j,c}:null}
function pickers(j,c){return `<div class="row"><label>Job<select onchange="ui.mj=this.value;render()">${S.jobs.map(x=>`<option value="${x.id}" ${x.id==j.id?"selected":""}>${esc(x.title)}</option>`).join("")}</select></label>
 <label>Candidate<select onchange="ui.mc=this.value;render()">${S.cands.map(x=>`<option value="${x.id}" ${x.id==c.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label></div>`}
function saveJob(ev){ev.preventDefault();const f=new FormData(ev.target),d={title:f.get("title").trim(),dept:f.get("dept").trim(),level:f.get("level"),skills:parse(f.get("skills")),desc:f.get("desc").trim()};
 if(ui.ej){Object.assign(job(ui.ej),d);ui.ej=null;toast("Job updated")}else{S.jobs.push({id:S.nid++,...d});toast("Job saved")}save();render()}
function saveCand(ev){ev.preventDefault();const f=new FormData(ev.target),d={name:f.get("name").trim(),exp:+f.get("exp"),edu:f.get("edu").trim(),jobId:+f.get("jobId"),skills:parse(f.get("skills")),status:f.get("status")};
 if(ui.ec){Object.assign(cand(ui.ec),d);ui.ec=null;toast("Candidate updated")}else{S.cands.push({id:S.nid++,...d});toast("Candidate saved")}save();render()}
function delJob(id){if(!confirm("Delete this job and its candidates?"))return;S.jobs=S.jobs.filter(j=>j.id!=id);S.cands=S.cands.filter(c=>c.jobId!=id);ui.ej=null;save();render()}
function delCand(id){if(!confirm("Delete this candidate?"))return;S.cands=S.cands.filter(c=>c.id!=id);ui.ec=null;save();render()}
function move(id,i){cand(id).status=STAGES[i];save();toast("Status updated to "+STAGES[i]);render()}
function resetData(){if(!confirm("Reset all data to the sample set?"))return;S=seed();save();render()}
load();render();
