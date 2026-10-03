const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN'),cr=n=>'₹'+(n/1e7).toFixed(2)+' Cr';
const now=()=>new Date().toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const today=()=>new Date().toISOString().slice(0,10);
const dd=d=>new Date(d+'T00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
const KEY='sonainfo_v4';

const VW=[
 ['dashboard','Dashboard','⌂'],
 ['cases','Cases','⚖'],
 ['penalties','Penalty list','⚠'],
 ['finance','Finance','₹'],
 ['employees','Employees','♙'],
 ['departments','Departments','▦'],
 ['announcements','Announcements','◉'],
 ['audit','Audit log','☰'],
 ['tokens','Tokens','🎟'],
 ['access','Access control','🔑'],
 ['builder','Site builder','🛠']
];

const AC=[
 ['complaint','Register complaint'],
 ['enquiry','Do enquiry'],
 ['review','Review & take action'],
 ['forward','Forward case'],
 ['announce','Announce'],
 ['penedit','Manage penalties'],
 ['finedit','Edit finance'],
 ['fulledit','Edit everything'],
 ['comment','Comment'],
 ['status','Change case status'],
 ['tokedit','Manage tokens'],
 ['sitebuild','Edit custom sections']
];

const D=[
 ['SEC Committee','Satrunjay',60,4000000,2650000],
 ['Disciplinary Committee','Ashish',45,2500000,1400000],
 ['Financial Team','Neha Gupta',120,8000000,5100000],
 ['Script','Shivani',420,12000000,7900000],
 ['CEO Office','CEO',25,5000000,3200000],
 ['HOD','Akaya',80,6000000,3800000],
 ['Client Department','Client Dept Head',380,11000000,6700000],
 ['IT','Shivani',670,11500000,7300000]
];

const DN=D.map(d=>d[0]);
const OFF=['Disciplinary Committee','HOD','SEC Committee','Chairman'];
const ST=['Pending','Registered','Started','Under Enquiry','Under Review','Action Taken','Decision announced','Closed'];
const PT=['Warning','Fine','Suspension','Termination'];
const mk=s=>Object.fromEntries(s.split(' ').map(k=>[k,1]));
const H=(by,a,n)=>({t:'02 Oct 2026, 10:00',by,a,n});

const SEED=()=>({
 total:60000000,
 bud:{},

 users:[
  {
   id:1,
   name:'Satrunjay',
   email:'chairman@sonainfo.com',
   pw:'246810',
   role:'Chairman',
   office:'Chairman',
   perm:mk('dashboard cases penalties finance employees departments announcements audit access announce')
  },
  {
   id:2,
   name:'SEC Committee',
   email:'sec@sonainfo.com',
   pw:'246810',
   role:'SEC Committee',
   office:'SEC Committee',
   perm:mk('dashboard cases penalties finance employees departments announcements audit access complaint enquiry review forward announce penedit finedit fulledit')
  },
  {
   id:3,
   name:'Akaya',
   email:'hod@sonainfo.com',
   pw:'246810',
   role:'HOD',
   office:'HOD',
   perm:mk('dashboard cases penalties employees departments announcements review forward announce')
  },
  {
   id:4,
   name:'Ashish',
   email:'dc@sonainfo.com',
   pw:'246810',
   role:'Disciplinary Committee',
   office:'Disciplinary Committee',
   perm:mk('dashboard cases penalties employees departments announcements complaint enquiry forward')
  },
  {
   id:5,
   name:'Financial Team',
   email:'financial@sonainfo.com',
   pw:'246810',
   role:'Financial Team',
   office:'Financial Team',
   perm:mk('dashboard finance penalties employees departments finedit')
  }
 ],

 cases:[
  {
   id:'CASE-1001',
   title:'Repeated late attendance',
   against:'EMP0412',
   dept:'Script',
   sev:'Medium',
   desc:'Late by more than 30 minutes on 9 days in September.',
   st:'Under Enquiry',
   holder:'Disciplinary Committee',
   h:[
    H('Ashish (Disciplinary Committee)','Complaint registered','Attendance report attached.'),
    H('Ashish (Disciplinary Committee)','Enquiry started','Employee called for statement.')
   ]
  },
  {
   id:'CASE-1002',
   title:'Data policy violation',
   against:'EMP1530',
   dept:'IT',
   sev:'High',
   desc:'Customer data shared on a personal email account.',
   st:'Under Review',
   holder:'HOD',
   h:[
    H('SEC Committee (SEC Committee)','Complaint registered','Flagged by security audit.'),
    H('SEC Committee (SEC Committee)','Forwarded to HOD','Please review and act.')
   ]
  },
  {
   id:'CASE-1003',
   title:'Misconduct with a client',
   against:'EMP1185',
   dept:'Client Department',
   sev:'High',
   desc:'Client reported rude behaviour on a call.',
   st:'Registered',
   holder:'SEC Committee',
   h:[
    H('Ashish (Disciplinary Committee)','Complaint registered','Client email received.')
   ]
  }
 ],

 pen:[
  {
   id:1,
   caseId:'CASE-0998',
   emp:'EMP0210',
   type:'Fine',
   amt:5000,
   date:'2026-09-25',
   by:'Disciplinary Committee',
   st:'Imposed'
  },
  {
   id:2,
   caseId:'CASE-0990',
   emp:'EMP0877',
   type:'Warning',
   amt:0,
   date:'2026-09-12',
   by:'HOD',
   st:'Imposed'
  },
  {
   id:3,
   caseId:'CASE-0985',
   emp:'EMP0331',
   type:'Fine',
   amt:10000,
   date:'2026-09-02',
   by:'SEC Committee',
   st:'Collected'
  }
 ],

 tx:[
  {id:1,d:'2026-05-14',n:'Client retainer',dept:'Client Department',t:'Income',a:5200000,seed:1},
  {id:2,d:'2026-06-20',n:'Salaries',dept:'Financial Team',t:'Expense',a:6100000,seed:1},
  {id:3,d:'2026-07-15',n:'Client retainer',dept:'Client Department',t:'Income',a:4800000,seed:1},
  {id:4,d:'2026-08-22',n:'Salaries',dept:'Financial Team',t:'Expense',a:6400000,seed:1},
  {id:5,d:'2026-09-18',n:'Client retainer',dept:'Client Department',t:'Income',a:5600000,seed:1},
  {id:6,d:'2026-10-02',n:'Cloud and hosting',dept:'IT',t:'Expense',a:410000,seed:1}
 ],

 ann:[
  {
   id:1,
   title:'Portal access rights updated',
   text:'Each office now has role-based access to cases, penalties and finance.',
   date:'2026-10-02',
   by:'Satrunjay'
  }
 ],

 log:[
  {t:'02 Oct 2026, 18:10',a:'Portal set up',u:'System'}
 ]
});

let S=Object.assign(SEED(),{
 ov:{},
 cm:{},
 tok:[],
 cust:{sections:[],rows:{}}
});

let DB=false;
let READY=false;
const SENT={};

/* Firebase sync state.
 * A document may be written only after its listener has successfully
 * delivered an initial snapshot. This prevents a temporary listener
 * error from overwriting real cloud data with local seed data.
 */
const SYNC_OK=new Set();
const SYNC_RETRY={};
const SYNC_UNSUB={};

const DOCS={
 users:()=>({
  items:S.users.map(u=>{
   const r={...u};
   if(DB)delete r.pw;
   return r;
  })
 }),
 cases:()=>({items:S.cases}),
 pen:()=>({items:S.pen}),
 ann:()=>({items:S.ann}),
 log:()=>({items:S.log}),
 fin:()=>({total:S.total,bud:S.bud,tx:S.tx}),
 emp:()=>({ov:S.ov}),
 cm:()=>({m:S.cm}),
 tok:()=>({items:S.tok}),
 cust:()=>({sections:S.cust.sections,rows:S.cust.rows})
};

const APPLY={
 users:d=>S.users=d.items,
 cases:d=>S.cases=d.items,
 pen:d=>S.pen=d.items,
 ann:d=>S.ann=d.items,
 log:d=>S.log=d.items,
 fin:d=>{
  S.total=d.total;
  S.bud=d.bud||{};
  S.tx=d.tx;
 },
 emp:d=>{
  S.ov=d.ov||{};
 },
 cm:d=>{
  S.cm=d.m||{};
 },
 tok:d=>{
  S.tok=d.items||[];
 },
 cust:d=>{
  S.cust={
   sections:d.sections||[],
   rows:d.rows||{}
  };
 }
};

const save=()=>{
 if(!DB){
  try{
   localStorage.setItem(KEY,JSON.stringify(S));
  }catch(e){}
  return;
 }

 /* Only documents whose listeners are healthy are written. */
 if(!window.SYNC||!SYNC.set)return;

 for(const k of SYNC_OK){
  if(!DOCS[k])continue;

  const b=DOCS[k]();
  const j=JSON.stringify(b);

  if(SENT[k]!==j){
   SENT[k]=j;

   SYNC.set(k,b).catch(e=>{
    SENT[k]=null;
    console.error('Firestore save error:',k,e);
    toast('Not saved. Check your internet and try again.');
   });
  }
 }
};

let ME=null;
let view='dashboard';

const can=k=>!!(ME&&ME.perm[k]);

const log=a=>{
 S.log.unshift({
  t:now(),
  a,
  u:ME?ME.name:'System'
 });

 S.log=S.log.slice(0,100);
 save();
};

const nid=l=>Math.max(0,...l.map(x=>x.id))+1;

const EMP=(()=>{
 let s=7;

 const r=()=>{
  s|=0;
  s=s+0x6D2B79F5|0;
  let t=Math.imul(s^s>>>15,1|s);
  t=t+Math.imul(t^t>>>7,61|t)^t;
  return((t^t>>>14)>>>0)/4294967296;
 };

 const F='Aarav Vivaan Aditya Rohan Ishaan Kabir Arjun Neha Priya Anjali Pooja Kavya Riya Sneha Meera Ritu Karan Vikram Sanjay Deepak Nisha Tanvi Harsh'.split(' ');
 const L='Sharma Verma Singh Gupta Kumar Yadav Mishra Patel Reddy Nair Joshi Mehta Das Khan Rao Iyer'.split(' ');
 const R=['Executive','Analyst','Associate','Senior Associate','Team Lead','Coordinator'];

 const o=[];
 let n=1;

 D.forEach(d=>{
  for(let i=0;i<d[2];i++){
   o.push({
    id:'EMP'+String(n).padStart(4,'0'),
    name:F[r()*F.length|0]+' '+L[r()*L.length|0],
    dept:d[0],
    role:R[r()*R.length|0]
   });
   n++;
  }
 });

 return o;
})();

const effE=e=>Object.assign({},e,S.ov[e.id]||{});

const who=id=>{
 const e=EMP.find(x=>x.id===id);
 return e?`${effE(e).name} (${e.id})`:id;
};

/* auth */

const chips=()=>{
 const c=$('#chips');
 if(!c)return;

 c.innerHTML=DB
  ?''
  :S.users.map(u=>
   `<button class="chip" onclick="fill('${esc(u.email)}')">${esc(u.role)}</button>`
  ).join('');
};

function fill(e){
 const u=S.users.find(x=>x.email===e);
 if(!u)return;

 $('#em').value=u.email;
 $('#pw').value=DB?'':(u.pw||'246810');
}

async function login(){

 if(!READY&&!DB){
  $('#le').textContent='Still loading. Try again in a moment.';
  return;
 }

 const em=$('#em').value.trim().toLowerCase();
 const pw=$('#pw').value;

 if(!em||!pw){
  $('#le').textContent='Enter email and password.';
  return;
 }

 if(DB){

  $('#le').textContent='Signing in...';

  try{
   await SYNC.login(em,pw);
   return;
  }
  catch(e){

   console.warn('Firebase login failed:',e);

   const u=S.users.find(
    x=>x.email.toLowerCase()===em &&
       x.pw===pw
   );

   if(u){
    DB=false;
    READY=true;
    pill();

    try{
     sessionStorage.setItem('sona_u',u.id);
    }catch(x){}

    start(u);
    return;
   }

   $('#le').textContent='Email or password is incorrect.';
   return;
  }
 }

 const u=S.users.find(
  x=>x.email.toLowerCase()===em &&
     x.pw===pw
 );

 if(!u){
  $('#le').textContent='Email or password is incorrect.';
  return;
 }

 try{
  sessionStorage.setItem('sona_u',u.id);
 }catch(e){}

 start(u);
}

function start(u,q){

 ME=u;

 $('#le').textContent='';

 $('#login').classList.add('hide');
 $('#app').classList.remove('hide');

 $('#meN').textContent=u.name;
 $('#meR').textContent=u.role;

 try{
  migrate();
 }catch(e){
  console.error(e);
 }

 if(!q)log('Signed in');

 go('dashboard');
}

function logout(){

 try{
  sessionStorage.removeItem('sona_u');
 }catch(e){}

 if(DB&&window.SYNC&&SYNC.logout){
  SYNC.logout().catch(()=>{});
 }

 ME=null;

 $('#app').classList.add('hide');
 $('#login').classList.remove('hide');
 $('#pw').value='';
}

function theme(){
 const r=document.documentElement;
 const d=r.dataset.theme
  ?r.dataset.theme==='dark'
  :matchMedia('(prefers-color-scheme:dark)').matches;

 r.dataset.theme=d?'light':'dark';
}

const mine=()=>S.cases.filter(c=>ME&&c.holder===ME.office);

function go(v){

 if(!can(v))
  v=(VWX().find(m=>can(m[0]))||['dashboard'])[0];

 view=v;

 if(typeof sb!=='undefined'&&sb)
  sb.classList.remove('open');

 $('#nav').innerHTML=VWX()
  .filter(m=>can(m[0]))
  .map(m=>
   `<button class="${m[0]===v?'on':''}" onclick="go('${m[0]}')">
    <i>${m[2]}</i>
    ${m[1]}
    ${m[0]==='cases'&&mine().length
      ?`<span class="cnt">${mine().length}</span>`
      :''
    }
   </button>`
  ).join('');

 $('#c').innerHTML=V[v]?V[v]():secView(v);

 scrollTo(0,0);
}

const ph=(t,p,b='')=>
 `<div class="ph">
  <div>
   <h1>${t}</h1>
   <p>${p}</p>
  </div>
  <div>${b}</div>
 </div>`;

const tag=s=>
 `<span class="tg ${{Registered:'y',Pending:'y',Closed:'g',Open:'g',Scheduled:'y',Disabled:'r','Under Enquiry':'y','Under Review':'y','Action Taken':'','Decision announced':'g',High:'r',Medium:'y',Low:'g',Imposed:'y',Collected:'g',Income:'g',Expense:'y'}[s]||''}">
  ${esc({Imposed:'Unpaid',Collected:'Paid'}[s]||s)}
 </span>`;

const bud=d=>S.bud[d]??D.find(x=>x[0]===d)[3];

const spent=d=>
 D.find(x=>x[0]===d)[4]+
 S.tx.filter(
  x=>!x.seed&&x.dept===d&&x.t==='Expense'
 ).reduce((s,x)=>s+x.a,0);

const income=()=>
 S.tx.filter(x=>!x.seed&&x.t==='Income')
 .reduce((s,x)=>s+x.a,0);

const spentAll=()=>
 DN.reduce((s,d)=>s+spent(d),0);

const balance=()=>
 S.total-spentAll()+income();

const bars=rows=>
 rows.map(r=>
  `<div class="hb">
   <span>${esc(r[0])}</span>
   <div class="pb">
    <span style="width:${Math.min(100,r[1])}%"></span>
   </div>
   <b>${r[2]}</b>
  </div>`
 ).join('');

function chart(){

 const o=[];
 const n=new Date();

 for(let i=5;i>=0;i--){

  const d=new Date(
   n.getFullYear(),
   n.getMonth()-i,
   1
  );

  const k=d.toISOString().slice(0,7);

  const f=t=>
   S.tx.filter(
    x=>x.t===t&&x.d.startsWith(k)
   ).reduce((s,x)=>s+x.a,0);

  o.push([
   d.toLocaleString('en',{month:'short'}),
   f('Income'),
   f('Expense')
  ]);
 }

 const m=Math.max(
  1,
  ...o.map(x=>Math.max(x[1],x[2]))
 );

 return `<div class="ch">
  ${o.map(x=>
   `<div>
    <div class="pair">
     <span style="height:${x[1]/m*100}%" title="Income ${inr(x[1])}"></span>
     <span style="height:${x[2]/m*100}%" title="Expense ${inr(x[2])}"></span>
    </div>
    <small>${x[0]}</small>
   </div>`
  ).join('')}
 </div>
 <p class="hint">Green is income, gold is expense.</p>`;
}

const E={
 q:'',
 d:'All',
 p:0,
 n:20
};

function empBody(){

 if(!$('#eb'))return;

 const q=E.q.toLowerCase();

 const l=EMP.map(effE).filter(e=>
  (E.d==='All'||e.dept===E.d)&&
  (e.name+e.id+e.role).toLowerCase().includes(q)
 );

 const m=Math.max(
  0,
  Math.ceil(l.length/E.n)-1
 );

 E.p=Math.min(E.p,m);

 $('#eb').innerHTML=
  l.slice(E.p*E.n,E.p*E.n+E.n)
  .map(e=>
   `<tr>
    <td>${e.id}</td>
    <td><b>${esc(e.name)}</b></td>
    <td>${esc(e.role)}</td>
    <td>${esc(e.dept)}</td>
    ${can('fulledit')
      ?`<td>
        <button class="btn" style="padding:3px 9px;font-size:12px" onclick="editEmp('${e.id}')">Edit</button>
       </td>`
      :''
    }
   </tr>`
  ).join('')||
  '<tr><td colspan="4" class="empty">No employees match. Clear the search or pick another department.</td></tr>';

 $('#ep').innerHTML=
  `<span>${l.length.toLocaleString('en-IN')} employees · page ${E.p+1} of ${m+1}</span>
   <span class="ac">
    <button class="btn" onclick="E.p--;empBody()" ${E.p<1?'disabled':''}>Previous</button>
    <button class="btn" onclick="E.p++;empBody()" ${E.p>=m?'disabled':''}>Next</button>
   </span>`;
}

const CF={
 s:'All',
 m:0,
 q:''
};

function caseBody(){

 const l=S.cases.filter(c=>
  (CF.s==='All'||c.st===CF.s)&&
  (!CF.m||c.holder===ME.office)&&
  (
   c.id+
   c.title+
   c.against+
   c.dept+
   JSON.stringify(c.facts||'')
  ).toLowerCase().includes(CF.q)
 );

 $('#cb').innerHTML=
  l.map(c=>
   `<tr>
    <td><b>${c.id}</b></td>
    <td>
     ${esc(c.title)}
     <small>${esc(c.dept)} · ${esc(who(c.against))}</small>
    </td>
    <td>${esc(c.holder)}</td>
    <td>${tag(c.st)}</td>
    <td>${tag(c.sev)}</td>
    <td>
     <button class="btn" style="padding:4px 10px;font-size:12px" onclick="showCase('${c.id}')">Open</button>
    </td>
   </tr>`
  ).join('')||
  '<tr><td colspan="6" class="empty">No cases here. Change the filter or register a complaint.</td></tr>';
}

const V={

 dashboard(){

  const open=S.cases.filter(
   c=>!['Decision announced','Closed'].includes(c.st)
  ).length;

  return ph(
   `Welcome, ${esc(ME.name)}`,
   esc(ME.role)
  )+

  `<div class="g4">
   ${can('cases')
    ?`<div class="cd kp hl">
       <small>Open cases</small>
       <div>${open}</div>
      </div>
      <div class="cd kp">
       <small>With your office</small>
       <div>${mine().length}</div>
      </div>`
    :''
   }

   ${can('finance')
    ?`<div class="cd kp">
       <small>Total account</small>
       <div>${cr(S.total)}</div>
      </div>
      <div class="cd kp">
       <small>Balance available</small>
       <div>${cr(balance())}</div>
      </div>`
    :''
   }

   <div class="cd kp">
    <small>Employees</small>
    <div>${EMP.length.toLocaleString('en-IN')}</div>
   </div>
  </div>

  ${can('cases')&&S.cases.some(c=>
    c.sev==='High'&&
    !['Decision announced','Closed'].includes(c.st)
   )
   ?`<div class="cd" style="border-color:var(--er);margin-bottom:16px">
     <h3>Needs attention: high-severity cases</h3>
     <div class="cb">
      ${S.cases.filter(c=>
       c.sev==='High'&&
       !['Decision announced','Closed'].includes(c.st)
      ).map(c=>
       `<div class="row">
        <div>
         <b>${c.id}: ${esc(c.title)}</b>
         <small>${esc(route(c))} · ${esc(c.st)}</small>
        </div>
        <button class="btn" style="padding:4px 10px;font-size:12px" onclick="showCase('${c.id}')">Open</button>
       </div>`
      ).join('')}
     </div>
    </div>`
   :''
  }

  <div class="g2">

   ${can('cases')
    ?`<div class="cd">
      <h3>Cases by stage</h3>
      <div class="cb">
       ${bars(
        ST.map(s=>{
         const n=S.cases.filter(c=>c.st===s).length;
         return [
          s,
          n/Math.max(1,S.cases.length)*100,
          n
         ];
        })
       )}
      </div>
     </div>`
    :''
   }

   ${can('finance')
    ?`<div class="cd">
      <h3>Department budget used</h3>
      <div class="cb">
       ${bars(
        DN.map(d=>{
         const p=Math.round(spent(d)/bud(d)*100);
         return [d,p,p+'%'];
        })
       )}
      </div>
     </div>`
    :''
   }

   <div class="cd">
    <h3>Recent activity</h3>
    <div class="cb">
     ${S.log.slice(0,6).map(l=>
      `<div class="row">
       <div>
        ${esc(l.a)}
        <small>${esc(l.u)} · ${esc(l.t)}</small>
       </div>
      </div>`
     ).join('')}
    </div>
   </div>

  </div>`;
 },

 cases(){

  setTimeout(caseBody,0);

  return ph(
   'Cases',
   'Complaints from registration to final decision.',
   can('complaint')
    ?`<button class="btn p" onclick="complaintForm()">+ Register complaint</button>`
    :''
  )+

  `<div class="ac" style="margin-bottom:12px">
   ${['All',...ST].map(s=>
    `<button class="btn" onclick="CF.s='${s}';go('cases')">
     ${s}
     <b>${s==='All'
       ?S.cases.length
       :S.cases.filter(c=>c.st===s).length
     }</b>
    </button>`
   ).join('')}
  </div>

  <div class="cd">
   <h3>
    <span>All cases</span>
    <span class="ac">

     <input
      class="srch"
      style="max-width:200px"
      placeholder="Search cases"
      oninput="CF.q=this.value.toLowerCase();caseBody()"
     >

     <select
      class="srch"
      style="max-width:190px"
      onchange="CF.s=this.value;caseBody()"
     >
      ${['All',...ST].map(s=>
       `<option ${s===CF.s?'selected':''}>${s}</option>`
      ).join('')}
     </select>

     <label class="ac">
      <input
       type="checkbox"
       onchange="CF.m=this.checked?1:0;caseBody()"
      >
      With my office
     </label>

    </span>
   </h3>

   <div class="tw">
    <table>
     <thead>
      <tr>
       <th>Case</th>
       <th>Complaint</th>
       <th>With</th>
       <th>Stage</th>
       <th>Severity</th>
       <th></th>
      </tr>
     </thead>
     <tbody id="cb"></tbody>
    </table>
   </div>
  </div>`;
 },

 penalties(){

  return ph(
   'Penalty list',
   'Every penalty imposed, and whether fines have been collected.',
   can('penedit')
    ?`<button class="btn p" onclick="penForm()">+ Add penalty</button>`
    :''
  )+

  `<div class="g4">

   <div class="cd kp">
    <small>Total penalties</small>
    <div>${S.pen.length}</div>
   </div>

   <div class="cd kp hl">
    <small>Fines pending</small>
    <div>${inr(
     S.pen.filter(
      p=>p.type==='Fine'&&p.st==='Imposed'
     ).reduce((s,p)=>s+p.amt,0)
    )}</div>
   </div>

   <div class="cd kp">
    <small>Fines collected</small>
    <div>${inr(
     S.pen.filter(
      p=>p.st==='Collected'
     ).reduce((s,p)=>s+p.amt,0)
    )}</div>
   </div>

  </div>

  <div class="cd">
   <div class="tw">
    <table>
     <thead>
      <tr>
       <th>Employee</th>
       <th>Penalty</th>
       <th>Amount</th>
       <th>Case</th>
       <th>Imposed by</th>
       <th>Date</th>
       <th>Status</th>
       <th></th>
      </tr>
     </thead>

     <tbody>
      ${[...S.pen].reverse().map(p=>
       `<tr>
        <td><b>${esc(who(p.emp))}</b></td>
        <td>${esc(p.type)}</td>
        <td>${p.amt?inr(p.amt):'-'}</td>
        <td>${esc(p.caseId)}</td>
        <td>${esc(p.by)}</td>
        <td>${dd(p.date)}</td>
        <td>${tag(p.st)}</td>
        <td>
         ${can('finedit')&&p.type==='Fine'&&p.st==='Imposed'
          ?`<button class="btn g" style="padding:4px 10px;font-size:12px" onclick="collect(${p.id})">Mark paid</button>`
          :''
         }

         ${can('fulledit')
          ?`<button class="btn" style="padding:4px 10px;font-size:12px" onclick="editPen(${p.id})">Edit</button>
            <button class="btn no" style="padding:4px 10px;font-size:12px" onclick="delPen(${p.id})">Delete</button>`
          :''
         }

         ${can('finedit')&&p.type==='Fine'&&p.st==='Collected'
          ?`<button class="btn" style="padding:4px 10px;font-size:12px" onclick="unpay(${p.id})">Mark unpaid</button>`
          :''
         }

         <button
          class="btn"
          style="padding:4px 10px;font-size:12px"
          onclick="openCm('pen:${p.id}','penalty')"
         >
          💬 ${(S.cm['pen:'+p.id]||[]).length}
         </button>
        </td>
       </tr>`
      ).join('')}
     </tbody>
    </table>
   </div>
  </div>`;
 },

 finance(){

  const e=can('finedit');

  return ph(
   'Finance',
   'Live view of the account, spending and income.',
   e
    ?`<button class="btn" onclick="totalForm()">Update total account</button>
      <button class="btn p" onclick="txForm()">+ Add transaction</button>`
    :''
  )+

  `<div class="g4">

   <div class="cd kp hl">
    <small>Total account</small>
    <div>${cr(S.total)}</div>
   </div>

   <div class="cd kp">
    <small>Spent so far</small>
    <div>${cr(spentAll())}</div>
   </div>

   <div class="cd kp">
    <small>Income received</small>
    <div>${cr(income())}</div>
   </div>

   <div class="cd kp">
    <small>Balance available</small>
    <div>${cr(balance())}</div>
   </div>

  </div>

  <div class="g2">

   <div class="cd">
    <h3>Department budgets</h3>
    <div class="tw">
     <table>
      <thead>
       <tr>
        <th>Department</th>
        <th>Budget</th>
        <th>Spent</th>
        <th>Left</th>
        ${e?'<th></th>':''}
       </tr>
      </thead>

      <tbody>
       ${DN.map(d=>
        `<tr>
         <td>${d}</td>
         <td>${inr(bud(d))}</td>
         <td>${inr(spent(d))}</td>
         <td>${inr(bud(d)-spent(d))}</td>
         ${e
          ?`<td>
            <button class="btn" style="padding:3px 9px;font-size:12px" onclick="budForm('${d}')">Set budget</button>
           </td>`
          :''
         }
        </tr>`
       ).join('')}
      </tbody>
     </table>
    </div>
   </div>

   <div class="cd">
    <h3>Last six months</h3>
    <div class="cb">${chart()}</div>
   </div>

  </div>

  <div class="cd">
   <h3>Transactions</h3>
   <div class="tw">
    <table>
     <thead>
      <tr>
       <th>Description</th>
       <th>Department</th>
       <th>Type</th>
       <th>Amount</th>
       <th>Date</th>
       ${e?'<th></th>':''}
      </tr>
     </thead>

     <tbody>
      ${[...S.tx]
       .sort((a,b)=>b.d.localeCompare(a.d))
       .map(t=>
        `<tr>
         <td>${esc(t.n)}</td>
         <td>${esc(t.dept)}</td>
         <td>${tag(t.t)}</td>
         <td>${inr(t.a)}</td>
         <td>${dd(t.d)}</td>
         ${e
          ?`<td>
            ${t.seed
             ?''
             :`<button class="btn no" style="padding:3px 9px;font-size:12px" onclick="delTx(${t.id})">Delete</button>`
            }
           </td>`
          :''
         }
        </tr>`
       ).join('')}
     </tbody>
    </table>
   </div>
  </div>`;
 },

 employees(){

  setTimeout(empBody,0);

  return ph(
   'Employees',
   `All ${EMP.length.toLocaleString('en-IN')} employees.`
  )+

  `<div class="cd">
   <h3>
    <span>Directory</span>

    <span class="ac">

     <input
      class="srch"
      style="max-width:220px"
      placeholder="Name, ID or role"
      value="${esc(E.q)}"
      oninput="E.q=this.value;E.p=0;empBody()"
     >

     <select
      class="srch"
      style="max-width:190px"
      onchange="E.d=this.value;E.p=0;empBody()"
     >
      ${['All',...DN].map(d=>
       `<option ${E.d===d?'selected':''}>${d}</option>`
      ).join('')}
     </select>

    </span>
   </h3>

   <div class="tw">
    <table>
     <thead>
      <tr>
       <th>ID</th>
       <th>Name</th>
       <th>Role</th>
       <th>Department</th>
       ${can('fulledit')?'<th></th>':''}
      </tr>
     </thead>
     <tbody id="eb"></tbody>
    </table>
   </div>

   <div class="cb ac" id="ep" style="justify-content:space-between;border-top:1px solid var(--bd)"></div>
  </div>`;
 },

 departments(){

  return ph(
   'Departments',
   'Heads and strength.'
  )+

  `<div class="g3">
   ${D.map(d=>
    `<div class="cd dc">
     <h3>${d[0]}</h3>
     <small>Head: ${esc(d[1])}</small>

     <div class="row">
      <span>Employees</span>
      <b>${d[2]}</b>
     </div>

     ${can('finance')
      ?`<div class="row">
        <span>Budget</span>
        <b>${inr(bud(d[0]))}</b>
       </div>

       <div class="pb">
        <span style="width:${Math.min(100,spent(d[0])/bud(d[0])*100)}%"></span>
       </div>`
      :''
     }

    </div>`
   ).join('')}
  </div>`;
 },

 announcements(){

  return ph(
   'Announcements',
   'Notices and decisions for the organisation.',
   can('announce')
    ?`<button class="btn p" onclick="annForm()">+ New announcement</button>`
    :''
  )+

  `<div class="cd">
   <div class="cb">
    ${S.ann.map(a=>
     `<div class="row">
      <div>
       <b>${esc(a.title)}</b>
       <small>${esc(a.text)}</small>
       <small>${esc(a.by)} · ${dd(a.date)}</small>
      </div>

      <span class="ac">
       <button class="btn" onclick="openCm('ann:${a.id}','announcement')">
        💬 ${(S.cm['ann:'+a.id]||[]).length}
       </button>

       ${can('fulledit')
        ?`<button class="btn" onclick="editAnn(${a.id})">Edit</button>
          <button class="btn no" onclick="delAnn(${a.id})">Delete</button>`
        :''
       }
      </span>
     </div>`
    ).join('')}
   </div>
  </div>`;
 },

 audit(){

  return ph(
   'Audit log',
   'Who did what, and when.'
  )+

  `<div class="cd">
   <div class="cb">
    ${S.log.map(l=>
     `<div class="row">
      <div>
       ${esc(l.a)}
       <small>${esc(l.u)}</small>
      </div>
      <small>${esc(l.t)}</small>
     </div>`
    ).join('')}
   </div>
  </div>`;
 },

 access(){

  const ks=[
   ...VWX().map(v=>[v[0],v[1]]),
   ...AC
  ];

  return ph(
   'Access control',
   'Tick what each person can see or do. Changes apply the next time they open a page.',
   `<button class="btn p" onclick="userForm()">+ Add user</button>`
  )+

  `<div class="cd">
   <div class="tw">

    <table style="min-width:2100px">

     <thead>
      <tr>
       <th>User</th>

       ${ks.map((k,i)=>
        `<th
         class="c"
         style="${i===VWX().length?'border-left:2px solid var(--gd)':''}"
        >
         ${k[1]}
        </th>`
       ).join('')}

       <th></th>
      </tr>
     </thead>

     <tbody>

      ${S.users.map(u=>
       `<tr>

        <td>
         <b>${esc(u.name)}</b>
         <small>${esc(u.email)}</small>
        </td>

        ${ks.map((k,i)=>
         `<td
          class="c"
          style="${i===VWX().length?'border-left:2px solid var(--gd)':''}"
         >
          <input
           type="checkbox"
           aria-label="${esc(u.name)}: ${k[1]}"
           ${u.perm[k[0]]?'checked':''}
           ${u.id===ME.id&&(k[0]==='access'||k[0]==='dashboard')?'disabled':''}
           onchange="setPerm(${u.id},'${k[0]}',this.checked)"
          >
         </td>`
        ).join('')}

        <td class="ac">

         ${u.id===ME.id
          ?tag('You')
          :`<button
            class="btn no"
            style="padding:3px 9px;font-size:12px"
            onclick="delUser(${u.id})"
           >
            Remove
           </button>`
         }

         <button
          class="btn"
          style="padding:3px 9px;font-size:12px"
          onclick="loginForm(${u.id})"
         >
          Login
         </button>

        </td>

       </tr>`
      ).join('')}

     </tbody>

    </table>

   </div>
  </div>

  <p class="hint">
   Left of the gold line: pages a person can see.
   Right of it: actions a person can take.

   <button
    class="btn no"
    style="padding:3px 9px;font-size:12px"
    onclick="ask('Reset all data to the original sample data?',()=>{S=SEED();save();chips();logout();toast('Data reset')})"
   >
    Reset all data
   </button>
  </p>`;
 }
};

/* case workflow */

const hist=(c,a,n)=>
 c.h.push({
  t:now(),
  by:`${ME.name} (${ME.office})`,
  a,
  n
 });

function showCase(id){

 const c=S.cases.find(x=>x.id===id);
 const b=[];

 can('enquiry')&&b.push(
  `<button class="btn" onclick="enqForm('${id}')">Do enquiry</button>`
 );

 can('review')&&b.push(
  `<button class="btn" onclick="revForm('${id}')">Review & take action</button>`
 );

 can('forward')&&b.push(
  `<button class="btn" onclick="fwdForm('${id}')">Forward</button>`
 );

 can('announce')&&b.push(
  `<button class="btn g" onclick="decForm('${id}')">Announce decision</button>`
 );

 can('fulledit')&&b.push(
  `<button class="btn" onclick="editCase('${id}')">Edit case</button>
   <button class="btn no" onclick="delCase('${id}')">Delete case</button>`
 );

 (can('status')||can('fulledit'))&&b.push(
  `<button class="btn" onclick="stForm('${id}')">Change status</button>`
 );

 b.push(
  `<button class="btn" onclick="openCm('case:${id}','${id}')">
   Comments (${(S.cm['case:'+id]||[]).length})
  </button>`
 );

 modal(
  `${c.id}: ${esc(c.title)}`,

  `<div class="ac" style="margin-bottom:8px">
   ${tag(c.st)}
   ${tag(c.sev)}
   <span class="tg">With ${esc(c.holder)}</span>
  </div>

  ${routeHTML(c)}

  <div class="row">
   <span>Against</span>
   <b>${esc(who(c.against))}</b>
  </div>

  <div class="row">
   <span>Department</span>
   <b>${esc(c.dept)}</b>
  </div>

  ${(c.facts||[]).map(f=>
   `<div class="row">
    <span>${esc(f[0])}</span>
    <b style="text-align:right">${esc(f[1])}</b>
   </div>`
  ).join('')}

  <p style="margin:10px 0">${esc(c.desc)}</p>

  <b>Timeline</b>

  <div class="tl">
   ${c.h.map(x=>
    `<div>
     <b>${esc(x.a)}</b>
     <small>${esc(x.by)} · ${esc(x.t)}</small>
     ${esc(x.n)}
    </div>`
   ).join('')}
  </div>`,

  b.join('')||
  '<span class="hint">You can view this case but not act on it.</span>'
 );
}

function caseForm(id,t,f,fn,lbl){

 form(
  t,
  f,
  v=>{
   const c=S.cases.find(x=>x.id===id);
   fn(c,v);
   save();
   log(`${c.id}: ${v._a||t}`);
   go('cases');
   showCase(id);
   toast('Saved');
  },
  lbl
 );
}

function enqForm(id){

 caseForm(
  id,
  'Do enquiry',
  [{k:'n',l:'Enquiry findings',t:'area'}],
  (c,v)=>{
   if(!v.n)return;
   c.st='Under Enquiry';
   hist(c,'Enquiry update',v.n);
  },
  'Save enquiry'
 );
}

function revForm(id){

 caseForm(
  id,
  'Review & take action',
  [
   {
    k:'a',
    l:'Action decided',
    o:['No action','Warning','Fine','Suspension','Termination']
   },
   {
    k:'amt',
    l:'Fine amount (₹, only for Fine)',
    t:'number'
   },
   {
    k:'n',
    l:'Review note',
    t:'area'
   }
  ],
  (c,v)=>{
   c.st='Action Taken';
   c.action=v.a;
   c.amt=+v.amt||0;
   hist(
    c,
    'Action taken: '+v.a+(c.amt?' '+inr(c.amt):''),
    v.n
   );
  },
  'Save action'
 );
}

function fwdForm(id){

 const c=S.cases.find(x=>x.id===id);

 caseForm(
  id,
  'Forward case',
  [
   {
    k:'to',
    l:'Forward to',
    o:OFF.filter(o=>o!==c.holder)
   },
   {
    k:'n',
    l:'Note for the receiver',
    t:'area'
   }
  ],
  (c,v)=>{
   c.holder=v.to;
   hist(c,'Forwarded to '+v.to,v.n);
  },
  'Forward'
 );
}

function decForm(id){

 const c=S.cases.find(x=>x.id===id);

 caseForm(
  id,
  'Announce decision',
  [
   {
    k:'n',
    l:'Decision announcement',
    t:'area',
    v:c.action?`Action taken: ${c.action}. `:''
   },
   {
    k:'p',
    l:'Penalty',
    o:['None',...PT]
   },
   {
    k:'amt',
    l:'Fine amount (₹)',
    t:'number',
    v:c.amt||''
   }
  ],
  (c,v)=>{
   if(!v.n)return;

   c.st='Decision announced';

   hist(
    c,
    'Decision announced',
    v.n
   );

   S.ann.unshift({
    id:nid(S.ann),
    title:`Decision on ${c.id}: ${c.title}`,
    text:v.n,
    date:today(),
    by:ME.office
   });

   if(v.p!=='None')
    S.pen.push({
     id:nid(S.pen),
     caseId:c.id,
     emp:c.against,
     type:v.p,
     amt:v.p==='Fine'?+v.amt||0:0,
     date:today(),
     by:ME.office,
     st:'Imposed'
    });
  },
  'Announce'
 );
}

function complaintForm(){

 form(
  'Register complaint',
  [
   {k:'title',l:'Complaint title'},
   {k:'against',l:'Employee ID (e.g. EMP0412)'},
   {k:'dept',l:'Department',o:DN},
   {k:'sev',l:'Severity',o:['Low','Medium','High']},
   {k:'desc',l:'What happened',t:'area'}
  ],
  v=>{
   if(!v.title||!v.against||!v.desc){
    toast('Fill in all required fields.');
    return;
   }

   if(!EMP.some(e=>e.id===v.against.toUpperCase())){
    toast('No employee with that ID. Check the Employees page.');
    return;
   }

   const c={
    id:'CASE-'+(1001+S.cases.length),
    ...v,
    against:v.against.toUpperCase(),
    st:'Registered',
    holder:ME.office,
    h:[]
   };

   hist(c,'Complaint registered',v.desc);

   S.cases.push(c);

   log('Registered '+c.id);
   save();
   cm();
   go('cases');

   toast('Complaint registered as '+c.id);
  },
  'Register'
 );
}

function penForm(){

 form(
  'Add penalty',
  [
   {k:'emp',l:'Employee ID'},
   {k:'type',l:'Penalty',o:PT},
   {k:'amt',l:'Fine amount (₹)',t:'number'},
   {k:'caseId',l:'Case ID (optional)'}
  ],
  v=>{
   if(!EMP.some(e=>e.id===v.emp.toUpperCase())){
    toast('No employee with that ID.');
    return;
   }

   S.pen.push({
    id:nid(S.pen),
    caseId:v.caseId||'-',
    emp:v.emp.toUpperCase(),
    type:v.type,
    amt:v.type==='Fine'?+v.amt||0:0,
    date:today(),
    by:ME.office,
    st:'Imposed'
   });

   log('Added penalty: '+v.emp);
   save();
   cm();
   go('penalties');
   toast('Penalty added');
  },
  'Add penalty'
 );
}

function collect(id){

 const p=S.pen.find(x=>x.id===id);

 p.st='Collected';
 p.txId=nid(S.tx);

 S.tx.push({
  id:p.txId,
  d:today(),
  n:'Penalty fine: '+p.emp,
  dept:'Financial Team',
  t:'Income',
  a:p.amt
 });

 log('Collected fine from '+p.emp);
 save();
 go('penalties');
 toast('Fine collected and added to income');
}

/* finance + admin */

function txForm(){

 form(
  'Add transaction',
  [
   {k:'n',l:'Description'},
   {k:'a',l:'Amount (₹)',t:'number'},
   {k:'t',l:'Type',o:['Expense','Income']},
   {k:'dept',l:'Department',o:DN},
   {k:'d',l:'Date',t:'date',v:today()}
  ],
  v=>{
   if(!v.n||!v.a||!v.d){
    toast('Fill in all required fields.');
    return;
   }

   S.tx.push({
    id:nid(S.tx),
    n:v.n,
    t:v.t,
    dept:v.dept,
    d:v.d,
    a:Math.abs(+v.a)
   });

   log(`Added ${v.t.toLowerCase()}: ${v.n}`);
   save();
   cm();
   go('finance');
   toast('Transaction added');
  },
  'Add transaction'
 );
}

function totalForm(){

 form(
  'Update total account',
  [
   {
    k:'a',
    l:'Total account (₹)',
    t:'number',
    v:S.total
   }
  ],
  v=>{
   if(!(+v.a>0)){
    toast('Enter an amount above zero.');
    return;
   }

   S.total=+v.a;

   log('Total account set to '+inr(S.total));
   save();
   cm();
   go('finance');
   toast('Total account updated');
  },
  'Update'
 );
}

function budForm(d){

 form(
  'Set budget: '+d,
  [
   {
    k:'a',
    l:'Budget (₹)',
    t:'number',
    v:bud(d)
   }
  ],
  v=>{
   if(!(+v.a>0)){
    toast('Enter an amount above zero.');
    return;
   }

   S.bud[d]=+v.a;

   log(`Budget for ${d} set to ${inr(+v.a)}`);
   save();
   cm();
   go('finance');
   toast('Budget updated');
  },
  'Update'
 );
}

function delTx(id){

 ask(
  'Delete this transaction?',
  ()=>{
   S.tx=S.tx.filter(x=>x.id!==id);
   log('Deleted a transaction');
   save();
   go('finance');
   toast('Deleted');
  }
 );
}

function annForm(){

 form(
  'New announcement',
  [
   {k:'title',l:'Title'},
   {k:'text',l:'Message',t:'area'}
  ],
  v=>{
   if(!v.title||!v.text){
    toast('Fill in all required fields.');
    return;
   }

   S.ann.unshift({
    id:nid(S.ann),
    ...v,
    date:today(),
    by:ME.office
   });

   log('Announced: '+v.title);
   save();
   cm();
   go('announcements');
   toast('Announced');
  },
  'Announce'
 );
}

function setPerm(id,k,on){

 const u=S.users.find(x=>x.id===id);

 if(on)u.perm[k]=1;
 else delete u.perm[k];

 log(`${u.name}: ${on?'granted':'removed'} ${k}`);
 save();
 toast('Access updated');
}

function delUser(id){

 const u=S.users.find(x=>x.id===id);

 ask(
  `Remove ${u.name}? They will no longer be able to sign in.`,
  ()=>{
   S.users=S.users.filter(x=>x.id!==id);
   log('Removed user '+u.name);
   save();
   chips();
   go('access');
   toast('User removed');
  }
 );
}

function userForm(){

 form(
  'Add user',
  [
   {k:'name',l:'Full name'},
   {k:'email',l:'Email',t:'email'},
   {k:'pw',l:'Password (6 or more characters)'},
   {k:'role',l:'Role'},
   {k:'office',l:'Office they act as',o:[...OFF,'Financial Team']}
  ],
  async v=>{

   if(
    !v.name||
    !v.email||
    v.pw.length<6||
    !v.role
   ){
    toast('Fill in all fields. Password needs 6 or more characters.');
    return;
   }

   if(S.users.some(
    u=>u.email.toLowerCase()===v.email.toLowerCase()
   )){
    toast('That email already has an account.');
    return;
   }

   if(DB){

    try{
     await SYNC.create(v.email,v.pw);
    }
    catch(e){
     toast(
      'Could not create the login: '+
      (e.code||'error')
     );
     return;
    }
   }

   const u={
    id:nid(S.users),
    name:v.name,
    email:v.email,
    role:v.role,
    office:v.office,
    perm:mk('dashboard')
   };

   if(!DB)u.pw=v.pw;

   S.users.push(u);

   log('Added user '+v.name);
   save();
   chips();
   cm();
   go('access');

   toast('User added. Tick their access below.');
  },
  'Add user'
 );
}

/* modal helpers */

let F=[];
let OK=()=>{};

function modal(t,b,f){

 $('#mt').textContent=t;
 $('#mb').innerHTML=b;
 $('#mf').innerHTML=f;
 $('#mo').classList.add('on');
}

function cm(){
 $('#mo').classList.remove('on');
}

function form(t,f,ok,label='Save'){

 F=f;
 OK=ok;

 modal(
  t,
  f.map(x=>
   `<div class="fg">
    <label for="f_${x.k}">${x.l}</label>

    ${x.o
     ?`<select id="f_${x.k}">
       ${x.o.map(o=>
        `<option ${o===x.v?'selected':''}>${o}</option>`
       ).join('')}
      </select>`
     :x.t==='area'
      ?`<textarea id="f_${x.k}">${esc(x.v||'')}</textarea>`
      :`<input id="f_${x.k}" type="${x.t||'text'}" value="${esc(x.v||'')}">`
    }
   </div>`
  ).join(''),

  `<button class="btn" onclick="cm()">Cancel</button>
   <button class="btn p" onclick="sub()">${label}</button>`
 );
}

function sub(){

 const v={};

 F.forEach(
  f=>v[f.k]=$('#f_'+f.k).value.trim()
 );

 OK(v);
}

function ask(msg,fn){

 F=[];

 OK=()=>{
  cm();
  fn();
 };

 modal(
  'Please confirm',
  `<p>${esc(msg)}</p>`,
  `<button class="btn" onclick="cm()">Cancel</button>
   <button class="btn no" onclick="sub()">Yes, continue</button>`
 );
}

function toast(m){

 const e=document.createElement('div');

 e.className='t';
 e.textContent=m;

 $('#ts').appendChild(e);

 setTimeout(
  ()=>e.remove(),
  2600
 );
}

document.addEventListener(
 'keydown',
 e=>{
  if(e.key==='Escape')cm();
 }
);

function pill(){

 const e=$('#pill');

 if(!e)return;

 e.className='tg '+(DB?'g':'r');

 e.textContent=DB
  ?'● Live sync '+new Date().toLocaleTimeString(
    'en-GB',
    {
     hour:'2-digit',
     minute:'2-digit',
     second:'2-digit'
    }
   )
  :'○ Offline, this browser only';
}

function offline(){

 try{
  const l=JSON.parse(
   localStorage.getItem(KEY)
  );

  if(l&&l.users)S=l;

 }catch(e){}

 S.ov=S.ov||{};
 S.cm=S.cm||{};
 S.tok=S.tok||[];
 S.cust=S.cust||{
  sections:[],
  rows:{}
 };

 fixUsers();
 READY=true;
 ready();
}

function route(c){

 const m=/\(([^)]+)\)\s*$/.exec(
  (c.h[0]||{}).by||''
 );

 const r=[
  m?m[1]:c.dept
 ];

 c.h.forEach(x=>{
  if(x.a.startsWith('Forwarded to '))
   r.push(x.a.slice(13));
 });

 return r.join(' → ');
}

