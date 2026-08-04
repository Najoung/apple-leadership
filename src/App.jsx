import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const FB_URL = "https://apple-leadership-default-rtdb.firebaseio.com";
const DB = {
  async set(path,data){try{await fetch(`${FB_URL}/${path}.json`,{method:"PUT",body:JSON.stringify(data)});return true;}catch{return false;}},
  async get(path){try{const r=await fetch(`${FB_URL}/${path}.json`);return await r.json();}catch{return null;}},
  async push(path,data){try{await fetch(`${FB_URL}/${path}.json`,{method:"POST",body:JSON.stringify(data)});return true;}catch{return false;}},
  async setSession(c,d){return this.set(`sessions/${c}`,d);},
  async getSession(c){return this.get(`sessions/${c}`);},
  async saveResult(c,n,d){return this.push(`results/${c}`,{...d,name:n,ts:Date.now()});},
  async getResults(c){const r=await this.get(`results/${c}`);if(!r)return[];return Object.values(r).sort((a,b)=>b.ts-a.ts);},
};

const APPLES = [
  { id:"newton", emoji:"🍎", name:"뉴턴의 사과", type:"탐구통찰형", color:"#c0392b", bg:"#fff5f5",
    keywords:["질문","본질","통찰"],
    story:"모두가 수백 번 봤지만 아무도 묻지 않았던 것.\n뉴턴은 떨어지는 사과 하나에 '왜?'라고 물었다.\n그 질문 하나가 세상의 원리를 바꿨다.",
    tagline:"당연한 것에 '왜?'를 묻는 리더",
    strength:"남들이 보지 못한 구조와 원리를 꿰뚫는 통찰력",
    caution:"분석에 머물다 실행 타이밍을 놓칠 수 있음",
    detail:"당신은 현상의 표면이 아닌 본질을 탐구하는 리더입니다. 팀이 '어떻게 할까?'를 고민할 때, 당신은 '왜 해야 하는가?'를 먼저 묻습니다. 이 질문 하나가 팀 전체의 방향을 바로잡는 힘이 됩니다.",
    situations:["회의에서 아무도 의문을 제기하지 않을 때 핵심 질문을 던진다","복잡한 문제의 근본 원인을 찾아 재정의한다","팀이 엉뚱한 방향으로 달릴 때 '왜?'로 브레이크를 건다"],
    growth:"분석이 끝나지 않아도 '가설'로 먼저 실행해보는 연습이 필요합니다. 완벽한 답을 기다리기보다, 60% 확신에서 시작하는 용기를 가져보세요.",
    famousExample:"🧠 아인슈타인은 '빛과 나란히 달리면 세상이 어떻게 보일까?'라는 질문에서 상대성이론을 발견했습니다.",
    complement:"tell", tension:"jobs",
    questions:["나는 남들이 당연하게 넘기는 것에 '왜?'라고 질문한다","문제를 해결할 때 표면보다 근본 원인을 먼저 찾는다","결론보다 과정과 원리를 이해하는 데 더 많은 시간을 쓴다","나는 이해되지 않으면 불편해서 끝까지 파고드는 편이다","많은 사람이 동의해도, 근거가 약하면 선뜻 따르지 않는다"] },

  { id:"jobs", emoji:"🍏", name:"잡스의 사과", type:"창조혁신형", color:"#27ae60", bg:"#f0fff4",
    keywords:["혁신","실행","용기"],
    story:"완전하지 않아도 세상에 내놓았다.\n한 입 베어문 불완전한 사과가 세상을 바꿨다.\n완벽함보다 먼저 실행하는 것이 더 강하다.",
    tagline:"완벽함보다 실행을 택하는 리더",
    strength:"아무도 가지 않은 길을 먼저 열어내는 추진력",
    caution:"독단적 추진으로 팀이 소외될 수 있음",
    detail:"당신은 '아직 없는 것'을 만드는 리더입니다. 완벽한 계획보다 빠른 실행을 믿고, 실패를 두려워하기보다 시도하지 않는 것을 더 두려워합니다. 당신이 먼저 걷는 그 길이 팀의 가능성이 됩니다.",
    situations:["기존 방식이 통하지 않을 때 완전히 새로운 접근을 제안한다","팀이 망설일 때 '일단 해보자'고 먼저 움직인다","아무도 시도하지 않은 아이디어를 현실로 만들어낸다"],
    growth:"혼자 달리는 속도를 팀의 속도에 맞추는 연습이 필요합니다. 내 아이디어를 팀과 함께 다듬는 과정이 결과의 완성도를 높입니다.",
    famousExample:"🚀 일론 머스크는 '전기차는 불가능하다'는 상식을 깨고 테슬라를 만들었습니다.",
    complement:"cezanne", tension:"newton",
    questions:["나는 완벽하지 않아도 일단 시도하고 보는 편이다","기존 방식보다 새로운 방법을 찾는 것이 더 즐겁다","아무도 해보지 않은 것에 도전하는 것이 두렵지 않다","나는 지금 없는 것을 상상하고 만들어보는 데 끌린다","완벽한 계획을 기다리기보다 부딪히며 배우는 게 더 빠르다고 믿는다"] },

  { id:"adam", emoji:"🍑", name:"아담과 이브의 사과", type:"선택책임형", color:"#d35400", bg:"#fff8f0",
    keywords:["선택","책임","진정성"],
    story:"먹지 말라는 사과를 먹었다.\n아담은 이브 탓, 이브는 뱀 탓 — 그 순간 모든 것이 바뀌었다.\n선택과 그 결과는 언제나 함께 온다.",
    tagline:"내 선택의 무게를 온전히 안는 리더",
    strength:"모든 결정에 책임을 지고 변명하지 않는 진정성",
    caution:"책임감이 지나쳐 자책과 번아웃으로 이어질 수 있음",
    detail:"당신은 '내 탓'이라고 말할 수 있는 리더입니다. 결과가 좋든 나쁘든 자신의 선택을 온전히 받아들이는 이 태도가 팀의 신뢰를 만들어냅니다. 진정한 책임감은 팀이 안심하고 도전할 수 있는 안전망이 됩니다.",
    situations:["팀의 실수를 외부에 탓하지 않고 내부에서 해결한다","어려운 결정을 내릴 때 결과까지 책임지겠다고 먼저 선언한다","사과(謝過)가 필요할 때 가장 먼저, 가장 진심으로 한다"],
    growth:"모든 것을 혼자 짊어지려 하지 마세요. 책임을 나누는 것도 리더십입니다. '우리의 책임'으로 확장하면 팀 전체가 성장합니다.",
    famousExample:"🏈 손흥민은 팀이 질 때마다 '내가 더 잘했어야 했다'고 먼저 말합니다.",
    complement:"eris", tension:"snowwhite",
    questions:["나는 내 결정의 결과를 타인의 탓으로 돌리지 않는다","실수했을 때 변명보다 인정이 먼저 나온다","나는 내 선택이 가져올 결과를 충분히 감수하며 결정한다","나는 한 약속은 상황이 바뀌어도 지키려고 노력한다","결과가 안 좋을 때, 내가 무엇을 다르게 할 수 있었는지부터 돌아본다"] },

  { id:"snowwhite", emoji:"🍎", name:"백설공주의 사과", type:"위기감지형", color:"#8e44ad", bg:"#fdf0ff",
    keywords:["판단","직관","리스크"],
    story:"겉은 빨갛고 탐스러운 — 하지만 속은 독.\n아름다운 것이 언제나 좋은 것은 아니다.\n달콤한 제안 뒤에 숨은 독을 먼저 보는 사람.",
    tagline:"달콤함 뒤의 독을 먼저 보는 리더",
    strength:"표면에 속지 않고 본질과 위험을 먼저 감지하는 직관력",
    caution:"지나친 경계심이 기회를 놓치게 만들 수 있음",
    detail:"당신은 팀의 레이더입니다. 모두가 흥분할 때 혼자 냉정하게 '이면에 무엇이 있는가'를 봅니다. 이 능력이 팀을 위기에서 구하는 결정적 순간이 됩니다.",
    situations:["빠르게 진행되는 의사결정에서 놓친 리스크를 발견한다","협력사나 파트너의 제안에서 숨겨진 조건을 읽어낸다","팀이 낙관적일 때 현실적인 시나리오를 준비하게 한다"],
    growth:"모든 것을 의심하다 보면 팀의 에너지가 떨어질 수 있습니다. 리스크를 발견했다면 해결책도 함께 제시하는 습관을 만들어보세요.",
    famousExample:"🔍 워렌 버핏은 '이해할 수 없는 사업에는 투자하지 않는다'는 원칙으로 수많은 버블을 피했습니다.",
    complement:"hercules", tension:"adam",
    questions:["나는 좋은 제안이나 기회 앞에서 먼저 리스크를 생각한다","상황이나 사람의 이면을 파악하는 편이다","팀에서 문제가 생기기 전에 미리 신호를 감지하는 편이다","다들 낙관적일 때 오히려 '혹시나' 하는 생각이 먼저 든다","중요한 결정 앞에서는 최악의 경우를 미리 그려보는 편이다"] },

  { id:"tell", emoji:"🎯", name:"윌리엄 텔의 사과", type:"성과실행형", color:"#2980b9", bg:"#f0f8ff",
    keywords:["집중","압박","결과"],
    story:"아들 머리 위의 사과를 반드시 맞혀야 하는 상황.\n손이 떨려도, 두려워도 — 그는 쏘았다.\n극한의 압박 속에서 결과를 만들어내는 사람.",
    tagline:"위기 속에서 가장 빛나는 리더",
    strength:"극한의 압박 속에서도 흔들리지 않고 결과를 만드는 집중력",
    caution:"과정과 사람보다 결과에만 치중할 수 있음",
    detail:"당신은 압박이 클수록 더 선명해지는 리더입니다. 마감, 위기, 불확실성 — 이 모든 것이 당신을 더 강하게 만듭니다. 팀이 흔들릴 때 당신의 존재 자체가 닻이 됩니다.",
    situations:["마감 직전 가장 차분하게 핵심에 집중한다","위기 상황에서 팀을 안정시키고 다음 행동을 지시한다","어떤 환경에서도 약속한 결과를 반드시 만들어낸다"],
    growth:"결과를 만드는 과정에서 팀원들이 지쳐있지 않은지 돌아보세요. 성과와 함께 사람을 챙기는 리더가 오래 갑니다.",
    famousExample:"⚽ 박지성은 '가장 힘든 경기에서 가장 많이 뛴다'는 평가를 받은 실행형 리더였습니다.",
    complement:"newton", tension:"cezanne",
    questions:["압박이 심할수록 오히려 집중력이 높아지는 편이다","나는 어떤 상황에서도 약속한 결과를 반드시 만들어낸다","목표가 정해지면 감정보다 실행이 먼저 움직인다","마감이 임박하면 잡생각이 사라지고 해야 할 일만 보인다","복잡한 상황일수록 핵심만 간결하게 정리해서 움직인다"] },

  { id:"cezanne", emoji:"🎨", name:"세잔의 사과", type:"장인완성형", color:"#16a085", bg:"#f0fffc",
    keywords:["반복","완성도","집요함"],
    story:"'사과 하나로 파리를 정복하겠다.'\n같은 사과를 수백 번, 수천 번 그렸다.\n그 집요함이 현대 미술을 바꿨다.",
    tagline:"될 때까지 하는 것이 실력이 되는 리더",
    strength:"흔들리지 않는 깊이와 탁월한 완성도를 만드는 집요함",
    caution:"속도와 유연성이 부족해 보일 수 있음",
    detail:"당신은 '한 번 더'의 리더입니다. 남들이 충분하다고 할 때도 당신은 더 나은 방법을 찾습니다. 이 집요함이 팀의 결과물을 평범에서 탁월함으로 끌어올립니다.",
    situations:["다른 사람이 완성했다고 넘긴 일에서 개선점을 찾아낸다","한 가지 전문성을 깊이 파고들어 팀의 핵심 역량이 된다","장기 프로젝트에서 끝까지 기준을 낮추지 않는다"],
    growth:"완벽을 추구하다 타이밍을 놓치는 경우가 있습니다. '80점짜리 지금'이 '100점짜리 나중'보다 나을 때를 구별하는 감각을 키워보세요.",
    famousExample:"🏀 스테판 커리는 매일 같은 슛 동작을 수천 번 반복해 역사상 최고의 슈터가 됐습니다.",
    complement:"jobs", tension:"tell",
    questions:["나는 빠른 결과보다 완성도 높은 결과를 더 중요하게 여긴다","한 가지 일을 깊이 파고드는 것이 여러 일을 하는 것보다 편하다","반복과 연습을 통해 실력이 쌓인다고 믿는다","다른 사람은 만족해도 나는 한 번 더 다듬고 싶어질 때가 많다","눈에 잘 안 띄는 디테일까지 신경 쓰는 편이다"] },

  { id:"hercules", emoji:"💪", name:"헤라클레스의 황금 사과", type:"목표완수형", color:"#f39c12", bg:"#fffbf0",
    keywords:["목표","불굴","완수"],
    story:"12가지 불가능한 과업 중 하나.\n세상 끝 정원까지 가서 황금 사과를 가져왔다.\n불가능하다고 해도 결국 해내는 사람.",
    tagline:"불가능을 가능으로 만드는 리더",
    strength:"어떤 장애물에도 포기하지 않고 끝까지 완수하는 불굴의 의지",
    caution:"과정의 무리함이 팀 전체를 소진시킬 수 있음",
    detail:"당신은 '끝'을 보는 리더입니다. 목표가 보이면 앞을 가로막는 장애물이 클수록 오히려 더 강해집니다. 팀이 포기하려 할 때 당신의 한마디가 다시 일어서게 합니다.",
    situations:["모두가 불가능하다고 할 때 '방법을 찾겠다'고 선언한다","중간에 예상치 못한 장애물이 생겨도 우회로를 만들어 간다","팀의 사기가 떨어질 때 목표를 상기시키며 재결집시킨다"],
    growth:"목표를 향해 달리는 과정에서 팀원의 체력과 감정을 점검하세요. 혼자 완수하는 것보다 함께 완수하는 것이 더 오래 지속됩니다.",
    famousExample:"🏔️ 엄홍길 대장은 히말라야 8000m 봉우리 16좌를 완등하며 '끝까지'의 의미를 증명했습니다.",
    complement:"snowwhite", tension:"eris",
    questions:["불가능해 보이는 목표도 일단 도전해본다","포기하고 싶은 순간에도 끝까지 완수하는 편이다","목표를 향해 가는 과정에서 장애물이 나를 더 강하게 만든다","시작한 일을 끝맺지 못하면 마음이 계속 남는다","힘든 순간에도 '그래도 여기까지 왔는데'라는 생각으로 버틴다"] },

  { id:"eris", emoji:"✨", name:"에리스의 황금 사과", type:"변화촉진형", color:"#e74c3c", bg:"#fff0f0",
    keywords:["도전","갈등","촉매"],
    story:"불화의 여신이 '가장 아름다운 자에게'라 쓴 황금 사과.\n잔치판을 뒤집고 결국 트로이 전쟁을 일으켰다.\n갈등을 두려워하지 않고 변화의 촉매가 되는 사람.",
    tagline:"판을 흔들어 새로운 판을 만드는 리더",
    strength:"정체된 조직에 긴장과 변화의 불꽃을 점화하는 담대함",
    caution:"갈등 관리 없이 분열을 유발할 수 있음",
    detail:"당신은 조직의 '불편한 진실'을 말할 수 있는 리더입니다. 모두가 현실에 안주할 때 '이대로는 안 된다'고 외칠 수 있는 용기가 조직의 정체를 막습니다.",
    situations:["관성적으로 반복되는 회의나 방식에 '왜 이렇게 해야 하냐'고 도전한다","아무도 말 못 하는 조직의 문제를 공론화한다","변화가 두려운 팀에게 먼저 첫 걸음을 보여준다"],
    growth:"변화를 촉구할 때 대안도 함께 준비해주세요. 판을 흔드는 것과 판을 새로 짜는 것은 함께 이뤄져야 진짜 변화가 됩니다.",
    famousExample:"🎤 방탄소년단은 기존 K-POP의 문법을 거부하고 자신들만의 서사로 세계를 바꿨습니다.",
    complement:"adam", tension:"hercules",
    questions:["조직이 너무 안정적으로만 흘러갈 때 변화가 필요하다고 느낀다","나는 불편한 질문을 던지거나 도전적인 의견을 내는 편이다","갈등이 생기더라도 필요한 변화는 추진해야 한다고 생각한다","'원래 이렇게 해왔다'는 말을 들으면 오히려 의문이 든다","모두가 침묵할 때, 그 침묵을 깨는 쪽은 대체로 나다"] },
];

