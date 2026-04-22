import { useState, useEffect } from "react";

const FB_URL = "https://apple-leadership-default-rtdb.firebaseio.com";

const DB = {
  async set(path, data) {
    try {
      await fetch(`${FB_URL}/${path}.json`, { method:"PUT", body:JSON.stringify(data) });
      return true;
    } catch { return false; }
  },
  async get(path) {
    try {
      const res = await fetch(`${FB_URL}/${path}.json`);
      return await res.json();
    } catch { return null; }
  },
  async push(path, data) {
    try {
      await fetch(`${FB_URL}/${path}.json`, { method:"POST", body:JSON.stringify(data) });
      return true;
    } catch { return false; }
  },
  async setSession(code, data) { return this.set(`sessions/${code}`, data); },
  async getSession(code) { return this.get(`sessions/${code}`); },
  async saveResult(code, name, data) {
    return this.push(`results/${code}`, { ...data, name, ts:Date.now() });
  },
  async getResults(code) {
    const raw = await this.get(`results/${code}`);
    if (!raw) return [];
    return Object.values(raw).sort((a,b) => b.ts - a.ts);
  },
};

const APPLES = [
  { id:"newton",    emoji:"🍎", name:"뉴턴의 사과",          type:"탐구통찰형", color:"#c0392b", bg:"#fff5f5",
    keywords:["질문","본질","통찰"],
    story:"모두가 수백 번 봤지만 아무도 묻지 않았던 것.\n뉴턴은 떨어지는 사과 하나에 '왜?'라고 물었다.\n그 질문 하나가 세상의 원리를 바꿨다.",
    tagline:"당연한 것에 '왜?'를 묻는 리더",
    strength:"남들이 보지 못한 구조와 원리를 꿰뚫는 통찰력",
    caution:"분석에 머물다 실행 타이밍을 놓칠 수 있음",
    questions:["나는 남들이 당연하게 넘기는 것에 '왜?'라고 질문한다","문제를 해결할 때 표면보다 근본 원인을 먼저 찾는다","결론보다 과정과 원리를 이해하는 데 더 많은 시간을 쓴다"] },
  { id:"jobs",      emoji:"🍏", name:"잡스의 사과",           type:"창조혁신형", color:"#27ae60", bg:"#f0fff4",
    keywords:["혁신","실행","용기"],
    story:"완전하지 않아도 세상에 내놓았다.\n한 입 베어문 불완전한 사과가 세상을 바꿨다.\n완벽함보다 먼저 실행하는 것이 더 강하다.",
    tagline:"완벽함보다 실행을 택하는 리더",
    strength:"아무도 가지 않은 길을 먼저 열어내는 추진력",
    caution:"독단적 추진으로 팀이 소외될 수 있음",
    questions:["나는 완벽하지 않아도 일단 시도하고 보는 편이다","기존 방식보다 새로운 방법을 찾는 것이 더 즐겁다","아무도 해보지 않은 것에 도전하는 것이 두렵지 않다"] },
  { id:"adam",      emoji:"🍑", name:"아담과 이브의 사과",     type:"선택책임형", color:"#d35400", bg:"#fff8f0",
    keywords:["선택","책임","진정성"],
    story:"먹지 말라는 사과를 먹었다.\n아담은 이브 탓, 이브는 뱀 탓 — 그 순간 모든 것이 바뀌었다.\n선택과 그 결과는 언제나 함께 온다.",
    tagline:"내 선택의 무게를 온전히 안는 리더",
    strength:"모든 결정에 책임을 지고 변명하지 않는 진정성",
    caution:"책임감이 지나쳐 자책과 번아웃으로 이어질 수 있음",
    questions:["나는 내 결정의 결과를 타인의 탓으로 돌리지 않는다","실수했을 때 변명보다 인정이 먼저 나온다","나는 내 선택이 가져올 결과를 충분히 감수하며 결정한다"] },
  { id:"snowwhite", emoji:"🍎", name:"백설공주의 사과",        type:"위기감지형", color:"#8e44ad", bg:"#fdf0ff",
    keywords:["판단","직관","리스크"],
    story:"겉은 빨갛고 탐스러운 — 하지만 속은 독.\n아름다운 것이 언제나 좋은 것은 아니다.\n달콤한 제안 뒤에 숨은 독을 먼저 보는 사람.",
    tagline:"달콤함 뒤의 독을 먼저 보는 리더",
    strength:"표면에 속지 않고 본질과 위험을 먼저 감지하는 직관력",
    caution:"지나친 경계심이 기회를 놓치게 만들 수 있음",
    questions:["나는 좋은 제안이나 기회 앞에서 먼저 리스크를 생각한다","상황이나 사람의 이면을 파악하는 편이다","팀에서 문제가 생기기 전에 미리 신호를 감지하는 편이다"] },
  { id:"tell",      emoji:"🎯", name:"윌리엄 텔의 사과",      type:"성과실행형", color:"#2980b9", bg:"#f0f8ff",
    keywords:["집중","압박","결과"],
    story:"아들 머리 위의 사과를 반드시 맞혀야 하는 상황.\n손이 떨려도, 두려워도 — 그는 쏘았다.\n극한의 압박 속에서 결과를 만들어내는 사람.",
    tagline:"위기 속에서 가장 빛나는 리더",
    strength:"극한의 압박 속에서도 흔들리지 않고 결과를 만드는 집중력",
    caution:"과정과 사람보다 결과에만 치중할 수 있음",
    questions:["압박이 심할수록 오히려 집중력이 높아지는 편이다","나는 어떤 상황에서도 약속한 결과를 반드시 만들어낸다","목표가 정해지면 감정보다 실행이 먼저 움직인다"] },
  { id:"cezanne",   emoji:"🎨", name:"세잔의 사과",            type:"장인완성형", color:"#16a085", bg:"#f0fffc",
    keywords:["반복","완성도","집요함"],
    story:"'사과 하나로 파리를 정복하겠다.'\n같은 사과를 수백 번, 수천 번 그렸다.\n그 집요함이 현대 미술을 바꿨다.",
    tagline:"될 때까지 하는 것이 실력이 되는 리더",
    strength:"흔들리지 않는 깊이와 탁월한 완성도를 만드는 집요함",
    caution:"속도와 유연성이 부족해 보일 수 있음",
    questions:["나는 빠른 결과보다 완성도 높은 결과를 더 중요하게 여긴다","한 가지 일을 깊이 파고드는 것이 여러 일을 하는 것보다 편하다","반복과 연습을 통해 실력이 쌓인다고 믿는다"] },
  { id:"hercules",  emoji:"💪", name:"헤라클레스의 황금 사과",  type:"목표완수형", color:"#f39c12", bg:"#fffbf0",
    keywords:["목표","불굴","완수"],
    story:"12가지 불가능한 과업 중 하나.\n세상 끝 정원까지 가서 황금 사과를 가져왔다.\n불가능하다고 해도 결국 해내는 사람.",
    tagline:"불가능을 가능으로 만드는 리더",
    strength:"어떤 장애물에도 포기하지 않고 끝까지 완수하는 불굴의 의지",
    caution:"과정의 무리함이 팀 전체를 소진시킬 수 있음",
    questions:["불가능해 보이는 목표도 일단 도전해본다","포기하고 싶은 순간에도 끝까지 완수하는 편이다","목표를 향해 가는 과정에서 장애물이 나를 더 강하게 만든다"] },
  { id:"eris",      emoji:"✨", name:"에리스의 황금 사과",      type:"변화촉진형", color:"#e74c3c", bg:"#fff0f0",
    keywords:["도전","갈등","촉매"],
    story:"불화의 여신이 '가장 아름다운 자에게'라 쓴 황금 사과.\n잔치판을 뒤집고 결국 트로이 전쟁을 일으켰다.\n갈등을 두려워하지 않고 변화의 촉매가 되는 사람.",
    tagline:"판을 흔들어 새로운 판을 만드는 리더",
    strength:"정체된 조직에 긴장과 변화의 불꽃을 점화하는 담대함",
    caution:"갈등 관리 없이 분열을 유발할 수 있음",
    questions:["조직이 너무 안정적으로만 흘러갈 때 변화가 필요하다고 느낀다","나는 불편한 질문을 던지거나 도전적인 의견을 내는 편이다","갈등이 생기더라도 필요한 변화는 추진해야 한다고 생각한다"] },
];