function routeHTML(c){

 return `<div class="ac" style="margin:6px 0 10px">
  <span class="tg">${esc(route(c))}</span>
  ${c.informed
   ?`<span class="tg g">Chairman informed</span>`
   :''
  }
 </div>`;
}

function migrate(){

 if(fixUsers())save();

 const old=S.cases.find(
  c=>c.id==='CASE-1004'
 );

 if(old&&old.v===2)return;

 const T=(a,n,t)=>({
  t,
  by:'Shivani (IT Team)',
  a,
  n
 });

 const c={
  v:2,
  id:'CASE-1004',
  title:'Email account hack: Kunal’s official mail ID',
  against:'Sonali and Anamika (main masterminds)',
  dept:'IT',
  sev:'High',
  st:'Under Review',
  holder:'HOD',
  informed:'Chairman',

  facts:[
   ['Registered by','IT Team (Shivani, IT Head)'],
   ['Victim','Kunal'],
   ['Incident','Kunal’s official email ID was hacked and used without his knowledge'],
   ['Main masterminds','Sonali and Anamika'],
   ['Forwarded to','HOD, for review and action'],
   ['Chairman','Informed (view only)']
  ],

  desc:'Kunal’s official email ID was hacked. The IT team investigated and found that Sonali and Anamika are the main masterminds behind the attack. The IT team has preserved the access records and has now forwarded the case to the HOD to review the findings, decide the action and announce it.',

  h:[
   T(
    'Complaint registered',
    'Kunal’s official email ID was hacked. The IT team has registered this as a high-severity case.',
    '03 Oct 2026, 09:15'
   ),

   T(
    'Investigation completed',
    'The IT team traced the unauthorised access. Sonali and Anamika are identified as the main masterminds. Access records are preserved as evidence.',
    '03 Oct 2026, 11:30'
   ),

   T(
    'Forwarded to HOD',
    'Investigation is complete. Please review the findings, decide the action and announce it. The Chairman has been informed.',
    '03 Oct 2026, 12:00'
   )
  ]
 };

 if(old)
  S.cases[S.cases.indexOf(old)]=c;
 else
  S.cases.push(c);

 log(
  'Added CASE-1004: Kunal’s email hack, forwarded by IT Team to HOD'
 );

 save();
}