const TEAM_DYNAMICS = {
  profiles: [
    { ids:["tell","hercules"], label:"🔥 강력한 실행 팀", desc:"목표를 향해 빠르게 달리는 팀입니다. 성과 창출 능력은 탁월하지만, 과정에서 팀원이 소진되지 않도록 주기적인 점검이 필요합니다." },
    { ids:["newton","cezanne"], label:"🔬 깊이 있는 탐구 팀", desc:"본질을 추구하고 완성도를 중시하는 팀입니다. 결과의 질은 높지만 속도가 느릴 수 있어 타이밍 관리가 중요합니다." },
    { ids:["jobs","eris"], label:"💡 혁신 드라이브 팀", desc:"새로운 아이디어와 변화를 주도하는 팀입니다. 에너지는 넘치지만 완성도와 안정성을 보완하는 역할이 필요합니다." },
    { ids:["adam","snowwhite"], label:"🛡️ 신중한 책임 팀", desc:"원칙을 지키고 리스크를 관리하는 팀입니다. 신뢰도는 높지만 때로는 더 빠른 실행과 도전적 시도가 필요합니다." },
  ],
  synergies: [
    { a:"newton", b:"tell", label:"💥 분석 + 실행", desc:"뉴턴형이 방향을 잡으면 윌리엄텔형이 실행합니다. 생각과 행동이 균형잡힌 최강의 조합입니다." },
    { a:"jobs", b:"cezanne", label:"✨ 아이디어 + 완성", desc:"잡스형이 아이디어를 내면 세잔형이 완성도를 높입니다. 창의성과 장인정신의 환상 조합입니다." },
    { a:"eris", b:"adam", label:"🔄 변화 + 책임", desc:"에리스형이 변화를 촉구하면 아담형이 책임감으로 완수합니다. 혁신과 신뢰가 함께 가는 조합입니다." },
    { a:"hercules", b:"snowwhite", label:"🎯 도전 + 감지", desc:"헤라클레스형이 목표를 향해 달릴 때 백설공주형이 리스크를 감지합니다. 용기와 지혜의 조합입니다." },
    { a:"newton", b:"eris", label:"🌊 통찰 + 변화", desc:"뉴턴형의 인사이트가 에리스형의 변화 에너지와 만나면 조직 혁신의 불꽃이 됩니다." },
    { a:"tell", b:"adam", label:"🏆 성과 + 책임", desc:"윌리엄텔형의 실행력과 아담형의 책임감이 만나면 약속을 반드시 지키는 팀이 됩니다." },
  ],
  tensions: [
    { a:"newton", b:"jobs", label:"⚡ 분석 vs 속도", desc:"뉴턴형은 '더 알아봐야 한다', 잡스형은 '일단 해보자'고 충돌합니다. 기준점(언제 실행할 것인가)을 미리 합의하세요." },
    { a:"cezanne", b:"eris", label:"⚡ 완성 vs 변화", desc:"세잔형은 '지금 것을 더 잘하자', 에리스형은 '새로운 방식으로 바꾸자'고 충돌합니다. 개선과 혁신의 영역을 분리하세요." },
    { a:"hercules", b:"eris", label:"⚡ 완수 vs 전환", desc:"헤라클레스형은 '시작한 것을 끝내자', 에리스형은 '더 나은 방향으로 바꾸자'고 충돌합니다. 변경 가능 시점을 명확히 하세요." },
    { a:"snowwhite", b:"jobs", label:"⚡ 신중 vs 실행", desc:"백설공주형은 '리스크가 있다', 잡스형은 '그래도 해보자'고 충돌합니다. 최소 조건(이것만 되면 한다)을 합의하세요." },
    { a:"tell", b:"cezanne", label:"⚡ 속도 vs 완성도", desc:"윌리엄텔형은 '일단 내놓자', 세잔형은 '조금만 더 다듬자'고 충돌합니다. 완성 기준을 사전에 합의하세요." },
  ],
};

const NO_TYPE = {
  newton:"'왜?'를 묻는 사람이 없어요. 열심히 달리다 방향이 틀릴 수 있습니다.",
  jobs:"새로운 시도가 없어요. 변화하는 환경에서 뒤처질 위험이 있습니다.",
  adam:"실수 시 책임 소재가 불명확해질 수 있어요. 신뢰 기반이 흔들릴 수 있습니다.",
  snowwhite:"리스크를 감지하는 사람이 없어요. 낙관적 추진이 큰 실수로 이어질 수 있습니다.",
  tell:"결과를 만드는 실행력이 부족해요. 좋은 아이디어가 행동으로 이어지지 않을 수 있습니다.",
  cezanne:"완성도를 추구하는 사람이 없어요. 빠르게 내놓다 품질 문제가 반복될 수 있습니다.",
  hercules:"끝까지 완수하는 사람이 없어요. 프로젝트가 중간에 흐지부지될 위험이 있습니다.",
  eris:"변화를 촉구하는 사람이 없어요. 관성에 빠져 정체될 수 있습니다.",
};