const NO_TYPE = {
  newton:"실행은 잘 하지만 '왜?'를 묻지 않는 팀. 방향이 틀려도 열심히 달릴 수 있어요.",
  jobs:"안정적이지만 새로운 시도가 없는 팀. 변화하는 환경에 뒤처질 수 있어요.",
  adam:"실수했을 때 서로 눈치만 보거나 책임 소재가 불명확할 수 있어요.",
  snowwhite:"낙관적이고 추진력은 있지만 리스크를 놓치는 실수가 반복될 수 있어요.",
  tell:"고민은 많은데 결과가 안 나오는 팀. 회의는 많고 실행은 적은 상태일 수 있어요.",
  cezanne:"아이디어는 많지만 완성도가 낮거나 마무리가 항상 아쉬운 팀일 수 있어요.",
  hercules:"시작은 잘 하지만 끝까지 가는 사람이 없어요. 완수율이 낮을 수 있어요.",
  eris:"변화가 필요한데 아무도 먼저 말을 꺼내지 않는 정체된 팀일 수 있어요.",
};

const makeCode = () => {
  const w = ["APPLE","NEWTON","JOBS","ERIS","ROUN"][Math.floor(Math.random()*5)];
  return `${w}-${Math.floor(1000+Math.random()*9000)}`;
};
const calcScores = (ans) => {
  const s = {};
  APPLES.forEach(a => { s[a.id] = [0,1,2].reduce((sum,i) => sum+(ans[`${a.id}_${i}`]||0),0); });
  return s;
};
const topApple = (scores) => [...APPLES].sort((a,b) => (scores[b.id]||0)-(scores[a.id]||0))[0];