window.addEventListener(
 'error',
 e=>{
  const c=$('#c');

  if(
   c&&
   !c.innerHTML.trim()&&
   ME
  ){
   c.innerHTML=
    '<div class="cd">'+
    '<div class="cb">'+
    '<b>Something went wrong while loading this page.</b>'+
    '<p class="hint">Reload the page. If it keeps happening, tell the person who manages the portal this message: '+
    esc(e.message)+
    '</p>'+
    '</div></div>';
  }
 }
);

function editCase(id){

 const c=S.cases.find(x=>x.id===id);

 form(
  'Edit case',
  [
   {k:'title',l:'Title',v:c.title},
   {k:'dept',l:'Department',o:DN,v:c.dept},
   {k:'sev',l:'Severity',o:['Low','Medium','High'],v:c.sev},
   {k:'st',l:'Stage',o:ST,v:c.st},
   {k:'holder',l:'With',o:OFF,v:c.holder},
   {k:'desc',l:'Description',t:'area',v:c.desc}
  ],
  v=>{
   if(!v.title){
    toast('Title is required.');
    return;
   }

   Object.assign(c,v);

   hist(
    c,
    'Case edited',
    'Edited by '+ME.name
   );

   log('Edited '+id);
   save();
   go('cases');
   showCase(id);
   toast('Case updated');
  },
  'Save changes'
 );
}