const COMBO_RESULTS = {
  "newton_jobs":{ title:"통찰하고 행동하는 혁신가", desc:"충분히 이해한 후 용기 있게 시작하는 리더입니다. 분석과 실행 사이에서 균형을 잡는 이 조합은, 방향이 맞다는 확신이 생기는 순간 누구보다 빠르게 움직입니다. 생각이 행동의 발목을 잡지 않고, 행동이 생각 없이 달리지도 않습니다. 이 균형이 팀에서 가장 믿을 수 있는 혁신가를 만듭니다." },
  "newton_adam":{ title:"원칙을 탐구하고 책임지는 리더", desc:"옳은 방향인지 충분히 검토한 후 그 결과를 끝까지 책임집니다. 쉽게 결정하지 않지만, 한 번 결정하면 흔들리지 않습니다. 팀이 어려운 선택 앞에 설 때 가장 먼저 찾게 되는 사람입니다. 신중함과 책임감이 함께하는 이 조합이 팀의 오랜 신뢰를 만들어냅니다." },
  "newton_snowwhite":{ title:"이중 통찰의 리더", desc:"두 가지 다른 종류의 통찰을 동시에 가진 리더입니다. 본질을 탐구하는 눈과 위험을 감지하는 눈이 함께 작동합니다. 팀이 흥분해서 달려갈 때, 혼자 두 가지 질문을 동시에 던집니다. '왜 이것을 해야 하는가?'와 '이 방향이 정말 안전한가?' 이 이중 점검이 팀을 가장 큰 실수로부터 지킵니다." },
  "newton_tell":{ title:"생각하고 반드시 실행하는 리더", desc:"충분히 분석한 후 압박 속에서도 결과를 만들어냅니다. 혼자서는 분석에 머물거나 방향 없이 달릴 수 있는 두 유형이, 함께하면 서로의 약점을 정확히 채워줍니다. 속도와 정확성이 동시에 필요한 순간에 가장 빛납니다. 사고와 실행의 가장 이상적인 균형을 가진 조합입니다." },
  "newton_cezanne":{ title:"본질을 탐구하는 전문가", desc:"원리를 이해하고 그것을 최고 수준으로 구현합니다. 단순히 일을 잘하는 것을 넘어, 왜 그렇게 해야 하는지를 알고 그것을 완벽하게 구현하는 진정한 전문가입니다. 팀에서 가장 깊이 있는 결과물을 만들어내는 조합이며, 함께하는 시간이 길수록 더 빛납니다." },
  "newton_hercules":{ title:"방향을 알고 포기하지 않는 리더", desc:"올바른 방향임을 확신한 순간, 어떤 장애물도 뚫고 나갑니다. 통찰 위에 불굴의 의지가 더해진 조합입니다. 방향이 틀렸을 때는 다시 묻고, 방향이 맞다고 확신하면 멈추지 않습니다. 판단의 정확성과 실행의 끈기가 함께할 때, 이 리더는 불가능을 가능으로 만듭니다." },
  "newton_eris":{ title:"근거로 변화를 이끄는 리더", desc:"변화의 필요성을 느낌이나 감정이 아닌 논리와 통찰로 설득합니다. '이것을 바꿔야 합니다. 왜냐하면—'으로 시작하는 이 리더의 말은 팀이 쉽게 무시할 수 없습니다. 판을 흔들되 근거가 있고, 비판하되 대안이 있습니다. 조직에서 가장 설득력 있는 변화 촉진자입니다." },
  "jobs_newton":{ title:"도전하고 이해하는 혁신가", desc:"먼저 시도하고, 그 과정에서 원리를 탐구합니다. 행동이 앞서지만 이해가 뒤따르기 때문에 같은 실수를 반복하지 않습니다. 시행착오가 곧 통찰이 되는 조합입니다. 팀에서 가장 빠르게 배우는 리더이며, 경험이 쌓일수록 더 강해집니다." },
  "jobs_adam":{ title:"책임지는 혁신가", desc:"새로운 시도를 두려워하지 않으면서, 그 결과까지 온전히 책임집니다. 많은 혁신가들이 아이디어는 내놓지만 결과 앞에서 흔들리는 반면, 이 조합은 끝까지 자리를 지킵니다. 팀이 믿고 따를 수 있는 혁신가이며, 변화를 이끌면서도 신뢰를 잃지 않는 드문 조합입니다." },
  "jobs_snowwhite":{ title:"용감하지만 조심하는 혁신가", desc:"새로운 것을 추구하면서도 함정을 먼저 봅니다. 무모한 도전이 아닌 계산된 혁신을 만드는 조합입니다. '일단 해보자'는 에너지와 '잠깐, 이 부분은 확인해야 해'가 동시에 작동합니다. 새로운 시도가 큰 실패로 이어지는 경우가 적어, 혁신의 속도와 안전성을 함께 갖춘 조합입니다." },
  "jobs_tell":{ title:"아이디어를 결과로 만드는 리더", desc:"창의적 아이디어를 빠르게 현실로 만들어냅니다. 생각에서 결과까지 가장 짧은 거리를 달리는 조합입니다. 아이디어만 넘치고 실행이 없거나, 실행만 있고 창의성이 없는 경우와 달리, 이 조합은 두 가지를 동시에 합니다. 팀이 '이게 가능할까?'를 고민하는 동안, 이미 결과를 만들어 보여주는 리더입니다." },
  "jobs_cezanne":{ title:"완성도 있는 혁신가", desc:"아이디어를 높은 완성도로 구현합니다. 잡스와 워즈니악처럼, 창의성과 장인정신이 만나는 조합입니다. 새로운 것을 시도하되 '이 정도면 됐어'로 끝나지 않습니다. 혁신적이면서도 완성도 높은 결과물을 만들어내기 때문에, 세상이 오래 기억하는 것들을 만들 가능성이 높습니다." },
  "jobs_hercules":{ title:"시작하고 끝까지 가는 혁신가", desc:"새로운 도전을 포기 없이 완수합니다. 아이디어가 현실이 될 때까지 멈추지 않는 불굴의 혁신가입니다. 많은 창조혁신형이 시작은 잘 하지만 완수가 아쉬운 반면, 이 조합은 끝을 봅니다. 중간에 어려움이 생겨도 새로운 방법을 찾아 계속 나아가며, '또 새로운 걸 시작했는데 이번엔 끝낼 수 있을까?'라는 걱정이 없는 조합입니다." },
  "jobs_eris":{ title:"변화의 폭풍", desc:"기존을 부수고 새로운 판을 만드는 에너지가 두 배로 강해집니다. 조직에서 가장 강력한 변화의 촉매가 되는 조합입니다. 현실에 안주하는 것을 견디지 못하며, 모두가 '이대로도 괜찮아요'라고 할 때 가장 불편해집니다. 변화를 만드는 힘은 강력하지만, 속도를 조절하고 팀을 함께 데려가는 연습이 이 조합의 가장 중요한 성장 과제입니다." },
  "adam_newton":{ title:"원인을 파악하고 책임지는 리더", desc:"문제의 본질을 이해하고 모든 결과를 책임집니다. 왜 이런 일이 생겼는지 깊이 탐구하면서 동시에 그 결과를 온전히 자신의 것으로 받아들입니다. 팀에서 가장 신뢰받는 리더의 모습이며, 원인도 알고 책임도 지기 때문에 같은 실수를 반복하지 않습니다." },
  "adam_jobs":{ title:"믿을 수 있는 혁신가", desc:"새로운 시도를 하면서도 결과에 끝까지 책임집니다. 변화와 신뢰를 동시에 만드는 드문 조합입니다. 혁신가이면서도 팀원들이 불안해하지 않는 이유는, 이 리더가 끝까지 자리를 지킨다는 것을 알기 때문입니다. 새로운 방향을 제안할 때 팀이 가장 쉽게 따라오는 조합입니다." },
  "adam_snowwhite":{ title:"신중하게 선택하는 책임자", desc:"리스크를 충분히 파악한 후 선택하고, 그 결과를 책임집니다. 실수가 가장 적은 조합입니다. 쉽게 결정하지 않기 때문에 때로는 느리다는 인상을 줄 수 있지만, 한 번 내린 결정은 거의 흔들리지 않습니다. 중요한 결정일수록 이 리더를 옆에 두고 싶어지는 이유입니다." },
  "adam_tell":{ title:"약속을 반드시 지키는 리더", desc:"명확한 목표를 세우고 어떤 상황에서도 결과까지 책임집니다. 팀에서 가장 믿음직한 존재입니다. '이 사람이 한다고 했으니 된다'는 신뢰가 자연스럽게 쌓이는 조합입니다. 압박이 심한 상황에서도 흔들리지 않고 결과를 만들어내며, 결과가 나오면 그것이 자신의 것임을 당연히 받아들입니다." },
  "adam_cezanne":{ title:"완성도 높은 결과를 책임지는 리더", desc:"높은 기준을 유지하면서 그 결과까지 책임집니다. 품질과 신뢰를 동시에 보장합니다. '좋은 결과를 낼게요'가 아니라 '최고의 결과를 낼 것이고, 그렇지 못하면 제 책임입니다'가 이 조합의 언어입니다. 완성도와 신뢰 모두에서 타협하지 않는 리더입니다." },
  "adam_hercules":{ title:"선택하고 끝까지 완수하는 리더", desc:"한 번 결정하면 어떤 어려움도 뚫고 완수합니다. 가장 강한 형태의 책임감을 가진 조합입니다. 선택의 무게를 알기 때문에 신중하게 결정하지만, 한 번 결정하면 중간에 포기라는 단어가 없습니다. 팀이 지쳐 포기하려 할 때 '우리가 선택한 것입니다. 끝까지 갑시다'를 말하는 리더입니다." },
  "adam_eris":{ title:"변화를 책임지는 리더", desc:"필요한 변화를 용기 있게 일으키고 그 결과까지 책임집니다. 판을 흔든 후 수습까지 하는 완성형 변화 촉진자입니다. 변화를 외치고 사라지는 것이 아니라, 변화가 일어나는 동안 자리를 지키며 결과를 함께 안습니다. 변화가 두려운 팀원들이 가장 쉽게 따라올 수 있는 변화 촉진자입니다." },
  "snowwhite_newton":{ title:"이중 통찰의 리더", desc:"위기 신호를 감지하고 그 근본 원인까지 파악합니다. 문제가 터지기 전에 두 단계 앞서 보는 조합입니다. 표면의 위험을 감지하는 데서 멈추지 않고, '왜 이런 신호가 나타나는가'까지 탐구합니다. 이 이중 통찰 덕분에 팀이 예상치 못한 위기에 빠지는 경우가 현저히 줄어듭니다." },
  "snowwhite_jobs":{ title:"위험을 알면서도 도전하는 리더", desc:"리스크를 정확히 인지하면서도 시도를 두려워하지 않습니다. 가장 균형 잡힌 혁신가입니다. 위험을 보되 그것이 도전을 막지 않습니다. '이 리스크가 있지만 이렇게 하면 감당할 수 있다'는 방식으로 접근합니다. 무모하지도 않고 소극적이지도 않은, 이 절묘한 균형이 팀을 가장 지속 가능한 방식으로 혁신하게 합니다." },
  "snowwhite_adam":{ title:"신중하고 책임감 있는 리더", desc:"충분히 살피고 선택하며, 그 결과를 끝까지 책임집니다. 실수와 후회가 가장 적은 조합입니다. 중요한 결정 앞에서 가장 많이 검토하고 가장 신중하게 결정합니다. 한 번 결정한 후 뒤를 돌아보지 않으며, 팀이 믿고 맡길 수 있는 가장 안정적인 리더의 모습입니다." },
  "snowwhite_tell":{ title:"위기를 감지하고 즉각 대응하는 리더", desc:"위험을 보는 순간 빠르게 행동합니다. 위기 관리 능력이 탁월한 조합입니다. 위기를 감지하는 눈과 즉각 결과로 대응하는 실행력이 함께합니다. 감지와 대응을 동시에 하기 때문에, 위기 상황에서 팀에게 가장 든든한 존재가 됩니다." },
  "snowwhite_cezanne":{ title:"완벽한 검증의 리더", desc:"모든 리스크를 점검하고 완성도 높은 결과를 만듭니다. 실수가 거의 없는 신중한 전문가입니다. 결과물을 내보내기 전에 품질 측면과 리스크 측면 모두를 꼼꼼히 확인합니다. 속도는 느릴 수 있지만, 완성된 결과물에 대한 신뢰도는 팀에서 가장 높습니다." },
  "snowwhite_hercules":{ title:"함정을 피하며 나아가는 리더", desc:"위험을 감지하면서도 목표를 향해 포기하지 않습니다. 안전하게 불가능을 가능으로 만드는 조합입니다. 무모하게 달리지 않지만 멈추지도 않습니다. 함정이 보이면 우회로를 찾아 계속 전진합니다. 불굴의 의지와 지혜가 함께하는 가장 성숙한 형태의 목표 완수자입니다." },
  "snowwhite_eris":{ title:"계산된 변화를 이끄는 리더", desc:"변화의 필요성을 느끼면서 리스크를 계산하며 추진합니다. 무모하지 않은 변화 촉진자입니다. '변화가 필요합니다. 단, 이 부분은 조심해야 합니다'라고 말할 수 있는 리더입니다. 팀이 변화 과정에서 가장 안전하게 새로운 방향으로 나아갈 수 있도록 돕는 조합입니다." },
  "tell_newton":{ title:"방향을 알고 결과를 내는 리더", desc:"방향을 확인한 후 압박 속에서도 최고의 결과를 만듭니다. 속도와 정확성이 함께하는 조합입니다. 방향이 맞는지 먼저 묻고, 방향이 확인되면 어떤 압박에도 흔들리지 않습니다. 빠르게 달리다 방향이 틀렸다는 것을 나중에 깨닫는 실수를 하지 않습니다." },
  "tell_jobs":{ title:"창의적으로 빠르게 실행하는 리더", desc:"새로운 방법으로 빠르게 결과를 만듭니다. 실행력과 창의성이 결합한 강력한 조합입니다. 막힐 때 기존 방식을 고집하지 않고, 새로운 방법을 찾아 계속 나아갑니다. 불가능해 보이는 마감도 예상치 못한 방식으로 해결하며, 팀에서 '어떻게 했어요?'라는 말을 가장 많이 듣는 리더입니다." },
  "tell_adam":{ title:"약속하고 반드시 지키는 리더", desc:"목표를 선언하고 어떤 어려움에도 결과를 만들어냅니다. 팀에서 가장 믿음직한 실행자입니다. 한 번 약속하면 반드시 지키겠다는 의지와 실행력이 함께합니다. '어렵지만 해보겠습니다'가 아닌 '반드시 합니다'로 말하는 리더이며, 함께 일하는 팀원들이 불안감보다 안도감을 더 많이 느끼는 조합입니다." },
  "tell_snowwhite":{ title:"위기를 기회로 바꾸는 리더", desc:"위험을 감지하는 순간 즉각 결과로 대응합니다. 위기 관리 능력이 탁월한 조합입니다. 위기가 오기 전에 미리 신호를 읽고, 위기가 왔을 때 가장 빠르게 행동합니다. 팀 전체가 당황하는 순간에도 이 리더는 이미 다음 행동을 실행하고 있습니다." },
  "tell_cezanne":{ title:"빠르고 완성도 있는 리더", desc:"실행 속도와 결과 품질 모두를 추구합니다. 이 두 가지가 충돌할 때 가장 성장하는 조합입니다. 빠르게 내놓고 싶은 마음과 더 다듬고 싶은 마음이 동시에 작동합니다. 그 균형을 찾아가는 과정이 이 리더를 더 강하게 만들며, 마감을 지키면서도 품질을 포기하지 않는 현장에서 가장 가치 있는 조합입니다." },
  "tell_hercules":{ title:"끝까지 포기하지 않는 실행자", desc:"압박 속 집중력과 포기하지 않는 의지가 결합합니다. 불가능한 마감도 지켜내는 최강 실행 조합입니다. 어떤 상황에서도 '못 합니다'가 없습니다. 방법을 찾아서라도, 시간을 쪼개서라도 결과를 만들어냅니다. 팀이 한계에 부딪혀 포기하려 할 때, '아직 방법이 있습니다'를 말하며 다시 일어서게 합니다." },
  "tell_eris":{ title:"변화를 즉각 실행하는 리더", desc:"변화가 필요하다고 느끼면 즉각 행동으로 옮깁니다. 변화의 속도가 가장 빠른 조합입니다. 변화를 외치면서 막상 행동이 느린 경우와 달리, 이 조합은 필요성을 인식하는 순간 이미 움직이기 시작합니다. 말보다 행동이 앞서는 변화 촉진자입니다." },
  "cezanne_newton":{ title:"원리부터 완성까지 가는 전문가", desc:"본질을 이해하고 그것을 최고 수준으로 구현합니다. 가장 깊이 있는 전문가의 조합입니다. 단순히 일을 잘하는 것을 넘어, 왜 그렇게 해야 하는지를 알고 그것을 완벽하게 구현합니다. 표면적인 기술이 아닌 원리에 대한 이해 위에 쌓인 전문성은, 어떤 상황에서도 흔들리지 않습니다." },
  "cezanne_jobs":{ title:"새로운 방식으로 완성하는 리더", desc:"기존과 다른 방법을 시도하면서 완성도를 놓지 않습니다. 혁신과 장인정신이 만나는 조합입니다. 새로운 것을 시도하되 '이 정도면 됐어'로 끝나지 않습니다. 혁신적인 접근과 집요한 완성도가 함께하기 때문에, 이 조합이 만드는 결과물은 독창적이면서도 탁월합니다." },
  "cezanne_adam":{ title:"믿을 수 있는 장인", desc:"완성도 높은 결과를 약속하고 반드시 지킵니다. 품질과 신뢰를 동시에 보장합니다. '최선을 다하겠습니다'가 아니라 '이 기준으로 만들겠습니다'라고 말하고 그것을 지킵니다. 팀에서 품질에 관한 한 가장 믿음직한 존재이며, 스스로 가장 높은 기준을 유지합니다." },
  "cezanne_snowwhite":{ title:"완벽하고 안전한 결과의 장인", desc:"리스크를 점검하면서 완성도를 추구합니다. 실수 없이 최고의 결과를 만드는 신중한 전문가입니다. 결과물을 내보내기 전에 품질 측면과 리스크 측면 모두를 꼼꼼히 확인합니다. 실수가 큰 대가를 치르는 상황에서 가장 빛나는 조합입니다." },
  "cezanne_tell":{ title:"빠르고 완성도 있는 장인", desc:"실행 속도와 완성도의 균형을 찾습니다. 이 두 가지 가치가 충돌할 때 가장 성장하는 조합입니다. 더 다듬고 싶은 마음과 지금 내놓아야 하는 현실 사이에서 최선의 균형점을 찾습니다. 완벽주의가 타이밍을 놓치게 하는 함정을 스스로 경계하면서, 현장에서 가장 실용적인 전문가로 성장하는 조합입니다." },
  "cezanne_hercules":{ title:"끝날 때까지 다듬는 리더", desc:"완성될 때까지 포기하지 않습니다. 반복과 불굴의 의지로 최고를 만들어내는 세잔의 완성형입니다. 같은 것을 수십 번 다듬어도 지치지 않습니다. 오히려 반복할수록 더 좋아진다는 것을 알기 때문에, 주변이 충분하다고 할 때도 혼자 한 번 더 앉습니다. 완성의 의미를 가장 잘 아는 리더입니다." },
  "cezanne_eris":{ title:"변화 속에서도 완성을 추구하는 리더", desc:"새로운 방식을 시도하면서 완성도를 유지합니다. 변화와 품질이 공존하는 조합입니다. '바꾸자'는 촉구와 '하지만 제대로 바꾸자'는 고집이 동시에 작동합니다. 변화하되 탁월함을 잃지 않는 드문 조합이며, 혁신적이면서도 완성도 있는 결과물을 만들어냅니다." },
  "hercules_newton":{ title:"이해하고 완수하는 리더", desc:"목표의 의미를 깊이 이해하고 반드시 완수합니다. '왜'가 명확하기에 어떤 장애물도 뚫을 수 있는 조합입니다. 단순히 주어진 목표를 완수하는 것이 아니라, 그 목표가 왜 중요한지를 알고 움직입니다. 그 이해가 포기하고 싶은 순간에 다시 일어서게 합니다." },
  "hercules_jobs":{ title:"불가능을 새로운 방법으로 해내는 리더", desc:"막힐 때마다 새로운 방법을 찾아 목표를 향해 나아갑니다. 포기 대신 우회로를 만드는 조합입니다. 헤라클레스가 아틀라스를 설득해 황금 사과를 가져온 것처럼, 정면 돌파가 아닌 창의적 우회로로 목표를 완수합니다. 장애물이 클수록 더 창의적인 해결책이 나오는 조합입니다." },
  "hercules_adam":{ title:"약속한 것은 반드시 완수하는 리더", desc:"목표를 선언하고 포기 없이 책임집니다. 가장 강한 형태의 책임감을 가진 조합입니다. 한 번 약속하면 어떤 어려움이 와도 끝까지 갑니다. 팀이 지쳐 포기하려 할 때 '우리가 약속한 것입니다. 끝까지 갑시다'를 말하는 리더이며, 그 말이 팀을 다시 일어서게 합니다." },
  "hercules_snowwhite":{ title:"함정을 피하며 목표를 완수하는 리더", desc:"위험을 감지하면서 안전하게 목표를 향해 나아갑니다. 용기와 지혜가 균형을 이루는 조합입니다. 앞만 보고 달리지 않습니다. 달리면서 동시에 함정이 없는지 살핍니다. 그 결과 불필요한 실패 없이 목표에 도달하는, 불굴의 의지가 무모함이 아닌 지혜로 표현되는 가장 성숙한 형태의 목표 완수자입니다." },
  "hercules_tell":{ title:"어떤 압박에도 반드시 완수하는 리더", desc:"압박 속 집중력과 포기하지 않는 의지가 결합합니다. 불가능한 목표도 기한 내에 완수하는 최강 실행 조합입니다. 마감이 촉박하고, 자원이 부족하고, 아무도 해결책을 모를 때 — 이 조합은 오히려 더 또렷해집니다. 위기가 이들을 멈추게 하지 않고 오히려 각성시키는, 팀에서 가장 극한의 상황에서 빛나는 리더입니다." },
  "hercules_cezanne":{ title:"최고의 완성을 향해 포기하지 않는 리더", desc:"높은 기준을 가지고 그것을 반드시 이루어냅니다. 타협하지 않고 최고를 향해 끝까지 가는 조합입니다. 완성도에 대한 집요한 기준과 포기하지 않는 의지가 함께합니다. 단순히 결과를 내는 것이 아니라 최고의 결과를 낼 때까지 멈추지 않으며, 이 리더의 결과물은 시간이 지날수록 더 빛납니다." },
  "hercules_eris":{ title:"변화를 끝까지 이루는 리더", desc:"변화를 시작하고 반드시 완수합니다. 말이 아닌 결과로 변화를 증명하는 가장 강한 변화 리더입니다. 변화를 외치는 것에서 그치지 않고, 그 변화가 실제로 일어날 때까지 멈추지 않습니다. 변화의 저항이 클수록 오히려 더 강해지며, 조직에서 진짜 변화를 만들어내는 것이 가장 어려울 때 빛나는 조합입니다." },
  "eris_newton":{ title:"근거로 변화를 이끄는 리더", desc:"변화의 필요성을 느낌이 아닌 논리와 통찰로 설득합니다. 가장 설득력 있는 변화 촉진자입니다. '이것을 바꿔야 합니다. 왜냐하면—'으로 시작하는 이 리더의 말은 팀이 쉽게 무시할 수 없습니다. 감정적 호소가 아닌 근거로 설득하기 때문에, 저항이 가장 적고 변화가 가장 오래 지속됩니다." },
  "eris_jobs":{ title:"변화의 이중 불꽃", desc:"기존을 부수고 새로운 판을 만드는 에너지가 두 배로 강해집니다. 조직에서 가장 강력한 변화의 촉매가 되는 조합입니다. 현실에 안주하는 것을 두 가지 방향에서 동시에 거부합니다. 에너지가 강력한 만큼, 주변을 함께 데려가는 속도 조절과 팀 케어가 이 조합의 가장 중요한 성장 과제입니다." },
  "eris_adam":{ title:"변화를 책임지는 리더", desc:"변화를 일으키고 그 결과까지 책임집니다. 판을 흔든 후 수습까지 하는 완성형 변화 촉진자입니다. 변화를 외치고 사라지는 것이 아니라, 변화가 일어나는 내내 자리를 지키고 결과를 함께 안습니다. 변화가 두려운 팀원들이 이 리더를 믿고 따르는 이유는, 이 사람이 끝까지 책임진다는 것을 알기 때문입니다." },
  "eris_snowwhite":{ title:"계산하고 변화를 이끄는 리더", desc:"리스크를 알면서도 필요한 변화를 추진합니다. 무모하지 않은 변화 촉진자입니다. '변화가 필요합니다. 단, 이 부분은 조심해야 합니다'라고 말할 수 있는 리더입니다. 변화의 에너지와 위험 감지의 신중함이 함께하기 때문에, 변화 과정에서 예상치 못한 큰 실수를 줄입니다." },
  "eris_tell":{ title:"변화를 빠르게 실행하는 리더", desc:"변화가 필요하다고 느끼면 즉각 행동으로 옮깁니다. 변화의 속도가 가장 빠른 조합입니다. 변화를 외치는 것과 실행하는 것 사이의 간격이 없습니다. 필요하다고 느끼는 순간 이미 움직이기 시작합니다. 결과가 나왔을 때 팀이 가장 빠르게 신뢰를 회복하는 조합이기도 합니다." },
  "eris_cezanne":{ title:"완성도 있는 변화를 이끄는 리더", desc:"새로운 방식을 시도하면서 완성도를 유지합니다. 혁명적이면서도 완성도 있는 드문 조합입니다. 변화를 위한 변화가 아닌, 더 나은 것을 향한 변화를 추구합니다. 변화 이후의 결과물이 변화 이전보다 분명히 더 나은, 그 변화를 가장 설득력 있게 만드는 조합입니다." },
  "eris_hercules":{ title:"변화를 끝까지 이루는 리더", desc:"변화를 시작하고 반드시 완수합니다. 말이 아닌 결과로 변화를 증명하는 가장 강한 변화 리더입니다. 많은 변화 촉진자들이 불씨를 당기지만 불이 꺼지기 전에 자리를 뜨는 반면, 이 조합은 불이 완전히 타오를 때까지 자리를 지킵니다. 변화의 저항이 클수록 오히려 더 강해지는 조합입니다." },
};