export default function App() {
  const [sc, setSc]             = useState("home");
  const [code, setCode]         = useState("");
  const [sess, setSess]         = useState(null);
  const [codeIn, setCodeIn]     = useState("");
  const [nameIn, setNameIn]     = useState("");
  const [teamIn, setTeamIn]     = useState("");
  const [joinErr, setJoinErr]   = useState("");
  const [sessName, setSessName] = useState("");
  const [teamsRaw, setTeamsRaw] = useState("영업팀\n마케팅팀\n개발팀\n인사팀");
  const [newCode, setNewCode]   = useState("");
  const [pInfo, setPInfo]       = useState(null);
  const [storyI, setStoryI]     = useState(0);
  const [intuitive, setIntuitive] = useState(null);
  const [answers, setAnswers]   = useState({});
  const [appleI, setAppleI]     = useState(0);
  const [qI, setQI]             = useState(0);
  const [scores, setScores]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [dashData, setDashData] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (sc !== "f_dash") return;
    const load = async () => {
      const res = await DB.getResults(code);
      setDashData(res || []);
      setLastRefresh(new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [sc, code]);

  useEffect(() => {
    if (sc === "p_result" && !submitted && Object.keys(scores).length > 0) {
      const top = topApple(scores);
      DB.saveResult(code, pInfo?.name||"익명", {
        team:pInfo?.team||"", topTypeId:top.id, topType:top.type,
        topEmoji:top.emoji, topColor:top.color, intuitive, scores,
      }).then(() => setSubmitted(true));
    }
  }, [sc]);

  const handleAnswer = (val) => {
    const key = `${APPLES[appleI].id}_${qI}`;
    const newAns = {...answers,[key]:val};
    setAnswers(newAns);
    if (qI < 2)                        { setQI(qI+1); }
    else if (appleI < APPLES.length-1) { setAppleI(appleI+1); setQI(0); }
    else                               { setScores(calcScores(newAns)); setSc("p_result"); }
  };

  const resetAll = () => {
    setSc("home"); setCode(""); setSess(null); setCodeIn(""); setNameIn(""); setTeamIn("");
    setJoinErr(""); setNewCode(""); setPInfo(null); setStoryI(0); setIntuitive(null);
    setAnswers({}); setAppleI(0); setQI(0); setScores({}); setSubmitted(false); setDashData([]);
  };

  const curA = APPLES[appleI];
  const doneQ = appleI*3+qI;
  const pct = Math.round((doneQ/(APPLES.length*3))*100);

  if (sc==="home") return (
    <Page>
      <Box center>
        <FloatingApples/>
        <h1 style={S.bigTitle}>나는 어떤 사과인가?</h1>
        <p style={S.bigSub}>🍎 사과 리더십 유형 진단 시스템</p>
        <p style={{...S.muted,margin:"0 0 28px",textAlign:"center",lineHeight:1.8}}>강사와 참여자가 실시간으로 연결되어<br/>팀별·부서별 리더십 분포를 한눈에 분석합니다</p>
        <Btn onClick={()=>setSc("f_create")} style={{marginBottom:12}}>👨‍🏫 강사 모드 — 세션 만들기</Btn>
        <Btn blue onClick={()=>setSc("p_join")}>🙋 참여자 모드 — 진단 참여하기</Btn>
      </Box>
    </Page>
  );

  if (sc==="f_create") return (
    <Page>
      <Box>
        <BackBtn onClick={()=>setSc("home")}/>
        <h2 style={S.h2}>👨‍🏫 세션 만들기</h2>
        <Label>강의·교육 이름</Label>
        <Input placeholder="예) 2025 리더십 워크샵" value={sessName} onChange={e=>setSessName(e.target.value)}/>
        <Label>팀/부서 목록 <span style={S.hint}>(한 줄에 하나씩)</span></Label>
        <textarea style={{...S.input,height:120,resize:"none"}} value={teamsRaw} onChange={e=>setTeamsRaw(e.target.value)}/>
        <Btn style={{marginTop:4}} disabled={loading} onClick={async()=>{
          setLoading(true);
          const c = makeCode();
          const teams = teamsRaw.split("\n").map(x=>x.trim()).filter(Boolean);
          const data = {sessionName:sessName||"리더십 진단",teams,createdAt:Date.now()};
          await DB.setSession(c,data);
          setCode(c); setSess(data); setNewCode(c); setLoading(false);
        }}>{loading?"생성 중...":"🍎 세션 코드 생성"}</Btn>
        {newCode && <>
          <div style={S.codeBox}>
            <p style={{color:"#888",fontSize:"0.75rem",margin:"0 0 8px"}}>참여자에게 이 코드를 공유하세요</p>
            <div style={S.codeDisplay}>{newCode}</div>
            <p style={{color:"#aaa",fontSize:"0.72rem",margin:"8px 0 0"}}>참여자 화면 → 참여자 모드 → 코드 입력</p>
          </div>
          <Btn onClick={()=>setSc("f_dash")} style={{marginTop:12}}>📊 실시간 대시보드 열기 →</Btn>
        </>}
      </Box>
    </Page>
  );

  if (sc==="f_dash") {
    const total=dashData.length;
    const dist=Object.fromEntries(APPLES.map(a=>[a.id,0]));
    dashData.forEach(r=>{if(dist[r.topTypeId]!==undefined)dist[r.topTypeId]++;});
    const maxCnt=Math.max(...Object.values(dist),1);
    const missing=APPLES.filter(a=>dist[a.id]===0);
    const teams=sess?.teams||[];
    return (
      <Page bg="#1a1a2e">
        <div style={{maxWidth:620,width:"100%"}}>
          <div style={S.dashHead}>
            <div>
              <div style={{fontSize:"0.72rem",color:"#aaa",marginBottom:4}}>{sess?.sessionName}</div>
              <div style={S.dashCode}>{code}</div>
              <div style={{fontSize:"0.7rem",color:"#666",marginTop:4}}>🔄 {lastRefresh||"로딩 중..."} 자동갱신</div>
            </div>
            <div style={S.dashStat}><div style={S.dashBigNum}>{total}</div><div style={{fontSize:"0.7rem",color:"#aaa"}}>참여자</div></div>
          </div>
          <DashCard title="📊 유형별 분포">
            <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6,alignItems:"flex-end",paddingBottom:4}}>
              {APPLES.map(a=>{const cnt=dist[a.id];const h=cnt>0?Math.max((cnt/maxCnt)*90,18):6;return(
                <div key={a.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <span style={{fontSize:"0.7rem",fontWeight:700,color:cnt>0?a.color:"#555",minHeight:16}}>{cnt>0?cnt:""}</span>
                  <div style={{width:"100%",height:`${h}px`,background:cnt>0?a.color:"#2a2a4a",borderRadius:"4px 4px 0 0",transition:"height 0.6s ease"}}/>
                  <span style={{fontSize:"1rem"}}>{a.emoji}</span>
                  <span style={{fontSize:"0.48rem",color:cnt>0?a.color:"#555",textAlign:"center",fontWeight:600,lineHeight:1.2}}>{a.type.replace("형","")}</span>
                </div>);})}
            </div>
          </DashCard>
          <DashCard title={`👥 참여자 목록 (${total}명)`}>
            {total===0
              ?<p style={{color:"#555",textAlign:"center",padding:"16px 0",fontSize:"0.82rem"}}>아직 참여자가 없어요 · 세션 코드: <strong style={{color:"#e74c3c"}}>{code}</strong></p>
              :<div style={{display:"flex",flexDirection:"column",gap:6}}>{dashData.map((r,i)=>{const a=APPLES.find(x=>x.id===r.topTypeId);return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#0d0d1e",borderRadius:10,border:`1px solid ${a?.color}33`}}>
                  <span style={{fontSize:"1.1rem"}}>{a?.emoji}</span>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"0.85rem",color:"#eee"}}>{r.name}</div><div style={{fontSize:"0.7rem",color:"#666"}}>{r.team||"팀 미설정"}</div></div>
                  <div style={{background:a?.color,color:"#fff",borderRadius:50,padding:"3px 10px",fontSize:"0.7rem",fontWeight:700}}>{a?.type}</div>
                </div>);})}</div>}
          </DashCard>
          {teams.length>0&&total>0&&(
            <DashCard title="🏢 팀별 사과 분포">
              {teams.map(tm=>{const members=dashData.filter(r=>r.team===tm);if(!members.length)return(<div key={tm} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid #1e1e3a"}}><span style={{fontSize:"0.78rem",color:"#555"}}>{tm} · 아직 참여자 없음</span></div>);return(
                <div key={tm} style={{marginBottom:14}}>
                  <div style={{fontSize:"0.78rem",fontWeight:700,color:"#aaa",marginBottom:7}}>{tm} <span style={{color:"#555",fontWeight:400}}>({members.length}명)</span></div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{members.map((m,i)=>{const a=APPLES.find(x=>x.id===m.topTypeId);return(<div key={i} style={{background:`${a?.color}25`,border:`1px solid ${a?.color}55`,borderRadius:8,padding:"4px 10px",fontSize:"0.72rem",color:a?.color,fontWeight:600}}>{a?.emoji} {m.name}</div>);})}</div>
                </div>);})}
            </DashCard>)}
          {missing.length>0&&total>=3&&(
            <DashCard title="⚠️ 우리 팀에 없는 사과" warn>
              {missing.map(a=>(<div key={a.id} style={{borderLeft:`3px solid ${a.color}`,paddingLeft:12,marginBottom:12}}><div style={{color:a.color,fontWeight:700,fontSize:"0.83rem"}}>{a.emoji} {a.type}</div><div style={{color:"#888",fontSize:"0.76rem",marginTop:3,lineHeight:1.6}}>{NO_TYPE[a.id]}</div></div>))}
            </DashCard>)}
          <button style={S.ghostDark} onClick={resetAll}>← 처음으로</button>
        </div>
      </Page>
    );
  }

  if (sc==="p_join") return (
    <Page>
      <Box>
        <BackBtn onClick={()=>setSc("home")}/>
        <div style={{textAlign:"center",fontSize:"2.5rem",marginBottom:12}}>🙋</div>
        <h2 style={{...S.h2,textAlign:"center"}}>진단 참여하기</h2>
        <Label>세션 코드 <span style={S.hint}>(강사에게 받은 코드)</span></Label>
        <Input placeholder="예) APPLE-1234" value={codeIn} onChange={e=>setCodeIn(e.target.value.toUpperCase())}/>
        <Label>이름</Label>
        <Input placeholder="홍길동" value={nameIn} onChange={e=>setNameIn(e.target.value)}/>
        {joinErr&&<p style={{color:"#e74c3c",fontSize:"0.8rem",marginBottom:8}}>{joinErr}</p>}
        <Btn style={{marginTop:4}} disabled={loading} onClick={async()=>{
          if(!codeIn.trim()||!nameIn.trim()){setJoinErr("세션 코드와 이름을 모두 입력해주세요");return;}
          setLoading(true); setJoinErr("");
          const s=await DB.getSession(codeIn.trim());
          setLoading(false);
          if(!s){setJoinErr("세션 코드를 찾을 수 없어요. 강사에게 다시 확인해주세요.");return;}
          setCode(codeIn.trim()); setSess(s);
          if(s.teams?.length>0){setTeamIn(s.teams[0]);setSc("p_team");}
          else{setPInfo({name:nameIn.trim(),team:""});setSc("p_story");}
        }}>{loading?"확인 중...":"참여하기 →"}</Btn>
      </Box>
    </Page>
  );

  if (sc==="p_team") return (
    <Page>
      <Box>
        <h2 style={S.h2}>내 팀/부서를 선택하세요</h2>
        <p style={{...S.muted,marginBottom:20}}>{sess?.sessionName}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {sess?.teams?.map(tm=>(<button key={tm} onClick={()=>setTeamIn(tm)} style={{...S.teamBtn,borderColor:teamIn===tm?"#c0392b":"#e0e0e0",background:teamIn===tm?"#fff5f5":"#fff",color:teamIn===tm?"#c0392b":"#555",fontWeight:teamIn===tm?700:400}}>{teamIn===tm?"✅ ":""}{tm}</button>))}
        </div>
        <Btn onClick={()=>{setPInfo({name:nameIn.trim(),team:teamIn});setSc("p_story");}}>선택 완료 →</Btn>
      </Box>
    </Page>
  );

  if (sc==="p_story") {
    const a=APPLES[storyI];
    return (
      <Page bg={a.bg}>
        <Box>
          <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:20}}>
            {APPLES.map((_,i)=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:i<=storyI?a.color:"#ddd",transition:"all 0.3s",transform:i===storyI?"scale(1.4)":"scale(1)"}}/>)}
          </div>
          <div style={{...S.appleCircle,background:a.color}}>{a.emoji}</div>
          <h2 style={{...S.h2,color:a.color,textAlign:"center"}}>{a.name}</h2>
          <div style={{textAlign:"center",marginBottom:14}}><span style={{background:a.color,color:"#fff",borderRadius:50,padding:"4px 16px",fontSize:"0.78rem",fontWeight:700,display:"inline-block"}}>{a.type}</span></div>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16,flexWrap:"wrap"}}>
            {a.keywords.map(k=><span key={k} style={{border:`1.5px solid ${a.color}`,color:a.color,borderRadius:50,padding:"2px 12px",fontSize:"0.74rem",fontWeight:500}}>{k}</span>)}
          </div>
          <p style={{color:"#444",lineHeight:1.9,fontSize:"0.88rem",whiteSpace:"pre-line",background:"rgba(255,255,255,0.7)",borderRadius:12,padding:"14px 16px",marginBottom:14}}>{a.story}</p>
          <p style={{color:a.color,fontFamily:"Georgia,serif",fontSize:"0.95rem",fontWeight:700,textAlign:"center",marginBottom:24}}>"{a.tagline}"</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {storyI<APPLES.length-1
              ?<Btn style={{background:a.color,boxShadow:`0 4px 16px ${a.color}55`}} onClick={()=>setStoryI(storyI+1)}>다음 사과 →</Btn>
              :<Btn style={{background:a.color,boxShadow:`0 4px 16px ${a.color}55`}} onClick={()=>setSc("p_intuitive")}>🍎 직관 선택하기</Btn>}
            {storyI>0&&<GhostBtn onClick={()=>setStoryI(storyI-1)}>← 이전</GhostBtn>}
          </div>
        </Box>
      </Page>
    );
  }

  if (sc==="p_intuitive") return (
    <Page>
      <div style={{maxWidth:480,width:"100%"}}>
        <h2 style={{...S.h2,textAlign:"center"}}>지금 가장 끌리는 사과는?</h2>
        <p style={{...S.muted,textAlign:"center",marginBottom:20}}>정답 없어요. 직관으로 하나만 고르세요 🍎</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {APPLES.map(a=>(<button key={a.id} onClick={()=>setIntuitive(a.id)} style={{border:`2px solid ${a.color}`,borderRadius:14,padding:"14px 8px",background:intuitive===a.id?a.color:"#fff",color:intuitive===a.id?"#fff":a.color,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.2s",fontFamily:"inherit",transform:intuitive===a.id?"scale(1.04)":"scale(1)",boxShadow:intuitive===a.id?`0 6px 20px ${a.color}55`:"none"}}><span style={{fontSize:"1.6rem"}}>{a.emoji}</span><span style={{fontSize:"0.72rem",fontWeight:700,textAlign:"center",lineHeight:1.3}}>{a.name}</span><span style={{fontSize:"0.65rem",opacity:0.85}}>{a.type}</span></button>))}
        </div>
        <Btn style={{opacity:intuitive?1:0.4}} disabled={!intuitive} onClick={()=>setSc("p_diag")}>행동 진단 시작 →</Btn>
      </div>
    </Page>
  );

  if (sc==="p_diag") return (
    <Page bg={curA.bg}>
      <Box>
        <div style={{marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.75rem",color:"#999",marginBottom:6}}><span>{curA.name}</span><span>{doneQ+1} / {APPLES.length*3}</span></div>
          <div style={{height:6,background:"#e8e8e8",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:curA.color,borderRadius:3,transition:"width 0.35s ease"}}/></div>
        </div>
        <div style={{marginBottom:20}}><span style={{background:curA.color,color:"#fff",borderRadius:50,padding:"5px 16px",fontSize:"0.78rem",fontWeight:700,display:"inline-block"}}>{curA.emoji} {curA.type}</span></div>
        <p style={{fontFamily:"Georgia,serif",fontSize:"1rem",color:"#1a1a1a",lineHeight:1.75,fontWeight:700,marginBottom:30}}>{curA.questions[qI]}</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:10}}>
          {[1,2,3,4,5].map(v=>{const sel=answers[`${curA.id}_${qI}`]===v;return(<button key={v} onClick={()=>handleAnswer(v)} style={{width:52,height:52,borderRadius:"50%",border:`2px solid ${curA.color}`,background:sel?curA.color:"#fff",color:sel?"#fff":curA.color,fontSize:"1.1rem",fontWeight:700,cursor:"pointer",transition:"all 0.15s",fontFamily:"inherit",boxShadow:sel?`0 4px 14px ${curA.color}55`:"none"}}>{v}</button>);})}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",color:"#bbb",padding:"0 2px"}}><span>전혀 아니다</span><span>매우 그렇다</span></div>
      </Box>
    </Page>
  );

  if (sc==="p_result") {
    const top=topApple(scores);const intA=APPLES.find(a=>a.id===intuitive);const match=intuitive===top?.id;
    const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    return (
      <Page>
        <Box>
          <div style={{background:`linear-gradient(135deg,${top?.color}18,${top?.color}35)`,border:`2px solid ${top?.color}`,borderRadius:20,padding:"24px 16px",textAlign:"center",marginBottom:18}}>
            <div style={{...S.appleCircle,background:top?.color,marginBottom:12}}>{top?.emoji}</div>
            <p style={{color:"#888",fontSize:"0.75rem",margin:"0 0 4px"}}>나의 리더십 유형</p>
            <h2 style={{color:top?.color,fontSize:"1.65rem",margin:"0 0 4px",fontFamily:"Georgia,serif"}}>{top?.type}</h2>
            <p style={{color:top?.color,fontSize:"0.83rem",margin:"0 0 12px"}}>{top?.name}</p>
            <p style={{fontFamily:"Georgia,serif",color:"#444",fontSize:"0.88rem",margin:0}}>"{top?.tagline}"</p>
          </div>
          <div style={{background:"#fff",border:"1px solid #eee",borderRadius:16,padding:16,marginBottom:14}}>
            <h3 style={{fontSize:"0.85rem",margin:"0 0 12px",color:"#333"}}>📊 나의 사과 점수</h3>
            {sorted.map(([id,score])=>{const a=APPLES.find(x=>x.id===id);return(<div key={id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:"0.9rem",width:22}}>{a?.emoji}</span><span style={{fontSize:"0.68rem",color:"#666",width:60,flexShrink:0}}>{a?.type}</span><div style={{flex:1,height:7,background:"#f0f0f0",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${(score/15)*100}%`,background:a?.color,borderRadius:4,transition:"width 0.8s ease"}}/></div><span style={{fontSize:"0.7rem",fontWeight:700,color:a?.color,width:28,textAlign:"right"}}>{score}점</span></div>);})}
          </div>
          <div style={{background:"#fff",border:"1px solid #eee",borderRadius:16,padding:16,marginBottom:14}}>
            <h3 style={{fontSize:"0.85rem",margin:"0 0 12px",color:"#333"}}>💡 직관 vs 행동 비교</h3>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{flex:1,border:`2px solid ${intA?.color}`,borderRadius:10,padding:"10px 6px",textAlign:"center"}}><div style={{fontSize:"0.65rem",color:"#aaa"}}>직관 선택</div><div style={{color:intA?.color,fontWeight:700,fontSize:"0.8rem",marginTop:2}}>{intA?.emoji} {intA?.type}</div></div>
              <div style={{fontSize:"1.3rem"}}>{match?"✅":"⚡"}</div>
              <div style={{flex:1,border:`2px solid ${top?.color}`,borderRadius:10,padding:"10px 6px",textAlign:"center"}}><div style={{fontSize:"0.65rem",color:"#aaa"}}>행동 진단</div><div style={{color:top?.color,fontWeight:700,fontSize:"0.8rem",marginTop:2}}>{top?.emoji} {top?.type}</div></div>
            </div>
            <p style={{background:"#fffbf0",borderRadius:8,padding:"10px 12px",fontSize:"0.78rem",color:"#555",lineHeight:1.65,margin:0}}>{match?`✨ 두 결과가 일치해요! ${top?.type}이 나의 진짜 핵심 리더십입니다.`:`🔍 원하는 리더십(${intA?.type})과 현재 행동(${top?.type}) 사이에 간격이 있어요. 이 간격을 좁히려면 오늘 무엇을 할 수 있을까요?`}</p>
          </div>
          <div style={{background:"#f9f9f9",borderRadius:16,padding:16,marginBottom:14}}>
            <div style={{marginBottom:10}}><span style={{fontSize:"0.75rem",fontWeight:700,color:"#555"}}>💪 강점</span><p style={{fontSize:"0.83rem",color:"#444",margin:"4px 0 0",lineHeight:1.65}}>{top?.strength}</p></div>
            <div><span style={{fontSize:"0.75rem",fontWeight:700,color:"#555"}}>⚠️ 주의점</span><p style={{fontSize:"0.83rem",color:"#444",margin:"4px 0 0",lineHeight:1.65}}>{top?.caution}</p></div>
          </div>
          <div style={{background:submitted?"#f0fff4":"#fffbf0",border:`1.5px solid ${submitted?"#27ae60":"#f39c12"}`,borderRadius:12,padding:"12px 16px",textAlign:"center",marginBottom:16}}>
            <p style={{color:submitted?"#27ae60":"#f39c12",fontSize:"0.83rem",fontWeight:700,margin:0}}>{submitted?"✅ 결과가 강사 대시보드에 전송됐어요!":"⏳ 결과 전송 중..."}</p>
          </div>
          <GhostBtn onClick={resetAll}>🔄 다시 진단하기</GhostBtn>
        </Box>
      </Page>
    );
  }
  return null;
}

function Page({children,bg="linear-gradient(160deg,#fff9f0,#ffe8d6)"}) {
  return (<div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 16px 60px",fontFamily:"'Noto Sans KR',sans-serif"}}><style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');*{box-sizing:border-box;}button{cursor:pointer;}`}</style>{children}</div>);
}
function Box({children,center=false}) {
  return <div style={{background:"#fff",borderRadius:24,padding:"32px 22px",maxWidth:480,width:"100%",boxShadow:"0 16px 48px rgba(0,0,0,0.09)",textAlign:center?"center":"left"}}>{children}</div>;
}
function DashCard({title,children,warn=false}) {
  return (<div style={{background:warn?"#1a0f00":"#0d0d22",border:`1px solid ${warn?"#3a2000":"#1e1e3a"}`,borderRadius:16,padding:20,marginBottom:14}}><h3 style={{margin:"0 0 14px",fontSize:"0.88rem",color:warn?"#f39c12":"#aaa",fontWeight:700}}>{title}</h3>{children}</div>);
}
function FloatingApples() {
  return (<div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16,fontSize:"1.8rem"}}>{["🍎","🍏","🍎","🍏","🍎"].map((e,i)=>(<span key={i} style={{display:"inline-block",animation:`fl${i} ${2.5+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.4}s`}}>{e}<style>{`@keyframes fl${i}{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style></span>))}</div>);
}
function Btn({children,onClick,style={},blue=false,disabled=false}) {
  return (<button disabled={disabled} onClick={onClick} style={{background:disabled?"#ccc":blue?"linear-gradient(135deg,#2980b9,#3498db)":"linear-gradient(135deg,#c0392b,#e74c3c)",color:"#fff",border:"none",borderRadius:50,padding:"13px 24px",fontSize:"0.92rem",fontWeight:700,width:"100%",marginBottom:8,fontFamily:"inherit",boxShadow:disabled?"none":blue?"0 4px 16px rgba(41,128,185,0.35)":"0 4px 16px rgba(192,57,43,0.35)",...style}}>{children}</button>);
}
function GhostBtn({children,onClick}) {
  return <button onClick={onClick} style={{background:"transparent",color:"#888",border:"1.5px solid #ddd",borderRadius:50,padding:"11px 24px",fontSize:"0.86rem",width:"100%",marginBottom:8,fontFamily:"inherit"}}>{children}</button>;
}
function BackBtn({onClick}) {
  return <button onClick={onClick} style={{background:"none",border:"none",color:"#aaa",fontSize:"0.82rem",padding:"0 0 16px",fontFamily:"inherit"}}>← 뒤로</button>;
}
function Label({children}) { return <p style={{fontSize:"0.78rem",fontWeight:700,color:"#555",margin:"12px 0 5px"}}>{children}</p>; }
function Input({...props}) { return <input {...props} style={{width:"100%",border:"1.5px solid #e0e0e0",borderRadius:10,padding:"10px 14px",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",marginBottom:4}}/>; }

const S = {
  bigTitle:{fontFamily:"Georgia,serif",fontSize:"1.9rem",color:"#2c1810",margin:"0 0 6px",fontWeight:700},
  bigSub:{color:"#c0392b",fontSize:"0.88rem",margin:"0 0 12px",fontWeight:600},
  h2:{fontFamily:"Georgia,serif",fontSize:"1.35rem",color:"#2c1810",margin:"0 0 16px",fontWeight:700},
  muted:{color:"#888",fontSize:"0.84rem",lineHeight:1.7},
  hint:{color:"#bbb",fontWeight:400,fontSize:"0.72rem"},
  input:{width:"100%",border:"1.5px solid #e0e0e0",borderRadius:10,padding:"10px 14px",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",marginBottom:4,display:"block"},
  codeBox:{background:"#fff5f5",border:"2px solid #e74c3c",borderRadius:16,padding:"18px",marginTop:16,textAlign:"center"},
  codeDisplay:{fontSize:"2rem",fontWeight:900,color:"#c0392b",letterSpacing:5,fontFamily:"monospace"},
  appleCircle:{width:68,height:68,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.9rem",margin:"0 auto",boxShadow:"0 8px 24px rgba(0,0,0,0.15)"},
  dashHead:{background:"#0d0d22",border:"1px solid #1e1e3a",borderRadius:16,padding:"18px 20px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"},
  dashCode:{fontSize:"1.6rem",fontWeight:900,color:"#e74c3c",letterSpacing:4,fontFamily:"monospace"},
  dashStat:{textAlign:"right"},
  dashBigNum:{fontSize:"2.4rem",fontWeight:900,color:"#f1c40f",lineHeight:1},
  ghostDark:{background:"transparent",color:"#555",border:"1px solid #2a2a4a",borderRadius:50,padding:"11px 24px",fontSize:"0.84rem",width:"100%",fontFamily:"inherit",marginTop:4},
  teamBtn:{border:"2px solid",borderRadius:12,padding:"12px 16px",fontSize:"0.88rem",fontFamily:"inherit",textAlign:"left",transition:"all 0.15s",width:"100%",marginBottom:4},
};