function delCase(id){

 ask(
  'Delete this case for good?',
  ()=>{
   S.cases=S.cases.filter(x=>x.id!==id);
   log('Deleted '+id);
   save();
   go('cases');
   toast('Case deleted');
  }
 );
}

function editPen(id){

 const p=S.pen.find(x=>x.id===id);

 form(
  'Edit penalty',
  [
   {k:'type',l:'Penalty',o:PT,v:p.type},
   {k:'amt',l:'Fine amount (₹)',t:'number',v:p.amt},
   {k:'st',l:'Status',o:['Imposed','Collected'],v:p.st}
  ],
  v=>{
   p.type=v.type;
   p.amt=v.type==='Fine'?+v.amt||0:0;
   p.st=v.st;

   log('Edited penalty for '+p.emp);
   save();
   cm();
   go('penalties');
   toast('Updated');
  },
  'Save changes'
 );
}

function delPen(id){

 ask(
  'Delete this penalty?',
  ()=>{
   S.pen=S.pen.filter(x=>x.id!==id);
   log('Deleted a penalty');
   save();
   cm();
   go('penalties');
   toast('Deleted');
  }
 );
}

function editAnn(id){

 const a=S.ann.find(x=>x.id===id);

 form(
  'Edit announcement',
  [
   {k:'title',l:'Title',v:a.title},
   {k:'text',l:'Message',t:'area',v:a.text}
  ],
  v=>{
   if(!v.title||!v.text){
    toast('Fill in all fields.');
    return;
   }

   a.title=v.title;
   a.text=v.text;

   log('Edited announcement');
   save();
   cm();
   go('announcements');
   toast('Updated');
  },
  'Save changes'
 );
}