const makeCode = () => {
  const w=["APPLE","NEWTON","JOBS","ERIS","ROUN"][Math.floor(Math.random()*5)];
  return `${w}-${Math.floor(1000+Math.random()*9000)}`;
};
const calcScores=(ans)=>{const s={};APPLES.forEach(a=>{s[a.id]=[0,1,2,3,4].reduce((sum,i)=>sum+(ans[`${a.id}_${i}`]||0),0);});return s;};
const topApple=(scores)=>[...APPLES].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0))[0];

// ── 3축 좌표 (신규) ─────────────────────────────────────────────────────────
// 8유형 점수를 축으로 재조합 (40문항·8유형 구조, 유형당 5문항×7점척도)
const AXIS_GROUPS = {
  ta: { leftLabel:"사고", rightLabel:"실행", left:["newton","jobs","snowwhite","eris"], right:["adam","tell","cezanne","hercules"], leftColor:"#4A6670", rightColor:"#A13B3B" },
  sv: { leftLabel:"안정", rightLabel:"변화", left:["newton","adam","snowwhite","cezanne"], right:["jobs","tell","hercules","eris"], leftColor:"#5B6B8C", rightColor:"#B8562F" },
  ar: { leftLabel:"접근", rightLabel:"회피", left:["newton","jobs","tell","cezanne"], right:["adam","snowwhite","hercules","eris"], leftColor:"#6B7D3D", rightColor:"#7A2E2E" },
};
const calcAxisScores=(scores)=>{
  const out={};
  Object.entries(AXIS_GROUPS).forEach(([key,g])=>{
    const leftSum=g.left.reduce((sum,id)=>sum+(scores[id]||0),0);
    const rightSum=g.right.reduce((sum,id)=>sum+(scores[id]||0),0);
    out[key]={left:leftSum,right:rightSum};
  });
  return out;
};
// 원고 01~08 공식 순서 (내부 배열 순서와 다름 — 표시 전용)
const ORDER_1_TO_8=["newton","snowwhite","jobs","eris","cezanne","adam","tell","hercules"];
const orderedApples=()=>ORDER_1_TO_8.map(id=>APPLES.find(a=>a.id===id));

