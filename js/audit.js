// 詞庫品質檢查：所有主題 × 所有句型大量生成，列出可疑結果
// 用法：node tools/audit.js（需安裝 Node.js）；N=20 node tools/audit.js 顯示更多範例
const fs=require('fs'),path=require('path');const D=path.join(__dirname,'..');
const W=require(D+'/js/engine.js'),T=require(D+'/js/title-engine.js');
const j=f=>JSON.parse(fs.readFileSync(path.join(D,'data',f),'utf8'));
const topics=['food','city','transport','politics','life','technology'].flatMap(f=>j(`topics_${f}.json`).topics);
const cats=j('categories.json').categories;
const e=new W({patterns:j('patterns.json'),phrases:j('phrases.json'),categories:j('categories.json'),topics});
const t=new T(e,j('titles.json'));
// 所有單位名稱 → 來源
const orgOwners={};
const addOrg=(o,owner)=>{(orgOwners[o]=orgOwners[o]||new Set()).add(owner)};
topics.forEach(tp=>(tp.relations.organizations||[]).forEach(o=>addOrg(o,'t:'+tp.id)));
Object.keys(cats).forEach(c=>(cats[c].relations.organizations||[]).forEach(o=>addOrg(o,'c:'+c)));
const allOrgs=Object.keys(orgOwners).sort((a,b)=>b.length-a.length);
const styles=W.STYLES.filter(s=>(s.mode||'speech')==='speech').map(s=>s.id);
const issues={};let total=0;
const flag=(k,ctx)=>{(issues[k]=issues[k]||[]).push(ctx)};
const extraInputs=['做家事','冰箱','我的貓','水管','台北','鍋貼','蟑螂','颱風','某某某','測試','Pizza','鼠類偵防師','猴子訓練師'];
const inputs=topics.map(tp=>tp.name).concat(extraInputs);
for(const w of inputs){
  const cls=e.classify(w);
  const allowed=new Set();
  cls.hits.forEach(h=>{if(h.topic)allowed.add('t:'+h.topic.id);allowed.add('c:'+h.category)});allowed.add('c:general');
  for(const s of styles){
    const r=e.generate(w,{styleId:s});total++;
    const tx=r.text, ctxs=`[${w}|${r.style}] ${tx}`;
    if(/\{|\}|undefined|null|NaN/.test(tx))flag('未填變數',ctxs);
    if(s!=='absurd'){
      // 語意池來源檢查：用到的詞必須來自本主題、本分類或通用
      const okVals=new Set();
      cls.hits.forEach(h=>{ if(h.topic) Object.values(h.topic.relations).forEach(a=>a.forEach(v=>okVals.add(v))); const cd=cats[h.category]||cats.general; Object.values(cd.relations).forEach(a=>a.forEach(v=>okVals.add(v)));});
      Object.values(cats.general.relations).forEach(a=>a.forEach(v=>okVals.add(v)));
      (r.used||[]).forEach(v=>{ if(!okVals.has(v)) flag('詞彙來源不符:'+v,ctxs); });
      // 分類預設詞比例（有收錄主題時應該很少）
      if(cls.hits.some(h=>h.topic)){ const own=new Set(); cls.hits.forEach(h=>h.topic&&Object.values(h.topic.relations).forEach(a=>a.forEach(v=>own.add(v)))); const foreign=(r.used||[]).filter(v=>!own.has(v)); if(foreign.length>=3) flag('預設詞偏多',ctxs+'  ⟶'+foreign.join('/')); }
    }
    if(false){
      let rest=tx;
      for(const o of allOrgs){ if(rest.includes(o)){ const own=[...orgOwners[o]]; if(!own.some(x=>allowed.has(x))) flag('單位不相關:'+o,ctxs); rest=rest.split(o).join('#'); } }
    }
    // 重複片語（6 字以上出現兩次），排除故意重複的句子
    const plain=tx.replace(/後續追蹤|持續努力|階段性|一一|會議紀錄|研議|最快的速度|完成|列管|滿意|測量|專案/g,'');
    const m=plain.match(/(.{6,}).*\1/s); if(m) flag('重複片語',ctxs+'  ⟶「'+m[1]+'」');
    // 同一連接詞重複
    for(const c of ['也就是說','更重要的是','當然','其實','所以','另外']) if(tx.split(c).length>3) flag('連接詞過多:'+c,ctxs);
    if(tx.replace(/[。！？\n]/g,'').length<45) flag('太短',ctxs);
    if(/的的|，，|。。|、、|與與|及及/.test(tx)) flag('標點/字重複',ctxs);
  }
  for(const st of W.STYLES.filter(x=>x.mode==='angry')){ const a=e.generate(w,{styleId:st.id});total++; if(/\{|undefined/.test(a.text))flag('未填變數',a.text); const m=a.text.replace(/受夠了|凍未條|說了算|一次、兩次、三次|一個月了|決策者|強硬|現在就提出來/g,'').match(/(.{6,}).*\1/s); if(m) flag('強硬模式重複片語',`[${w}|${a.style}] ${a.text}  ⟶「${m[1]}」`); if(a.text.replace(/[。！？]/g,'').length<30) flag('強硬模式太短',`[${w}|${a.style}] ${a.text}`); }
  const ti=t.generate(w);total++; if(/\{|undefined/.test(ti.text))flag('未填變數',ti.text);
  if(Array.from(ti.title).length>12) flag('職稱過長',`[${w}] ${ti.title}`);
}
console.log('total',total);
for(const k of Object.keys(issues).sort((a,b)=>issues[b].length-issues[a].length)){console.log(`\n## ${k}: ${issues[k].length}`);issues[k].slice(0,(+process.env.N||3)).forEach(x=>console.log('  - '+x.slice(0,260)))}