function delAnn(id){

 ask(
  'Delete this announcement?',
  ()=>{
   S.ann=S.ann.filter(x=>x.id!==id);
   log('Deleted an announcement');
   save();
   go('announcements');
   toast('Deleted');
  }
 );
}

function editEmp(id){

 const e=effE(
  EMP.find(x=>x.id===id)
 );

 form(
  'Edit '+id,
  [
   {k:'name',l:'Name',v:e.name},
   {k:'role',l:'Role',v:e.role},
   {k:'dept',l:'Department',o:DN,v:e.dept}
  ],
  v=>{
   if(!v.name){
    toast('Name is required.');
    return;
   }

   S.ov[id]={
    name:v.name,
    role:v.role,
    dept:v.dept
   };

   log('Edited employee '+id);
   save();
   cm();
   empBody();
   toast('Employee updated');
  },
  'Save changes'
 );
}

function ready(){

 pill();
 chips();

 $('#sy').textContent=
  DB
   ?'Live: every device sees changes within a second.'
   :'Demo mode: add your Firebase keys in firebase-config.js for live sync. Data stays in this browser.';

 if(!DB){

  try{

   const u=S.users.find(
    x=>x.id===+sessionStorage.getItem('sona_u')
   );

   if(u)start(u,1);

  }catch(e){}
 }
}