function getTeamDynamics(dashData) {
  if (dashData.length < 2) return null;
  const dist = Object.fromEntries(APPLES.map(a=>[a.id,0]));
  dashData.forEach(r=>{if(dist[r.topTypeId]!==undefined)dist[r.topTypeId]++;});
  const presentIds = APPLES.filter(a=>dist[a.id]>0).map(a=>a.id);
  let matchedProfile = null;
  let maxMatch = 0;
  TEAM_DYNAMICS.profiles.forEach(p=>{
    const match = p.ids.filter(id=>dist[id]>0).length;
    if(match>maxMatch){maxMatch=match;matchedProfile=p;}
  });
  const activeSynergies = TEAM_DYNAMICS.synergies.filter(s=>presentIds.includes(s.a) && presentIds.includes(s.b));
  const activeTensions = TEAM_DYNAMICS.tensions.filter(t=>presentIds.includes(t.a) && presentIds.includes(t.b));
  const missing = APPLES.filter(a=>dist[a.id]===0);
  return { dist, presentIds, matchedProfile, activeSynergies, activeTensions, missing };
}

export default function App() {
  const [sc,setSc]=useState("home");
  const [code,setCode]=useState("");
  const [sess,setSess]=useState(null);
  const [codeIn,setCodeIn]=useState("");
  const [nameIn,setNameIn]=useState("");
  const [teamIn,setTeamIn]=useState("");
  const [joinErr,setJoinErr]=useState("");
  const [sessName,setSessName]=useState("");
  const [teamsRaw,setTeamsRaw]=useState("영업팀\n마케팅팀\n개발팀\n인사팀");
  const [newCode,setNewCode]=useState("");
  const [pInfo,setPInfo]=useState(null);
  const [storyI,setStoryI]=useState(0);
  const [intuitive,setIntuitive]=useState(null);
  const [answers,setAnswers]=useState({});
  const [appleI,setAppleI]=useState(0);
  const [qI,setQI]=useState(0);
  const [scores,setScores]=useState({});
  const [chosenTie,setChosenTie]=useState(null);
  const [submitted,setSubmitted]=useState(false);
  const [dashData,setDashData]=useState([]);
  const [lastRefresh,setLastRefresh]=useState(null);
  const [loading,setLoading]=useState(false);
  const [dashTab,setDashTab]=useState("overview");
  const [isOpen]=useState(()=>new URLSearchParams(window.location.search).has("book"));

  useEffect(()=>{
    if(sc!=="f_dash")return;
    const load=async()=>{
      const res=await DB.getResults(code);
      setDashData(res||[]);
      setLastRefresh(new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    };
    load();
    const t=setInterval(load,5000);
    return()=>clearInterval(t);
  },[sc,code]);

  useEffect(()=>{
    if(sc==="p_result"&&!submitted&&Object.keys(scores).length>0){
      const top=topApple(scores);
      if(!isOpen){
        DB.saveResult(code,pInfo?.name||"익명",{team:pInfo?.team||"",topTypeId:top.id,topType:top.type,topEmoji:top.emoji,topColor:top.color,intuitive,scores}).then(()=>setSubmitted(true));
      } else {
        setSubmitted(true);
      }
    }
  },[sc]);

  const handleAnswer=(val)=>{
    const key=`${APPLES[appleI].id}_${qI}`;
    const newAns={...answers,[key]:val};
    setAnswers(newAns);
    if(qI<4){setQI(qI+1);}
    else if(appleI<APPLES.length-1){setAppleI(appleI+1);setQI(0);}
    else{setScores(calcScores(newAns));setSc("p_result");}
  };

  const goBackQuestion=()=>{
    if(qI>0){setQI(qI-1);}
    else if(appleI>0){setAppleI(appleI-1);setQI(4);}
  };

  const resetAll=()=>{setSc(isOpen?"open_join":"home");setCode("");setSess(null);setCodeIn("");setNameIn("");setTeamIn("");setJoinErr("");setNewCode("");setPInfo(null);setStoryI(0);setIntuitive(null);setAnswers({});setAppleI(0);setQI(0);setScores({});setChosenTie(null);setSubmitted(false);setDashData([]);setDashTab("overview");};

  const exportExcel=()=>{
    if(!dashData.length)return;
    // 시트1: 유형별 집계 (이미 불러온 dashData 기준 — 추가 조회 없음)
    const dist=Object.fromEntries(APPLES.map(a=>[a.id,0]));
    dashData.forEach(r=>{if(dist[r.topTypeId]!==undefined)dist[r.topTypeId]++;});
    const summarySheet=XLSX.utils.json_to_sheet(APPLES.map(a=>({유형:a.type,이야기:a.name,선택인원:dist[a.id]})));
    // 시트2: 참여자별 원본 데이터 (3축 좌표 포함 — 신뢰도 분석용)
    const rawRows=dashData.map(r=>{
      const ax=calcAxisScores(r.scores||{});
      const row={이름:r.name,팀:r.team||"",주유형:r.topType,직관선택:APPLES.find(a=>a.id===r.intuitive)?.type||"",
        사고:ax.ta.left,실행:ax.ta.right,안정:ax.sv.left,변화:ax.sv.right,접근:ax.ar.left,회피:ax.ar.right,
        제출시각:new Date(r.ts).toLocaleString("ko-KR")};
      APPLES.forEach(a=>{row[`${a.type}_점수`]=r.scores?.[a.id]??"";});
      return row;
    });
    const rawSheet=XLSX.utils.json_to_sheet(rawRows);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,summarySheet,"유형별 집계");
    XLSX.utils.book_append_sheet(wb,rawSheet,"참여자 원본데이터");
    XLSX.writeFile(wb,`사과리더십_${code}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };


  const curA=APPLES[appleI];
  const doneQ=appleI*5+qI;
  const pct=Math.round((doneQ/(APPLES.length*5))*100);

  if(sc==="home"&&!isOpen)return(
    <Page><Box center>
      <FloatingApples/>
      <h1 style={S.bigTitle}>나는 어떤 사과인가?</h1>
      <p style={S.bigSub}>🍎 사과 리더십 유형 진단 시스템</p>
      <p style={{...S.muted,margin:"0 0 28px",textAlign:"center",lineHeight:1.8}}>강사와 참여자가 실시간으로 연결되어<br/>팀별·부서별 리더십 분포를 한눈에 분석합니다</p>
      <Btn onClick={()=>setSc("f_create")} style={{marginBottom:12}}>👨‍🏫 강사 모드 — 세션 만들기</Btn>
      <Btn blue onClick={()=>setSc("p_join")}>🙋 참여자 모드 — 진단 참여하기</Btn>
    </Box></Page>
  );

  if(sc==="open_join"||isOpen&&sc==="home")return(
    <Page><Box center>
      <div style={{fontSize:"3rem",marginBottom:8}}>🍎</div>
      <h1 style={S.bigTitle}>나는 어떤 사과인가?</h1>
      <p style={S.bigSub}>사과 리더십 유형 진단</p>
      <p style={{...S.muted,margin:"0 0 24px",textAlign:"center",lineHeight:1.8}}>
        8가지 사과 이야기를 읽고<br/>나의 리더십 유형을 발견해보세요
      </p>
      <Label>이름</Label>
      <Input placeholder="이름을 입력하세요" value={nameIn} onChange={e=>setNameIn(e.target.value)}/>
      <Btn style={{marginTop:8,opacity:nameIn.trim()?1:0.4}} disabled={!nameIn.trim()} onClick={()=>{
        setPInfo({name:nameIn.trim(),team:"전자책독자"});
        setSc("p_story");
      }}>진단 시작하기 →</Btn>
    </Box></Page>
  );

  if(sc==="f_create")return(
    <Page><Box>
      <BackBtn onClick={()=>setSc("home")}/>
      <h2 style={S.h2}>👨‍🏫 세션 만들기</h2>
      <Label>강의·교육 이름</Label>
      <Input placeholder="예) 2025 리더십 워크샵" value={sessName} onChange={e=>setSessName(e.target.value)}/>
      <Label>팀/부서 목록 <span style={S.hint}>(한 줄에 하나씩)</span></Label>
      <textarea style={{...S.input,height:120,resize:"none"}} value={teamsRaw} onChange={e=>setTeamsRaw(e.target.value)}/>
      <Btn style={{marginTop:4}} disabled={loading} onClick={async()=>{
        setLoading(true);
        const c=makeCode();
        const teams=teamsRaw.split("\n").map(x=>x.trim()).filter(Boolean);
        const data={sessionName:sessName||"리더십 진단",teams,createdAt:Date.now()};
        await DB.setSession(c,data);
        setCode(c);setSess(data);setNewCode(c);setLoading(false);
      }}>{loading?"생성 중...":"🍎 세션 코드 생성"}</Btn>
      {newCode&&<>
        <div style={S.codeBox}>
          <p style={{color:"#888",fontSize:"0.75rem",margin:"0 0 8px"}}>참여자에게 이 코드를 공유하세요</p>
          <div style={S.codeDisplay}>{newCode}</div>
          <p style={{color:"#aaa",fontSize:"0.72rem",margin:"8px 0 0"}}>참여자 화면 → 참여자 모드 → 코드 입력</p>
        </div>
        <Btn onClick={()=>setSc("f_dash")} style={{marginTop:12}}>📊 실시간 대시보드 열기 →</Btn>
      </>}
    </Box></Page>
  );

  if(sc==="f_dash"){
    const total=dashData.length;
    const dynamics=getTeamDynamics(dashData);
    const dist=dynamics?.dist||Object.fromEntries(APPLES.map(a=>[a.id,0]));
    const maxCnt=Math.max(...Object.values(dist),1);
    const teams=sess?.teams||[];
    return(
      <Page bg="#1a1a2e">
        <div style={{maxWidth:640,width:"100%"}}>
          <div style={S.dashHead}>
            <div>
              <div style={{fontSize:"0.72rem",color:"#aaa",marginBottom:4}}>{sess?.sessionName}</div>
              <div style={S.dashCode}>{code}</div>
              <div style={{fontSize:"0.7rem",color:"#666",marginTop:4}}>🔄 {lastRefresh||"로딩 중..."} 자동갱신</div>
            </div>
            <div style={S.dashStat}><div style={S.dashBigNum}>{total}</div><div style={{fontSize:"0.7rem",color:"#aaa"}}>참여자</div></div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[["overview","📊 분포"],["dynamics","🔗 역학관계"],["members","👥 참여자"]].map(([t,l])=>(
              <button key={t} onClick={()=>setDashTab(t)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:"none",background:dashTab===t?"#e74c3c":"#0d0d22",color:dashTab===t?"#fff":"#666",fontSize:"0.75rem",fontWeight:700,fontFamily:"inherit",cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          <button onClick={exportExcel} disabled={!total} style={{width:"100%",marginBottom:14,padding:"10px",borderRadius:10,border:"1px solid #2a2a4a",background:total?"#16a085":"#1a1a2e",color:total?"#fff":"#555",fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit",cursor:total?"pointer":"default"}}>
            📊 엑셀로 내보내기 (이미 불러온 {total}건, 추가 조회 없음)
          </button>
          {dashTab==="overview"&&<>
            <DashCard title="📊 유형별 분포">
              <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6,alignItems:"flex-end",paddingBottom:4}}>
                {orderedApples().map(a=>{const cnt=dist[a.id];const h=cnt>0?Math.max((cnt/maxCnt)*90,18):6;return(
                  <div key={a.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <span style={{fontSize:"0.7rem",fontWeight:700,color:cnt>0?a.color:"#555",minHeight:16}}>{cnt>0?cnt:""}</span>
                    <div style={{width:"100%",height:`${h}px`,background:cnt>0?a.color:"#2a2a4a",borderRadius:"4px 4px 0 0",transition:"height 0.6s ease"}}/>
                    <span style={{fontSize:"1rem"}}>{a.emoji}</span>
                    <span style={{fontSize:"0.48rem",color:cnt>0?a.color:"#555",textAlign:"center",fontWeight:600,lineHeight:1.2}}>{a.type.replace("형","")}</span>
                  </div>
                );})}
              </div>
            </DashCard>
            {teams.length>0&&total>0&&(
              <DashCard title="🏢 팀별 사과 분포">
                {teams.map(tm=>{
                  const members=dashData.filter(r=>r.team===tm);
                  if(!members.length)return(<div key={tm} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid #1e1e3a"}}><span style={{fontSize:"0.78rem",color:"#555"}}>{tm} · 아직 참여자 없음</span></div>);
                  return(<div key={tm} style={{marginBottom:14}}>
                    <div style={{fontSize:"0.78rem",fontWeight:700,color:"#aaa",marginBottom:7}}>{tm} <span style={{color:"#555",fontWeight:400}}>({members.length}명)</span></div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {members.map((m,i)=>{const a=APPLES.find(x=>x.id===m.topTypeId);return(<div key={i} style={{background:`${a?.color}25`,border:`1px solid ${a?.color}55`,borderRadius:8,padding:"4px 10px",fontSize:"0.72rem",color:a?.color,fontWeight:600}}>{a?.emoji} {m.name}</div>);})}
                    </div>
                  </div>);
                })}
              </DashCard>
            )}
            {dynamics?.missing.length>0&&total>=2&&(
              <DashCard title="⚠️ 없는 유형 — 우리 팀의 사각지대" warn>
                {dynamics.missing.map(a=>(<div key={a.id} style={{borderLeft:`3px solid ${a.color}`,paddingLeft:12,marginBottom:12}}>
                  <div style={{color:a.color,fontWeight:700,fontSize:"0.83rem"}}>{a.emoji} {a.type}</div>
                  <div style={{color:"#888",fontSize:"0.76rem",marginTop:3,lineHeight:1.6}}>{NO_TYPE[a.id]}</div>
                </div>))}
              </DashCard>
            )}
          </>}
          {dashTab==="dynamics"&&<>
            {total<2&&<DashCard title="🔗 역학관계 분석"><p style={{color:"#555",textAlign:"center",padding:"16px 0",fontSize:"0.82rem"}}>참여자 2명 이상부터 분석이 가능해요</p></DashCard>}
            {total>=2&&dynamics&&<>
              {dynamics.matchedProfile&&(
                <DashCard title="🎭 우리 팀의 종합 성향">
                  <div style={{background:"#0d0d1e",borderRadius:12,padding:"14px 16px"}}>
                    <div style={{fontSize:"1rem",fontWeight:700,color:"#f1c40f",marginBottom:8}}>{dynamics.matchedProfile.label}</div>
                    <div style={{fontSize:"0.82rem",color:"#aaa",lineHeight:1.7}}>{dynamics.matchedProfile.desc}</div>
                  </div>
                </DashCard>
              )}
              {dynamics.activeSynergies.length>0&&(
                <DashCard title="✨ 우리 팀의 시너지 조합">
                  {dynamics.activeSynergies.map((s,i)=>{
                    const aA=APPLES.find(x=>x.id===s.a);const aB=APPLES.find(x=>x.id===s.b);
                    return(<div key={i} style={{background:"#0d0d1e",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{background:aA?.color,color:"#fff",borderRadius:50,padding:"2px 10px",fontSize:"0.7rem",fontWeight:700}}>{aA?.emoji} {aA?.type}</span>
                        <span style={{color:"#555"}}>+</span>
                        <span style={{background:aB?.color,color:"#fff",borderRadius:50,padding:"2px 10px",fontSize:"0.7rem",fontWeight:700}}>{aB?.emoji} {aB?.type}</span>
                        <span style={{marginLeft:"auto",fontSize:"0.75rem",fontWeight:700,color:"#f1c40f"}}>{s.label}</span>
                      </div>
                      <div style={{fontSize:"0.78rem",color:"#888",lineHeight:1.6}}>{s.desc}</div>
                    </div>);
                  })}
                </DashCard>
              )}
              {dynamics.activeTensions.length>0&&(
                <DashCard title="⚡ 주의할 긴장 관계" warn>
                  {dynamics.activeTensions.map((t,i)=>{
                    const aA=APPLES.find(x=>x.id===t.a);const aB=APPLES.find(x=>x.id===t.b);
                    return(<div key={i} style={{background:"#0d0d1e",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{background:aA?.color,color:"#fff",borderRadius:50,padding:"2px 10px",fontSize:"0.7rem",fontWeight:700}}>{aA?.emoji} {aA?.type}</span>
                        <span style={{color:"#e74c3c",fontWeight:700}}>vs</span>
                        <span style={{background:aB?.color,color:"#fff",borderRadius:50,padding:"2px 10px",fontSize:"0.7rem",fontWeight:700}}>{aB?.emoji} {aB?.type}</span>
                        <span style={{marginLeft:"auto",fontSize:"0.75rem",fontWeight:700,color:"#e74c3c"}}>{t.label}</span>
                      </div>
                      <div style={{fontSize:"0.78rem",color:"#888",lineHeight:1.6}}>{t.desc}</div>
                    </div>);
                  })}
                </DashCard>
              )}
              <DashCard title="💬 강사 피드백 포인트">
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {q:"Q. 가장 많은 유형에게 물어보세요", a:`"${APPLES.find(a=>dist[a.id]===Math.max(...Object.values(dist)))?.type}으로서 팀에 어떤 기여를 하고 있나요?"`},
                    {q:"Q. 없는 유형이 있다면 팀 전체에게", a:"\"우리 팀에 없는 이 유형의 역할을 우리가 어떻게 채울 수 있을까요?\""},
                    {q:"Q. 긴장 관계가 있다면 당사자들에게", a:"\"서로 다른 이 강점이 어떻게 하면 충돌이 아닌 시너지가 될 수 있을까요?\""},
                  ].map((item,i)=>(<div key={i} style={{background:"#0d0d1e",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:"0.72rem",color:"#f39c12",fontWeight:700,marginBottom:4}}>{item.q}</div>
                    <div style={{fontSize:"0.8rem",color:"#ccc",lineHeight:1.6,fontStyle:"italic"}}>{item.a}</div>
                  </div>))}
                </div>
              </DashCard>
            </>}
          </>}
          {dashTab==="members"&&(
            <DashCard title={`👥 참여자 목록 (${total}명)`}>
              {total===0
                ?<p style={{color:"#555",textAlign:"center",padding:"16px 0",fontSize:"0.82rem"}}>아직 참여자가 없어요 · 세션 코드: <strong style={{color:"#e74c3c"}}>{code}</strong></p>
                :<div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {dashData.map((r,i)=>{const a=APPLES.find(x=>x.id===r.topTypeId);const intA=APPLES.find(x=>x.id===r.intuitive);const match=r.intuitive===r.topTypeId;return(
                    <div key={i} style={{padding:"12px 14px",background:"#0d0d1e",borderRadius:12,border:`1px solid ${a?.color}33`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                        <span style={{fontSize:"1.1rem"}}>{a?.emoji}</span>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:"0.85rem",color:"#eee"}}>{r.name}</div>
                          <div style={{fontSize:"0.7rem",color:"#666"}}>{r.team||"팀 미설정"}</div>
                        </div>
                        <div style={{background:a?.color,color:"#fff",borderRadius:50,padding:"3px 10px",fontSize:"0.7rem",fontWeight:700}}>{a?.type}</div>
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:"0.65rem",color:"#555"}}>직관:</span>
                        <span style={{fontSize:"0.68rem",color:intA?.color,fontWeight:600}}>{intA?.emoji} {intA?.type}</span>
                        <span style={{fontSize:"0.65rem",marginLeft:4}}>{match?"✅ 일치":"⚡ 차이"}</span>
                      </div>
                    </div>
                  );})}
                </div>}
            </DashCard>
          )}
          <button style={S.ghostDark} onClick={resetAll}>← 처음으로</button>
        </div>
      </Page>
    );
  }

  if(sc==="p_join")return(
    <Page><Box>
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
        setLoading(true);setJoinErr("");
        const s=await DB.getSession(codeIn.trim());
        setLoading(false);
        if(!s){setJoinErr("세션 코드를 찾을 수 없어요. 강사에게 다시 확인해주세요.");return;}
        setCode(codeIn.trim());setSess(s);
        if(s.teams?.length>0){setTeamIn(s.teams[0]);setSc("p_team");}
        else{setPInfo({name:nameIn.trim(),team:""});setSc("p_story");}
      }}>{loading?"확인 중...":"참여하기 →"}</Btn>
    </Box></Page>
  );

  if(sc==="p_team")return(
    <Page><Box>
      <h2 style={S.h2}>내 팀/부서를 선택하세요</h2>
      <p style={{...S.muted,marginBottom:20}}>{sess?.sessionName}</p>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {sess?.teams?.map(tm=>(<button key={tm} onClick={()=>setTeamIn(tm)} style={{...S.teamBtn,borderColor:teamIn===tm?"#c0392b":"#e0e0e0",background:teamIn===tm?"#fff5f5":"#fff",color:teamIn===tm?"#c0392b":"#555",fontWeight:teamIn===tm?700:400}}>{teamIn===tm?"✅ ":""}{tm}</button>))}
      </div>
      <Btn onClick={()=>{setPInfo({name:nameIn.trim(),team:teamIn});setSc("p_story");}}>선택 완료 →</Btn>
    </Box></Page>
  );

  if(sc==="p_story"){
    const a=APPLES[storyI];
    return(<Page bg={a.bg}><Box>
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
          ?<Btn style={{background:a.color}} onClick={()=>setStoryI(storyI+1)}>다음 사과 →</Btn>
          :<Btn style={{background:a.color}} onClick={()=>setSc("p_intuitive")}>🍎 직관 선택하기</Btn>}
        {storyI>0&&<GhostBtn onClick={()=>setStoryI(storyI-1)}>← 이전</GhostBtn>}
      </div>
    </Box></Page>);
  }

  if(sc==="p_intuitive")return(
    <Page><div style={{maxWidth:480,width:"100%"}}>
      <h2 style={{...S.h2,textAlign:"center"}}>지금 가장 끌리는 사과는?</h2>
      <p style={{...S.muted,textAlign:"center",marginBottom:20}}>정답 없어요. 직관으로 하나만 고르세요 🍎</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {orderedApples().map(a=>(<button key={a.id} onClick={()=>setIntuitive(a.id)} style={{border:`2px solid ${a.color}`,borderRadius:14,padding:"14px 8px",background:intuitive===a.id?a.color:"#fff",color:intuitive===a.id?"#fff":a.color,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.2s",fontFamily:"inherit",transform:intuitive===a.id?"scale(1.04)":"scale(1)",boxShadow:intuitive===a.id?`0 6px 20px ${a.color}55`:"none"}}><span style={{fontSize:"1.6rem"}}>{a.emoji}</span><span style={{fontSize:"0.72rem",fontWeight:700,textAlign:"center",lineHeight:1.3}}>{a.name}</span><span style={{fontSize:"0.65rem",opacity:0.85}}>{a.type}</span></button>))}
      </div>
      <Btn style={{opacity:intuitive?1:0.4}} disabled={!intuitive} onClick={()=>setSc("p_diag")}>행동 진단 시작 →</Btn>
    </div></Page>
  );

  if(sc==="p_diag")return(
    <Page bg={curA.bg}><Box>
      <div style={{marginBottom:22}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.75rem",color:"#999",marginBottom:6}}><span>{curA.name}</span><span>{doneQ+1} / {APPLES.length*5}</span></div>
        <div style={{height:6,background:"#e8e8e8",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:curA.color,borderRadius:3,transition:"width 0.35s ease"}}/></div>
      </div>
      <div style={{marginBottom:20}}><span style={{background:curA.color,color:"#fff",borderRadius:50,padding:"5px 16px",fontSize:"0.78rem",fontWeight:700,display:"inline-block"}}>{curA.emoji} {curA.type}</span></div>
      <p style={{fontFamily:"Georgia,serif",fontSize:"1rem",color:"#1a1a1a",lineHeight:1.75,fontWeight:700,marginBottom:30}}>{curA.questions[qI]}</p>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:10}}>
        {[1,2,3,4,5,6,7].map(v=>{const sel=answers[`${curA.id}_${qI}`]===v;return(<button key={v} onClick={()=>handleAnswer(v)} style={{width:40,height:40,borderRadius:"50%",border:`2px solid ${curA.color}`,background:sel?curA.color:"#fff",color:sel?"#fff":curA.color,fontSize:"0.95rem",fontWeight:700,cursor:"pointer",transition:"all 0.15s",fontFamily:"inherit",boxShadow:sel?`0 4px 14px ${curA.color}55`:"none"}}>{v}</button>);})}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",color:"#bbb",padding:"0 2px"}}><span>전혀 아니다</span><span>매우 그렇다</span></div>
      {(appleI>0||qI>0)&&<GhostBtn onClick={goBackQuestion}>← 이전 문항 (답 수정하기)</GhostBtn>}
    </Box></Page>
  );

  if(sc==="p_result"){
    const maxScore=Math.max(...Object.values(scores));
    const tiedIds=APPLES.filter(a=>scores[a.id]===maxScore).map(a=>a.id);
    const isTie=tiedIds.length>1;
    const topId=isTie?chosenTie:tiedIds[0];
    const top=topId?APPLES.find(a=>a.id===topId):null;
    const intA=APPLES.find(a=>a.id===intuitive);
    const match=top?intuitive===top.id:false;
    const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    const complementApple=top?APPLES.find(a=>a.id===top.complement):null;
    const tensionApple=top?APPLES.find(a=>a.id===top.tension):null;
    const subApple=top?APPLES.find(a=>a.id===sorted.find(([id])=>id!==top.id)?.[0]):null;
    const comboKey=`${top?.id}_${subApple?.id}`;
    const combo=COMBO_RESULTS[comboKey];
    const axisScores=calcAxisScores(scores);
    const showFull=!isTie||chosenTie;

    return(<Page><Box>
      <div className="print-area">
      {!showFull ? (
        <>
          <div className="print-card" style={{background:"linear-gradient(135deg,#eee,#f8f8f8)",border:"2px solid #ccc",borderRadius:20,padding:"24px 16px",textAlign:"center",marginBottom:16}}>
            <p style={{color:"#888",fontSize:"0.75rem",margin:"0 0 4px"}}>나의 리더십 유형</p>
            <h2 style={{color:"#555",fontSize:"1.4rem",margin:"0 0 8px",fontFamily:"Georgia,serif"}}>균형형 — {tiedIds.length}가지 강점이 고르게 발달</h2>
            <p style={{fontSize:"0.8rem",color:"#777",margin:"0 0 14px"}}>{tiedIds.length}개 유형에서 똑같이 높은 점수({maxScore}점)가 나왔어요. 한 가지 강점에 치우치지 않고 여러 방식을 두루 갖췄다는 뜻이에요. 그중 지금 나를 가장 잘 설명하는 유형을 골라 더 자세히 볼 수 있어요.</p>
            <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
              {tiedIds.map(id=>{const a=APPLES.find(x=>x.id===id);return<span key={id} style={{background:a.color,color:"#fff",borderRadius:50,padding:"4px 12px",fontSize:"0.74rem",fontWeight:700}}>{a.emoji} {a.type}</span>;})}
            </div>
          </div>
          <div className="print-card" style={{background:"#fff",border:"1px solid #eee",borderRadius:16,padding:16,marginBottom:14}}>
            <h3 style={{fontSize:"0.85rem",margin:"0 0 4px",color:"#333"}}>🍎 나의 균형 잡힌 강점들</h3>
            <p style={{fontSize:"0.76rem",color:"#888",margin:"0 0 14px"}}>아래 설명을 읽어보고, "지금 이 순간 가장 나답다"고 느껴지는 유형을 눌러보세요.</p>
            {tiedIds.map(id=>{const a=APPLES.find(x=>x.id===id);return(
              <button key={id} onClick={()=>setChosenTie(id)} className="no-print" style={{display:"block",width:"100%",textAlign:"left",background:`${a.color}0d`,border:`1.5px solid ${a.color}55`,borderRadius:12,padding:"12px 14px",marginBottom:10,cursor:"pointer",fontFamily:"inherit"}}>
                <div style={{color:a.color,fontWeight:700,fontSize:"0.85rem",marginBottom:4}}>{a.emoji} {a.type} <span style={{fontWeight:400,color:"#888"}}>· {a.name}</span></div>
                <div style={{fontSize:"0.78rem",color:"#555",fontStyle:"italic",marginBottom:4}}>"{a.tagline}"</div>
                <div style={{fontSize:"0.76rem",color:"#666",lineHeight:1.5}}>{a.strength}</div>
                <div style={{fontSize:"0.72rem",color:a.color,fontWeight:700,marginTop:6}}>이 유형으로 자세히 보기 →</div>
              </button>
            );})}
            {intA&&<p style={{fontSize:"0.72rem",color:"#999",margin:"8px 0 0",borderTop:"1px solid #eee",paddingTop:8}}>참고로 직관으로 고르신 유형은 <strong style={{color:intA.color}}>{intA.type}</strong>이에요. {tiedIds.includes(intuitive)?"위 강점 후보 중 하나와 일치하네요!":"위 강점 후보와는 다른 유형이에요."}</p>}
          </div>
        </>
      ) : (
        <>
          {isTie&&chosenTie&&(
            <div className="no-print" style={{background:"#fffbf0",border:"1px solid #f39c1240",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:"0.76rem",color:"#888",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>균형있게 발달한 {tiedIds.length}가지 강점 중 <strong style={{color:top.color}}>{top.type}</strong>을 선택해서 보고 있어요</span>
              <button onClick={()=>setChosenTie(null)} style={{background:"none",border:"none",color:"#2980b9",fontSize:"0.74rem",cursor:"pointer",fontFamily:"inherit"}}>다른 유형 보기</button>
            </div>
          )}
          <div className="print-card" style={{background:`linear-gradient(135deg,${top?.color}18,${top?.color}35)`,border:`2px solid ${top?.color}`,borderRadius:20,padding:"24px 16px",textAlign:"center",marginBottom:16}}>
            <div style={{...S.appleCircle,background:top?.color,marginBottom:12}}>{top?.emoji}</div>
            <p style={{color:"#888",fontSize:"0.75rem",margin:"0 0 4px"}}>나의 리더십 유형</p>
            <h2 style={{color:top?.color,fontSize:"1.65rem",margin:"0 0 4px",fontFamily:"Georgia,serif"}}>{top?.type}</h2>
            <p style={{color:top?.color,fontSize:"0.83rem",margin:"0 0 12px"}}>{top?.name}</p>
            <p style={{fontFamily:"Georgia,serif",color:"#444",fontSize:"0.9rem",margin:"0 0 14px"}}>"{top?.tagline}"</p>
            <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
              {top?.keywords.map(k=><span key={k} style={{border:`1.5px solid ${top?.color}`,color:top?.color,borderRadius:50,padding:"2px 12px",fontSize:"0.74rem",fontWeight:500}}>{k}</span>)}
            </div>
          </div>

          <div className="print-card" style={{background:"#fff",border:"1px solid #eee",borderRadius:16,padding:18,marginBottom:14}}>
            <h3 style={{fontSize:"0.88rem",margin:"0 0 10px",color:"#333"}}>🍎 나는 어떤 리더인가?</h3>
            <p style={{fontSize:"0.86rem",color:"#444",lineHeight:1.8,margin:"0 0 14px"}}>{top?.detail}</p>
            <div style={{background:"#fafafa",borderRadius:10,padding:"12px 14px"}}>
              <p style={{fontSize:"0.75rem",fontWeight:700,color:"#888",margin:"0 0 8px"}}>이런 순간에 빛납니다 ✨</p>
              {top?.situations.map((s,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                <span style={{color:top?.color,fontWeight:700,fontSize:"0.8rem",flexShrink:0}}>0{i+1}</span>
                <span style={{fontSize:"0.8rem",color:"#555",lineHeight:1.6}}>{s}</span>
              </div>)}
            </div>
          </div>

          <div className="print-card" style={{background:`${top?.color}10`,border:`1px solid ${top?.color}30`,borderRadius:16,padding:16,marginBottom:14}}>
            <h3 style={{fontSize:"0.85rem",margin:"0 0 8px",color:top?.color}}>💡 나와 닮은 리더</h3>
            <p style={{fontSize:"0.84rem",color:"#444",lineHeight:1.7,margin:0}}>{top?.famousExample}</p>
          </div>
        </>
      )}

      <div className="print-card" style={{background:"#fff",border:"1px solid #eee",borderRadius:16,padding:16,marginBottom:14}}>
        <h3 style={{fontSize:"0.85rem",margin:"0 0 12px",color:"#333"}}>📊 나의 사과 점수</h3>
        {orderedApples().map(a=>{const score=scores[a.id]||0;return(<div key={a.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:"0.9rem",width:22}}>{a?.emoji}</span>
          <span style={{fontSize:"0.68rem",color:"#666",width:60,flexShrink:0}}>{a?.type}</span>
          <div style={{flex:1,height:7,background:"#f0f0f0",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${(score/35)*100}%`,background:a?.color,borderRadius:4,transition:"width 0.8s ease"}}/></div>
          <span style={{fontSize:"0.7rem",fontWeight:700,color:a?.color,width:28,textAlign:"right"}}>{score}</span>
        </div>);})}
      </div>

      {/* ── 3축 좌표 (NEW) ── */}
      <div className="print-card" style={{background:"#fff",border:"1px solid #eee",borderRadius:16,padding:16,marginBottom:14}}>
        <h3 style={{fontSize:"0.85rem",margin:"0 0 12px",color:"#333"}}>🧭 나의 3축 좌표</h3>
        <AxisBar group={{...AXIS_GROUPS.ta,leftVal:axisScores.ta.left,rightVal:axisScores.ta.right}}/>
        <AxisBar group={{...AXIS_GROUPS.sv,leftVal:axisScores.sv.left,rightVal:axisScores.sv.right}}/>
        <AxisBar group={{...AXIS_GROUPS.ar,leftVal:axisScores.ar.left,rightVal:axisScores.ar.right}}/>
        <p style={{fontSize:"0.7rem",color:"#999",margin:"4px 0 0",lineHeight:1.5}}>8유형 점수를 세 가지 축으로 재구성한 결과입니다. 한쪽으로 뚜렷할수록 그 성향이 강하고, 중앙에 가까울수록 상황에 따라 유연하게 오갑니다.</p>
      </div>

      {showFull&&<>
      {subApple&&combo&&(
        <div className="print-card" style={{background:"#fff",border:`2px solid ${top?.color}`,borderRadius:16,padding:16,marginBottom:14}}>
          <h3 style={{fontSize:"0.85rem",margin:"0 0 12px",color:"#333"}}>🍎✨ 나의 사과 조합</h3>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <span style={{background:top?.color,color:"#fff",borderRadius:50,padding:"4px 12px",fontSize:"0.72rem",fontWeight:700}}>{top?.emoji} {top?.type}</span>
            <span style={{color:"#aaa",fontSize:"0.85rem",fontWeight:700}}>+</span>
            <span style={{background:subApple?.color,color:"#fff",borderRadius:50,padding:"4px 12px",fontSize:"0.72rem",fontWeight:700}}>{subApple?.emoji} {subApple?.type}</span>
          </div>
          <div style={{background:`${top?.color}0d`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontWeight:700,fontSize:"0.9rem",color:top?.color,marginBottom:10,fontFamily:"Georgia,serif"}}>{combo.title}</div>
            <div style={{fontSize:"0.83rem",color:"#444",lineHeight:1.8}}>{combo.desc}</div>
          </div>
        </div>
      )}

      <div className="print-card" style={{background:"#fff",border:"1px solid #eee",borderRadius:16,padding:16,marginBottom:14}}>
        <h3 style={{fontSize:"0.85rem",margin:"0 0 12px",color:"#333"}}>💡 직관 vs 행동 비교</h3>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{flex:1,border:`2px solid ${intA?.color}`,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:"0.65rem",color:"#aaa"}}>원하는 리더십</div>
            <div style={{color:intA?.color,fontWeight:700,fontSize:"0.8rem",marginTop:2}}>{intA?.emoji} {intA?.type}</div>
          </div>
          <div style={{fontSize:"1.3rem"}}>{match?"✅":"⚡"}</div>
          <div style={{flex:1,border:`2px solid ${top?.color}`,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:"0.65rem",color:"#aaa"}}>실제 행동</div>
            <div style={{color:top?.color,fontWeight:700,fontSize:"0.8rem",marginTop:2}}>{top?.emoji} {top?.type}</div>
          </div>
        </div>
        <p style={{background:"#fffbf0",borderRadius:8,padding:"10px 12px",fontSize:"0.78rem",color:"#555",lineHeight:1.65,margin:0}}>
          {match?`✨ 두 결과가 일치해요! ${top?.type}이 나의 진짜 핵심 리더십입니다. 더 의도적으로 발휘해보세요.`:`🔍 원하는 리더십(${intA?.type})과 현재 행동(${top?.type}) 사이에 간격이 있어요. 이 간격이 나의 성장 방향입니다.`}
        </p>
      </div>

      <div className="print-card" style={{background:"#f9f9f9",borderRadius:16,padding:16,marginBottom:14}}>
        <div style={{marginBottom:12}}>
          <span style={{fontSize:"0.75rem",fontWeight:700,color:"#27ae60"}}>💪 핵심 강점</span>
          <p style={{fontSize:"0.83rem",color:"#444",margin:"4px 0 0",lineHeight:1.65}}>{top?.strength}</p>
        </div>
        <div style={{marginBottom:12}}>
          <span style={{fontSize:"0.75rem",fontWeight:700,color:"#e74c3c"}}>⚠️ 주의점</span>
          <p style={{fontSize:"0.83rem",color:"#444",margin:"4px 0 0",lineHeight:1.65}}>{top?.caution}</p>
        </div>
        <div>
          <span style={{fontSize:"0.75rem",fontWeight:700,color:"#2980b9"}}>🌱 성장 포인트</span>
          <p style={{fontSize:"0.83rem",color:"#444",margin:"4px 0 0",lineHeight:1.65}}>{top?.growth}</p>
        </div>
      </div>

      <div className="print-card" style={{background:"#fff",border:"1px solid #eee",borderRadius:16,padding:16,marginBottom:14}}>
        <h3 style={{fontSize:"0.85rem",margin:"0 0 12px",color:"#333"}}>🤝 사과 궁합</h3>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,background:`${complementApple?.color}15`,border:`1px solid ${complementApple?.color}40`,borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
            <div style={{fontSize:"1.4rem",marginBottom:4}}>{complementApple?.emoji}</div>
            <div style={{fontSize:"0.68rem",fontWeight:700,color:complementApple?.color,marginBottom:4}}>{complementApple?.type}</div>
            <div style={{fontSize:"0.65rem",color:"#888",lineHeight:1.4}}>최고의 파트너</div>
          </div>
          <div style={{flex:1,background:"#fff8f0",border:"1px solid #f39c1240",borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
            <div style={{fontSize:"1.4rem",marginBottom:4}}>{tensionApple?.emoji}</div>
            <div style={{fontSize:"0.68rem",fontWeight:700,color:tensionApple?.color,marginBottom:4}}>{tensionApple?.type}</div>
            <div style={{fontSize:"0.65rem",color:"#888",lineHeight:1.4}}>함께하면 성장</div>
          </div>
        </div>
      </div>
      </>}
      </div>

      <div style={{textAlign:"center"}} className="no-print">
        <GhostBtn onClick={()=>window.print()}>🖨 PDF로 저장</GhostBtn>
        <p style={{fontSize:"0.68rem",color:"#aaa",marginTop:-4,marginBottom:8}}>인쇄창에서 <strong>"배경 그래픽"</strong> 옵션을 켜야 색이 그대로 저장돼요</p>
      </div>

      {!isOpen&&(
        <div className="no-print" style={{background:submitted?"#f0fff4":"#fffbf0",border:`1.5px solid ${submitted?"#27ae60":"#f39c12"}`,borderRadius:12,padding:"12px 16px",textAlign:"center",marginBottom:16}}>
          <p style={{color:submitted?"#27ae60":"#f39c12",fontSize:"0.83rem",fontWeight:700,margin:0}}>
            {submitted?"✅ 결과가 강사 대시보드에 전송됐어요!":"⏳ 결과 전송 중..."}
          </p>
        </div>
      )}

      <div className="no-print"><GhostBtn onClick={resetAll}>🔄 다시 진단하기</GhostBtn></div>
    </Box></Page>);
  }
  return null;
}

