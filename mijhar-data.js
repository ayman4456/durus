/* «مِجهر» — تحميل بيانات المعلم المشتركة للإحصائيات والتقارير */
(function(){
"use strict";
const AR="٠١٢٣٤٥٦٧٨٩";
const ar=v=>String(v==null?"":v).replace(/\d/g,d=>AR[d]);
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ORDER=["cells6","heredity6","plants6","microbes6","digestion6","foodchain6","ecosys6","resources6"];
const ND=window.NAFES_DATA||{};
const TITLE=id=>(ND[id]&&ND[id].title)||id;
const pct=o=>o&&o.total?Math.round(o.got/o.total*100):null;
const mean=a=>{a=a.filter(v=>v!=null&&!isNaN(v));return a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):null};
const band=p=>p==null?"":p>=80?"متقن":p>=60?"قريب من الإتقان":"يحتاج إلى علاج";
const sortCls=(a,b)=>String(a).localeCompare(String(b),"ar",{numeric:true});
function hijri(d){try{return (d||new Date()).toLocaleDateString("ar-SA-u-ca-islamic-umalqura",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}catch(e){return ""}}

/* بيانات تجريبية واضحة للعرض فقط (?demo=1) */
function demo(){const cls=["6/1","6/2","6/3"],R=[],S=[];let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  cls.forEach((c,ci)=>{for(let i=1;i<=12;i++){const code=String(1000+ci*100+i);S.push({name:"طالب "+ar(i)+" (تجريبي)",cls:c,code:code});
    ORDER.forEach((L,li)=>{if(rnd()<.18+li*.06)return;const D=ND[L];const nq=D?D.Q.length:5,ns=D?D.STDS.length:1;
      const pre=Math.round(25+rnd()*35),post=Math.min(100,Math.round(pre+15+rnd()*40)),np=Math.min(100,Math.round(post-10+rnd()*20));
      R.push({lesson:L,name:"طالب "+ar(i)+" (تجريبي)",cls:c,code:code,pre:{got:Math.round(pre/100*6),total:6},post:{got:Math.round(post/100*16),total:16},
        objectives:[0,1,2,3].map(()=>Math.round(40+rnd()*60)),healed:[0,1,2,3].map(()=>rnd()<.3),
        nafes:{pct:np,lv:[Math.round(50+rnd()*50),Math.round(35+rnd()*60),Math.round(20+rnd()*70)],std:Array.from({length:ns},()=>Math.round(30+rnd()*70)),prePct:Math.round(np-20+rnd()*15),healed:[rnd()<.3,rnd()<.3,rnd()<.3]},
        nafesClass:rnd()<.7?{got:Math.round(np/100*nq),total:nq,pct:np}:null,nafesHome:rnd()<.5?{n:1+Math.floor(rnd()*4),best:Math.min(100,np+Math.round(rnd()*20))}:null,
        updatedAt:{toMillis:()=>Date.now()-Math.floor(rnd()*20)*864e5}})})}});
  const SV=S.slice(0,24).map(x=>({lesson:"survey_mijhar",name:x.name,cls:x.cls,code:x.code,survey:{role:"student",a:SURVEY.student.map(()=>rnd()<.7?2:rnd()<.6?1:0),txt:""}}));const TS=[0,1,2].map(i=>({_id:"survey__d"+i,survey:{role:"teacher",a:SURVEY.teacher.map(()=>rnd()<.6?5:4)}}));return {roster:S,results:R,classquiz:[],survey:SV,tsurvey:TS,demo:true}}

function load(cb,onNeedLogin){
  const P=new URLSearchParams(location.search);
  if(P.get("demo")==="1"||!(window.DURUS_FB&&window.DURUS_FB.apiKey&&window.firebase)){setTimeout(()=>cb(demo()),0);return}
  if(!firebase.apps.length)firebase.initializeApp(window.DURUS_FB);
  const auth=firebase.auth(),db=firebase.firestore();
  auth.onAuthStateChanged(u=>{if(!u){onNeedLogin(auth);return}
    Promise.all(["durus_roster","durus_results","durus_classquiz","durus_teacher"].map(c=>db.collection(c).get().then(s=>s.docs.map(d=>Object.assign({_id:d.id},d.data()))).catch(()=>[])))
      .then(([ro,re,cq,tt])=>{const sv=re.filter(r=>r.lesson==="survey_mijhar"&&r.survey);re=re.filter(r=>!String(r.lesson||"").startsWith("path_")&&r.lesson!=="survey_mijhar");const ts=(tt||[]).filter(d=>String(d._id).startsWith("survey__")&&d.survey);ro.forEach(r=>{if(!r.code)r.code=r._id});cb({roster:ro,results:re,classquiz:cq,survey:sv,tsurvey:ts,demo:false,user:u})})})}

const SURVEY={
  student:["الدروس في منصة «مِجهر» ممتعة وتشدّني للتعلم.","الأنشطة والواقع المعزز ساعدتني على فهم الدرس.","أصبحت أفهم أسئلة «نافس» وطريقة حلها أكثر من قبل.","أشعر بثقة أكبر استعدادًا لاختبار «نافس».","عرفت من نتيجتي ما أتقنه وما أحتاج إلى مراجعته.","ساعدتني الخطة العلاجية على تحسين مستواي.","التحدي ولوحة الشرف شجّعاني على الاجتهاد.","أرغب في دروس مثلها في الرياضيات والقراءة."],
  sAxes:["التشويق","الفهم","مهارات «نافس»","الثقة والاستعداد","التشخيص","العلاج","الدافعية","الاستدامة"],
  teacher:["أسهمت المنصة في رفع مستوى الطلاب في مهارات «نافس».","زادت المنصة دافعية الطلاب ومشاركتهم في التعلم.","وفّرت التقارير والتشخيص معلومات واضحة عن مستوى الطالب.","المنصة سهلة الاستخدام للطالب والمعلم.","أؤيد تعميم المبادرة على مواد وصفوف أخرى."],
  sLabels:["غير موافق","محايد","موافق"],tLabels:["غير موافق بشدة","غير موافق","محايد","موافق","موافق بشدة"]};
window.MJ={SURVEY,ar,esc,ORDER,TITLE,pct,mean,band,sortCls,hijri,load,ND};
})();