let UNS=[];
let WATCH=0;

/*
 * Firebase listener management.
 *
 * Every Firestore document gets its own listener.
 * A listener error no longer freezes the whole portal.
 * The failed listener is automatically attached again.
 */

function watchAll(email){

 WATCH=1;
 READY=false;

 const K=Object.keys(DOCS);
 let initialDone=0;
 let started=false;

 const startPortal=()=>{

  if(started)return;

  started=true;
  READY=true;

  try{
   migrate();
  }catch(e){
   console.error('Migration error:',e);
  }

  const u=S.users.find(
   x=>x.email.toLowerCase()===email.toLowerCase()
  );

  if(!u){

   $('#le').textContent=
    'This account is not set up in the portal. Ask the SEC Committee to add it.';

   if(window.SYNC&&SYNC.logout)
    SYNC.logout().catch(()=>{});

   return;
  }

  try{
   sessionStorage.setItem('sona_u',u.id);
  }catch(e){}

  start(u,1);
 };

 const initialResponse=()=>{

  initialDone++;

  if(initialDone>=K.length)
   startPortal();
 };

 const attach=k=>{

  if(!window.SYNC||!SYNC.watch)
   return;

  if(SYNC_UNSUB[k]){

   try{
    SYNC_UNSUB[k]();
   }catch(e){}

   delete SYNC_UNSUB[k];
  }

  const first=
   !Object.prototype.hasOwnProperty.call(
    SENT,
    k
   );

  SYNC_UNSUB[k]=SYNC.watch(

   k,

   d=>{

    const wasReady=SYNC_OK.has(k);

    if(d){

     const before=
      JSON.stringify(
       DOCS[k]()
      );

     APPLY[k](
      JSON.parse(
       JSON.stringify(d)
      )
     );

     const after=
      JSON.stringify(
       DOCS[k]()
      );

     SENT[k]=after;

     SYNC_OK.add(k);

     if(first&&!wasReady)
      initialResponse();

     if(
      READY&&
      before!==after
     ){
      pill();
      refresh();
     }

    }else{

     /*
      * Empty Firestore document is valid.
      * Mark it synced but do not write anything immediately.
      */
     SYNC_OK.add(k);

     if(first){

      SENT[k]=
       JSON.stringify(
        DOCS[k]()
       );

      initialResponse();
     }
    }

    if(SYNC_RETRY[k]){

     clearTimeout(
      SYNC_RETRY[k]
     );

     delete SYNC_RETRY[k];
    }
   },

   e=>{

    console.error(
     'Firestore listener error:',
     k,
     e
    );

    /*
     * Never save this document while its listener
     * is unhealthy.
     */
    SYNC_OK.delete(k);

    if(first)
     initialResponse();

    toast(
     'Live data error on '+
     k+
     ': '+
     (
      e&&e.code
       ?e.code
       :'check Firebase'
     )
    );

    /*
     * Firestore listeners terminate after an error.
     * Reattach automatically.
     */
    if(!SYNC_RETRY[k]){

     SYNC_RETRY[k]=setTimeout(
      ()=>{

       delete SYNC_RETRY[k];

       if(
        WATCH&&
        window.SYNC
       )
        attach(k);

      },
      3000
     );
    }
   }
  );
 };

 K.forEach(attach);
}