function AxisBar({group}){
  const total=group.leftVal+group.rightVal||1;
  const leftPct=(group.leftVal/total)*100;
  const boundary=Math.abs(leftPct-50)<8;
  return(
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.72rem",marginBottom:5}}>
        <span style={{fontWeight:700,color:group.leftColor}}>{group.leftLabel} {group.leftVal}</span>
        <span style={{fontWeight:700,color:group.rightColor}}>{group.rightVal} {group.rightLabel}</span>
      </div>
      <div style={{width:"100%",height:10,borderRadius:5,overflow:"hidden",display:"flex",background:"#f0f0f0"}}>
        <div style={{width:`${leftPct}%`,background:group.leftColor,transition:"width 0.8s ease"}}/>
        <div style={{width:`${100-leftPct}%`,background:group.rightColor,transition:"width 0.8s ease"}}/>
      </div>
      <div style={{textAlign:"center",fontSize:"0.66rem",color:"#999",marginTop:3}}>
        {boundary?"경계형 — 상황에 따라 유연하게 오갑니다":leftPct>50?`${group.leftLabel} 쪽이 뚜렷합니다`:`${group.rightLabel} 쪽이 뚜렷합니다`}
      </div>
    </div>
  );
}
function Page({children,bg="linear-gradient(160deg,#fff9f0,#ffe8d6)"}){return(<div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 16px 60px",fontFamily:"'Noto Sans KR',sans-serif"}}><style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact;}button{cursor:pointer;}@media print{body *{visibility:hidden;}.print-area,.print-area *{visibility:visible;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}.print-area{position:absolute;left:0;top:0;width:100%;}.no-print{display:none !important;}.print-card{break-inside:avoid;-webkit-column-break-inside:avoid;page-break-inside:avoid;}}`}</style>{children}</div>);}
function Box({children,center=false}){return<div style={{background:"#fff",borderRadius:24,padding:"32px 22px",maxWidth:480,width:"100%",boxShadow:"0 16px 48px rgba(0,0,0,0.09)",textAlign:center?"center":"left"}}>{children}</div>;}
function DashCard({title,children,warn=false}){return(<div style={{background:warn?"#1a0f00":"#0d0d22",border:`1px solid ${warn?"#3a2000":"#1e1e3a"}`,borderRadius:16,padding:20,marginBottom:14}}><h3 style={{margin:"0 0 14px",fontSize:"0.88rem",color:warn?"#f39c12":"#aaa",fontWeight:700}}>{title}</h3>{children}</div>);}
function FloatingApples(){return(<div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16,fontSize:"1.8rem"}}>{["🍎","🍏","🍎","🍏","🍎"].map((e,i)=>(<span key={i} style={{display:"inline-block",animation:`fl${i} ${2.5+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.4}s`}}>{e}<style>{`@keyframes fl${i}{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style></span>))}</div>);}
function Btn({children,onClick,style={},blue=false,disabled=false}){return(<button disabled={disabled} onClick={onClick} style={{background:disabled?"#ccc":blue?"linear-gradient(135deg,#2980b9,#3498db)":"linear-gradient(135deg,#c0392b,#e74c3c)",color:"#fff",border:"none",borderRadius:50,padding:"13px 24px",fontSize:"0.92rem",fontWeight:700,width:"100%",marginBottom:8,fontFamily:"inherit",...style}}>{children}</button>);}
function GhostBtn({children,onClick}){return<button onClick={onClick} style={{background:"transparent",color:"#888",border:"1.5px solid #ddd",borderRadius:50,padding:"11px 24px",fontSize:"0.86rem",width:"100%",marginBottom:8,fontFamily:"inherit"}}>{children}</button>;}
function BackBtn({onClick}){return<button onClick={onClick} style={{background:"none",border:"none",color:"#aaa",fontSize:"0.82rem",padding:"0 0 16px",fontFamily:"inherit"}}>← 뒤로</button>;}
function Label({children}){return<p style={{fontSize:"0.78rem",fontWeight:700,color:"#555",margin:"12px 0 5px"}}>{children}</p>;}
function Input({...props}){return<input {...props} style={{width:"100%",border:"1.5px solid #e0e0e0",borderRadius:10,padding:"10px 14px",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",marginBottom:4}}/>;}

const S={
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