function unwatch(){

 Object.keys(SYNC_RETRY).forEach(k=>{

  clearTimeout(
   SYNC_RETRY[k]
  );

  delete SYNC_RETRY[k];
 });

 Object.keys(SYNC_UNSUB).forEach(k=>{

  try{
   SYNC_UNSUB[k]();
  }catch(e){}

  delete SYNC_UNSUB[k];
 });

 SYNC_OK.clear();

 WATCH=0;
 READY=false;

 for(const k in SENT)
  delete SENT[k];
}

function boot(){

 if(!window.SYNC){

  offline();
  return;
 }

 DB=true;
 READY=false;

 ready();

 SYNC.who(
  e=>{

   if(e){

    if(!WATCH&&!ME)
     watchAll(e);

   }else{

    unwatch();

    if(ME){

     ME=null;

     $('#app').classList.add('hide');
     $('#login').classList.remove('hide');
    }
   }
  }
 );
}

if(window.__syncReady)
 boot();
else
 addEventListener(
  'sync-ready',
  boot
 );

/* ---- users, comments, tokens, custom sections ---- */

function fixUsers(){

 const V1=
  'dashboard cases penalties finance employees departments announcements audit';

 const all=
  V1+
  ' tokens access builder complaint enquiry review forward announce penedit finedit fulledit comment status tokedit sitebuild';

 const N=[
  [
   'chairman@sonainfo.com',
   'Rahul Kumar',
   'Chairman',
   'Chairman',
   'dashboard cases penalties finance employees departments announcements tokens audit comment announce status penedit tokedit',
   '246810'
  ],
  [
   'sec@sonainfo.com',
   'Satrunjay',
   'SEC Committee',
   'SEC Committee',
   V1+' complaint enquiry review forward announce penedit finedit fulledit comment status',
   '246810'
  ],
  [
   'hod@sonainfo.com',
   'Akaya',
   'HOD',
   'HOD',
   'dashboard cases penalties employees departments announcements review forward announce',
   '246810'
  ],
  [
   'dc@sonainfo.com',
   'Ashish',
   'Disciplinary Committee',
   'Disciplinary Committee',
   'dashboard cases penalties employees departments announcements complaint enquiry forward',
   '246810'
  ],
  [
   'financial@sonainfo.com',
   'Financial Team',
   'Financial Team',
   'Financial Team',
   'dashboard cases penalties finance employees departments announcements finedit',
   '246810'
  ],
  [
   'it@sonainfo.com',
   'IT Team',
   'IT Team',
   'IT Team',
   all,
   '246810'
  ]
 ];

 if(
  S.users.some(
   u=>u.email.toLowerCase()==='it@sonainfo.com'
  )
 )
  return false;

 N.forEach(n=>{

  let u=S.users.find(
   x=>x.email.toLowerCase()===n[0]
  );

  if(!u){

   u={
    id:nid(S.users),
    email:n[0],
    pw:n[5]
   };

   S.users.push(u);
  }

  Object.assign(
   u,
   {
    name:n[1],
    role:n[2],
    office:n[3],
    pw:'246810',
    perm:mk(n[4])
   }
  );
 });

 return true;
}

fixUsers();

const VWX=()=>
 [
  ...VW,
  ...S.cust.sections.map(
   x=>['sec_'+x.id,x.name,'▤']
  )
 ];

function openCm(key,title){

 const l=S.cm[key]||[];
 const w=can('comment');

 modal(
  'Comments: '+title,

  (
   l.map(c=>
    `<div class="row">
     <div>
      <b>${esc(c.by)}</b>
      <small>${esc(c.t)}</small>
      ${esc(c.x)}
     </div>
    </div>`
   ).join('')||
   '<div class="empty">No comments yet.</div>'
  )+

  (
   w
    ?'<div class="fg" style="margin-top:12px"><textarea id="cmx" placeholder="Write a comment"></textarea></div>'
    :''
  ),

  '<button class="btn" onclick="cm()">Close</button>'+
  (
   w
    ?`<button class="btn p" onclick="addCm('${key}','${esc(title)}')">Post comment</button>`
    :''
  )
 );
}

function addCm(key,title){

 const x=$('#cmx').value.trim();

 if(!x)return;

 (S.cm[key]=S.cm[key]||[]).push({
  by:`${ME.name} (${ME.role})`,
  t:now(),
  x
 });

 log('Commented on '+title);
 save();
 openCm(key,title);
}

function stForm(id){

 caseForm(
  id,
  'Change status',
  [
   {
    k:'s',
    l:'New status',
    o:ST,
    v:S.cases.find(x=>x.id===id).st
   },
   {
    k:'n',
    l:'Note (optional)',
    t:'area'
   }
  ],
  (c,v)=>{
   c.st=v.s;
   hist(
    c,
    'Status changed to '+v.s,
    v.n||''
   );
  },
  'Update status'
 );
}

function unpay(id){

 const p=S.pen.find(x=>x.id===id);

 p.st='Imposed';

 S.tx=S.tx.filter(
  t=>t.id!==p.txId
 );

 delete p.txId;

 log('Marked unpaid: '+p.emp);
 save();
 go('penalties');

 toast('Marked unpaid and removed from income');
}

function loginForm(id){

 const u=S.users.find(x=>x.id===id);

 form(
  'Login for '+u.name,
  [
   {
    k:'email',
    l:'Email',
    t:'email',
    v:u.email
   },
   {
    k:'pw',
    l:DB
      ?'Password (only needed if you change the email)'
      :'New password',
    v:''
   }
  ],
  async v=>{

   const em=v.email.toLowerCase();

   if(!em){
    toast('Email is required.');
    return;
   }

   if(
    S.users.some(
     x=>x.id!==id&&
     x.email.toLowerCase()===em
    )
   ){
    toast('That email belongs to another user.');
    return;
   }

   if(DB){

    if(em!==u.email.toLowerCase()){

     if(v.pw.length<6){
      toast('Set a password of 6 or more characters for the new email.');
      return;
     }

     try{
      await SYNC.create(em,v.pw);
     }
     catch(e){
      toast(
       'Could not create the login: '+
       (e.code||'error')
      );
      return;
     }

    }else if(v.pw){

     try{
      await SYNC.reset(em);
      toast(
       'Password reset email sent to '+em
      );
     }
     catch(e){
      toast('Could not send the reset email.');
      return;
     }
    }

   }else if(v.pw){

    u.pw=v.pw;
   }

   u.email=em;

   log('Updated login for '+u.name);
   save();
   cm();
   go('access');

   toast('Login updated');
  },
  'Save login'
 );
}

/* tokens */

const tokSt=b=>{

 const n=Date.now();
 const o=new Date(b.openAt).getTime();
 const e=b.endAt
  ?new Date(b.endAt).getTime()
  :Infinity;

 return b.off
  ?'Disabled'
  :n<o
   ?'Scheduled'
   :(n>e||
     b.codes.slice(0,b.release).every(c=>c.u)
    )
    ?'Closed'
    :'Open';
};

V.tokens=()=>{

 clearInterval(window.__tk);

 window.__tk=setInterval(
  ()=>{
   if(
    view==='tokens'&&
    !$('#mo').classList.contains('on')
   )
    go('tokens');
  },
  30000
 );

 return ph(
  'Tokens',
  'Generate tokens, choose how many open, and set the time they open.',
  can('tokedit')
   ?'<button class="btn p" onclick="tokForm()">+ Generate tokens</button>'
   :''
 )+

 `<div class="cd">
  <div class="tw">
   <table>
    <thead>
     <tr>
      <th>Batch</th>
      <th>Value</th>
      <th>Generated</th>
      <th>Opens at</th>
      <th>How many open</th>
      <th>Used</th>
      <th>Status</th>
      <th></th>
     </tr>
    </thead>

    <tbody>
     ${S.tok.map(b=>
      `<tr>
       <td><b>${esc(b.name)}</b></td>
       <td>${b.kind==='amt'?inr(b.val):b.val+'% off'}</td>
       <td>${b.codes.length}</td>
       <td>
        ${esc(b.openAt.replace('T',' '))}
        ${b.endAt
         ?`<small>until ${esc(b.endAt.replace('T',' '))}</small>`
         :''
        }
       </td>
       <td>${b.release}</td>
       <td>${b.codes.filter(c=>c.u).length}</td>
       <td>${tag(tokSt(b))}</td>
       <td class="ac">
        <button class="btn" onclick="tokCodes(${b.id})">Codes</button>

        ${can('tokedit')
         ?`<button class="btn" onclick="tokEdit(${b.id})">Edit</button>
           <button class="btn no" onclick="tokDel(${b.id})">Delete</button>`
         :''
        }
       </td>
      </tr>`
     ).join('')||
     '<tr><td colspan="8" class="empty">No tokens yet. Generate the first batch.</td></tr>'}
    </tbody>
   </table>
  </div>
 </div>`;
};

function tokForm(){

 form(
  'Generate tokens',
  [
   {k:'name',l:'Batch name'},
   {k:'kind',l:'Token type',o:['Amount (₹)','Percent off (%)']},
   {k:'val',l:'Value (₹ or %)',t:'number'},
   {k:'qty',l:'How many tokens to generate (max 500)',t:'number'},
   {k:'rel',l:'How many open at the start time',t:'number'},
   {k:'openAt',l:'Opens at',t:'datetime-local'},
   {k:'endAt',l:'Closes at (optional)',t:'datetime-local'}
  ],
  v=>{

   const q=Math.min(
    500,
    +v.qty||0
   );

   const val=+v.val||0;

   if(
    !v.name||
    !q||
    !val||
    !v.openAt
   ){
    toast(
     'Fill in name, value, quantity and open time.'
    );
    return;
   }

   const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

   const g=()=>
    'SONA-'+
    Array.from(
     {length:6},
     ()=>A[Math.random()*A.length|0]
    ).join('');

   const seen=new Set();
   const codes=[];

   while(codes.length<q){

    const c=g();

    if(!seen.has(c)){
     seen.add(c);
     codes.push({
      c,
      u:0
     });
    }
   }

   S.tok.push({
    id:nid(S.tok),
    name:v.name,
    kind:v.kind.startsWith('Amount')?'amt':'pct',
    val,
    release:Math.min(
     q,
     +v.rel||q
    ),
    openAt:v.openAt,
    endAt:v.endAt||'',
    off:0,
    codes
   });

   log(
    `Generated ${q} tokens: ${v.name}`
   );

   save();
   cm();
   go('tokens');

   toast(q+' tokens generated');
  },
  'Generate'
 );
}

function tokEdit(id){

 const b=S.tok.find(x=>x.id===id);

 form(
  'Edit token batch',
  [
   {k:'name',l:'Batch name',v:b.name},
   {k:'rel',l:'How many open',t:'number',v:b.release},
   {k:'openAt',l:'Opens at',t:'datetime-local',v:b.openAt},
   {k:'endAt',l:'Closes at (optional)',t:'datetime-local',v:b.endAt},
   {k:'off',l:'Switch off this batch?',o:['No','Yes'],v:b.off?'Yes':'No'}
  ],
  v=>{

   b.name=v.name||b.name;
   b.release=Math.min(
    b.codes.length,
    +v.rel||b.release
   );
   b.openAt=v.openAt||b.openAt;
   b.endAt=v.endAt;
   b.off=v.off==='Yes'?1:0;

   log('Edited token batch '+b.name);
   save();
   cm();
   go('tokens');
   toast('Updated');
  },
  'Save changes'
 );
}

function tokDel(id){

 ask(
  'Delete this token batch and all its codes?',
  ()=>{
   S.tok=S.tok.filter(
    x=>x.id!==id
   );
   log('Deleted a token batch');
   save();
   go('tokens');
   toast('Deleted');
  }
 );
}

function tokCodes(id){

 const b=S.tok.find(x=>x.id===id);
 const live=tokSt(b)==='Open';

 modal(
  'Codes: '+b.name,

  `<p class="hint" style="margin:0 0 8px">
   ${b.release} of ${b.codes.length} codes open.
   Status: ${tokSt(b)}.
  </p>`+

  b.codes.map((c,i)=>
   `<div class="row">
    <div>
     <b>${c.c}</b>
     <small>${i<b.release?'Open':'Locked'}</small>
    </div>

    <span class="ac">
     ${tag(c.u?'Used':'Unused')}

     ${can('tokedit')&&live&&i<b.release
      ?`<button class="btn" onclick="tokUse(${id},${i})">
        ${c.u?'Mark unused':'Mark used'}
       </button>`
      :''
     }
    </span>
   </div>`
  ).join(''),

  '<button class="btn" onclick="cm()">Close</button>'
 );
}

function tokUse(id,i){

 const b=S.tok.find(
  x=>x.id===id
 );

 b.codes[i].u=b.codes[i].u?0:1;

 save();
 tokCodes(id);
}

/* custom sections */

V.builder=()=>
 ph(
  'Site builder',
  'Create new sections with your own fields. Fill them with rows. No developer needed.',
  '<button class="btn p" onclick="secForm()">+ New section</button>'
 )+

 `<div class="g3">
  ${S.cust.sections.map(x=>
   `<div class="cd dc">
    <h3>${esc(x.name)}</h3>
    <small>${esc(x.cols.join(', '))}</small>

    <div class="ac" style="margin-top:10px">
     <button class="btn" onclick="go('sec_${x.id}')">Open</button>
     <button class="btn" onclick="secForm('${x.id}')">Edit</button>
     <button class="btn no" onclick="secDel('${x.id}')">Delete</button>
    </div>
   </div>`
  ).join('')||
  '<div class="empty">No custom sections yet. Create the first one.</div>'}
 </div>

 <p class="hint">
  After creating a section, open Access control and tick who can see it.
 </p>`;

function secForm(id){

 const x=S.cust.sections.find(
  s=>s.id===id
 );

 form(
  x?'Edit section':'New section',
  [
   {
    k:'name',
    l:'Section name',
    v:x?x.name:''
   },
   {
    k:'cols',
    l:'Fields, separated by commas'+
      (x?' (add new fields at the end)':''),
    v:x
      ?x.cols.join(', ')
      :'Name, Details, Status'
   }
  ],
  v=>{

   const cols=v.cols
    .split(',')
    .map(c=>c.trim())
    .filter(Boolean);

   if(!v.name||!cols.length){
    toast('Add a name and at least one field.');
    return;
   }

   if(x){

    x.name=v.name;
    x.cols=cols;

   }else{

    const n={
     id:String(Date.now()),
     name:v.name,
     cols
    };

    S.cust.sections.push(n);

    ME.perm['sec_'+n.id]=1;
   }

   log('Saved section '+v.name);
   save();
   cm();
   go('builder');

   toast('Section saved');
  },
  'Save'
 );
}

function secDel(id){

 ask(
  'Delete this section and all its rows?',
  ()=>{
   S.cust.sections=
    S.cust.sections.filter(
     x=>x.id!==id
    );

   delete S.cust.rows[id];

   log('Deleted a section');
   save();
   go('builder');

   toast('Deleted');
  }
 );
}

function secView(v){

 const x=S.cust.sections.find(
  s=>'sec_'+s.id===v
 );

 if(!x)
  return V.dashboard();

 const e=
  can('sitebuild')||
  can('fulledit');

 const r=
  S.cust.rows[x.id]||[];

 return ph(
  esc(x.name),
  x.cols.length+' fields',
  e
   ?`<button class="btn p" onclick="rowForm('${x.id}')">+ Add row</button>`
   :''
 )+

 `<div class="cd">
  <div class="tw">

   <table>

    <thead>
     <tr>
      ${x.cols.map(c=>
       `<th>${esc(c)}</th>`
      ).join('')}
      ${e?'<th></th>':''}
     </tr>
    </thead>

    <tbody>

     ${r.map(w=>
      `<tr>
       ${x.cols.map((c,i)=>
        `<td>${esc(w['c'+i])}</td>`
       ).join('')}

       ${e
        ?`<td class="ac">
          <button class="btn" onclick="rowForm('${x.id}',${w.id})">Edit</button>
          <button class="btn no" onclick="rowDel('${x.id}',${w.id})">Delete</button>
         </td>`
        :''
       }
      </tr>`
     ).join('')||

     `<tr>
      <td colspan="${x.cols.length+1}" class="empty">
       No rows yet.
      </td>
     </tr>`}

    </tbody>
   </table>

  </div>
 </div>`;
}

function rowForm(sid,rid){

 const x=S.cust.sections.find(
  s=>s.id===sid
 );

 const l=S.cust.rows[sid]||[];

 const w=
  l.find(r=>r.id===rid)||{};

 form(
  rid?'Edit row':'Add row',

  x.cols.map(
   (c,i)=>({
    k:'c'+i,
    l:c,
    v:w['c'+i]||''
   })
  ),

  v=>{

   if(rid)
    Object.assign(w,v);
   else
    (S.cust.rows[sid]=l).push({
     id:nid(l),
     ...v
    });

   log('Saved a row in '+x.name);
   save();
   cm();
   go('sec_'+sid);

   toast('Saved');
  },

  'Save'
 );
}

function rowDel(sid,rid){

 ask(
  'Delete this row?',
  ()=>{
   S.cust.rows[sid]=
    (S.cust.rows[sid]||[])
    .filter(r=>r.id!==rid);

   log('Deleted a row');
   save();
   go('sec_'+sid);

   toast('Deleted');
  }
 );
}
