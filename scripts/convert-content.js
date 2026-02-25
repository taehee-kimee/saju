const fs = require('fs');

const mdPath = 'C:/Users/playk/.openclaw/media/inbound/027a95d2-9008-47e1-925e-b071cfebe83d.md';
const outPath = 'nyangsae/data/catContents.ts';

// 각 캐릭터별 재미있는 소제목 + 패턴
const subtitles = {
  // NT 그룹
  "NT_木": { diagnosis: "나는야 탐정 고양이 🔍", ohaengMap: "지적 성장의 나무 🌳", mbtiEngine: "분석하는 머릿속 🧠", combination: "전략가의 숲 속에서", pattern: "완벽한 정보가 모일 때까지 멈추기" },
  "NT_火": { diagnosis: "나는야 보스 고양이 😤", ohaengMap: "불타는 리더십 🔥", mbtiEngine: "밀어붙이는 추진력 🚀", combination: "전장을 지배하는 화염", pattern: "밀어붙이다가 혼자 짊어지기" },
  "NT_土": { diagnosis: "나는야 철학 고양이 🤔", ohaengMap: "깊이 있는 토양 🏔️", mbtiEngine: "생각의 지하수로 ⛏️", combination: "깊은 뿌리의 지혜", pattern: "생각은 깊어지는데 현실은 그대로" },
  "NT_金": { diagnosis: "나는야 냉미 고양이 🧊", ohaengMap: "날카로운 정돈력 ✨", mbtiEngine: "완벽을 향한 칼날 ⚔️", combination: "정밀한 설계자", pattern: "기준이 높아 관계가 얇아지기" },
  "NT_水": { diagnosis: "나는야 음모 고양이 🌑", ohaengMap: "흐르는 통찰력 🌊", mbtiEngine: "보이지 않는 전략 🕸️", combination: "깊은 물의 비밀", pattern: "다 알지만 말하지 않기" },
  // NF 그룹
  "NF_木": { diagnosis: "나는야 새벽 고양이 🌙", ohaengMap: "감성의 가지가 자라나 🌿", mbtiEngine: "꿈꾸는 심장 💫", combination: "이상을 키우는 숲", pattern: "혼자 삼키고 밤에 풀어내기" },
  "NF_火": { diagnosis: "나는ya 열정 고양이 🌟", ohaengMap: "타오르는 영감의 불꽃 🔥", mbtiEngine: "사람을 움직이는 마력 💖", combination: "꿈을 전파하는 화염", pattern: "뜨겁게 시작하고 지치기" },
  "NF_土": { diagnosis: "나는야 공감 고양이 🫂", ohaengMap: "마음을 담는 그릇 🏺", mbtiEngine: "듣는 것의 힘 👂", combination: "신뢰의 대지", pattern: "남을 먼저 챙기다 나를 놓치기" },
  "NF_金": { diagnosis: "나는야 순백 고양이 🤍", ohaengMap: "맑은 기준의 빛 ✨", mbtiEngine: "순수한 이상의 결정 💎", combination: "흔들리지 않는 진실", pattern: "이상과 기준 사이에서 흔들리기" },
  "NF_水": { diagnosis: "나는ya 신비 고양이 🔮", ohaengMap: "깊은 감정의 물결 🌊", mbtiEngine: "보이지 않는 공감 🎭", combination: "신비로운 심연", pattern: "말없이 깊어지기" },
  // ST 그룹
  "ST_木": { diagnosis: "나는ya 믿음직한 고양이 📋", ohaengMap: "꾸준히 자라는 성장 🌱", mbtiEngine: "할 일을 항해 🎯", combination: "실행으로 맺는 열", pattern: "해야 할 일부터 끝내기" },
  "ST_火": { diagnosis: "나는ya 돌격 고양이 💥", ohaengMap: "빠른 추진의 불길 🔥", mbtiEngine: "생각보다 먼저 몸이 🏃", combination: "즉시 실행의 화력", pattern: "생각보다 행동이 먼저" },
  "ST_土": { diagnosis: "나는ya 든든 고양이 🏠", ohaengMap: "묵묵히 지키는 대지 🗻", mbtiEngine: "책임지는 어깨 💪", combination: "흔들리지 않는 기둥", pattern: "묵묵히 떠안기" },
  "ST_金": { diagnosis: "나는ya 완벽 고양이 ✨", ohaengMap: "틀림없는 정밀도 📐", mbtiEngine: "다시 해! 완벽 추구 🔧", combination: "완성도의 대가", pattern: "틀린 걸 그냥 못 넘기기" },
  "ST_水": { diagnosis: "나는ya 침착 고양이 🧘", ohaengMap: "유연한 대처의 물결 💧", mbtiEngine: "패닉 없는 심장 ❄️", combination: "위기의 수면 아래", pattern: "겉은 차분, 속은 계산 중" },
  // SF 그룹
  "SF_木": { diagnosis: "나는ya 따뜻 고양이 🌳", ohaengMap: "포근하게 자라나는 돌봄 🤗", mbtiEngine: "주변을 감싸는 풀 💚", combination: "성장시키는 따스함", pattern: "다 품고 나중에 지치기" },
  "SF_火": { diagnosis: "나는ya 인싸 고양이 🎉", ohaengMap: "분위기를 밝히는 열기 ☀️", mbtiEngine: "모두의 중심 에너지 ⚡", combination: "함께 빛나는 불꽃", pattern: "분위기에 올라타기" },
  "SF_土": { diagnosis: "나는ya 집사 고양이 🏠", ohaengMap: "헌신의 든든한 땅 🛖", mbtiEngine: "묵묵히 챙기는 손길 👐", combination: "돌봄의 요람", pattern: "책임을 정으로 해결하기" },
  "SF_金": { diagnosis: "나는ya 섬세 고양이 🎀", ohaengMap: "디테일의 정교함 🔍", mbtiEngine: "작은 것도 놓치지 않아 👁️", combination: "섬세함의 결정", pattern: "작은 디테일에 마음 쓰기" },
  "SF_水": { diagnosis: "나는ya 치유 고양이 💙", ohaengMap: "마음을 적시는 샘물 🩵", mbtiEngine: "상처를 어루만지는 온기 🌡️", combination: "회복의 깊은 물", pattern: "남의 아픔을 내 일처럼" }
};

// 패턴 본문 컨텐츠 (20개 전체)
const patternContents = {
  // NT 그룹
  "NT_木": "당신은 구조를 이해해야 움직이는 타입이에요. 직관과 사고는 끊임없이 가능성을 확장하지만, 목(木)의 성장 에너지는 더 나은 답을 찾게 만들죠. 그래서 \"조금만 더 조사하면 완벽해질 텐데\"라는 생각이 반복됩니다. 행동을 미루는 건 게으름이 아니라, 불완전한 선택을 싫어하는 구조 때문이에요.",
  "NT_火": "사고 중심 판단에 화(火)의 추진력이 더해지면 빠른 결단과 실행이 강점이 돼요. 하지만 속도가 빠른 만큼 타인의 속도를 기다리기 어렵죠. \"내가 하는 게 빠르잖아\"라는 생각이 무의식적으로 반복되며 결국 책임을 혼자 떠안게 됩니다. 이건 지배 욕구라기보다 효율 중심 구조의 자연스러운 결과예요.",
  "NT_土": "당신은 개념과 원리를 탐구하는 데 강해요. 토(土)의 안정 에너지가 더해져 생각을 오래 붙들죠. 하지만 안전하게 정리된 확신이 생기기 전엔 움직이지 않아요. 그래서 \"다 이해했는데 왜 달라진 게 없지?\"라는 반복이 생깁니다. 실행보다 구조 완성을 먼저 추구하는 성향 때문이에요.",
  "NT_金": "금(金)은 정리와 기준의 에너지예요. 여기에 사고 중심 판단이 더해지면 '합리성'이 관계의 필터가 됩니다. 당신은 쉽게 타협하지 않죠. 그 결과 사람은 많은데 깊은 연결은 적을 수 있어요. \"왜 맞는 사람이 없지?\"라는 생각이 반복되는 건, 감정이 아니라 기준이 먼저 작동하기 때문이에요.",
  "NT_水": "수(水)는 관찰과 축적의 에너지예요. 직관적 사고와 만나면 상황을 미리 읽는 힘이 강해지죠. 하지만 확신이 없으면 표현하지 않아요. 그래서 \"굳이 말 안 해도 알겠지\"라는 태도가 반복됩니다. 속으로는 많은 걸 계산하지만 겉으로 드러나지 않아 오해가 쌓일 수 있어요.",
  // NF 그룹
  "NF_木": "감정과 의미를 중시하는 구조에 목(木)의 확장 에너지가 더해져 생각이 깊어져요. 낮에는 괜찮은 척하지만 밤이 되면 감정이 확장됩니다. \"내가 너무 예민한가?\"라는 질문이 반복되죠. 이건 감정 과잉이 아니라, 공감 회로가 크게 열려 있기 때문이에요.",
  "NF_火": "이상과 열정이 결합된 구조예요. 화(火)는 추진력을 주지만 지속력은 별개죠. 감정이 움직이면 전력을 다하지만, 감정이 식으면 에너지도 줄어듭니다. 그래서 \"왜 나는 금방 뜨거워졌다가 식지?\"라는 반복이 생겨요. 열정은 강점이지만 리듬 조절이 필요해요.",
  "NF_土": "토(土)의 포용력과 감정 중심 사고가 만나면 타인을 안정시키는 힘이 커져요. 문제는 자신보다 타인을 우선한다는 점이에요. \"나는 괜찮아\"라는 말이 습관처럼 반복됩니다. 이건 희생이 아니라, 관계에서 균형을 맞추려는 본능이에요.",
  "NF_金": "감정과 가치를 중요하게 여기지만 금(金)의 구조는 원칙을 세우게 해요. 그래서 \"내가 너무 예민한가?\" 혹은 \"내가 너무 엄격한가?\"라는 갈등이 반복됩니다. 감정의 흐름과 기준의 충돌이 내부 긴장을 만들어요. 잘못이 아니라 구조적 긴장이에요.",
  "NF_水": "수(水)의 내면 에너지는 감정을 깊이 축적해요. 직관적 공감 능력이 강해 타인의 분위기를 빠르게 읽죠. 하지만 표현은 적어요. 그래서 \"왜 나만 이렇게 복잡하지?\"라는 생각이 반복됩니다. 외부보다 내부가 훨씬 복잡한 구조예요.",
  // ST 그룹
  "ST_木": "현실 감각과 목(木)의 성장 에너지가 만나면 책임감이 강해져요. 해야 할 일을 먼저 처리하죠. 하지만 \"나는 왜 항상 바쁘지?\"라는 반복이 생길 수 있어요. 성실함이 습관이 되어 스스로를 멈추지 못하기 때문이에요.",
  "ST_火": "감각 중심 판단과 화(火)의 속도는 즉각 실행으로 이어져요. 문제는 돌아보는 시간이 적다는 점이에요. \"왜 또 내가 먼저 뛰었지?\"라는 상황이 반복됩니다. 충동이 아니라 빠른 정보 처리 구조 때문이에요.",
  "ST_土": "토(土)는 안정과 책임의 에너지예요. 현실 판단과 만나면 팀의 버팀목이 됩니다. 하지만 \"왜 결국 내가 하지?\"라는 반복이 생겨요. 거절보다 유지가 먼저인 구조 때문이에요.",
  "ST_金": "금(金)의 정돈 에너지가 강해 작은 오류도 눈에 띄어요. 효율을 중시하다 보니 수정이 반복됩니다. \"왜 다 고쳐야 마음이 놓이지?\"라는 생각이 자연스럽죠. 완벽 추구가 안정감을 주기 때문이에요.",
  "ST_水": "수(水)의 내면 에너지는 상황을 빠르게 분석해요. 감정 표현은 적지만 내부 계산은 활발하죠. 그래서 \"나는 왜 감정이 늦게 올라오지?\"라는 반복이 생겨요. 반응이 느린 게 아니라 내부 처리 시간이 필요한 구조예요.",
  // SF 그룹
  "SF_木": "감각적 공감과 목(木)의 확장 에너지가 만나면 주변을 넓게 감싸요. 하지만 \"왜 나는 항상 돌보고 있지?\"라는 반복이 생길 수 있어요. 확장하는 성향이 경계를 흐리게 만들기 때문이에요.",
  "SF_火": "화(火)의 활력과 감정 중심 사고는 관계에서 빛나요. 하지만 외부 에너지에 영향을 많이 받아요. \"왜 나는 혼자 있을 때 기운이 빠질까?\"라는 패턴이 반복됩니다. 외부 자극이 연료가 되는 구조예요.",
  "SF_土": "토(土)의 안정성과 감정 중심 판단이 만나면 헌신이 강해요. 문제는 경계를 세우기 어렵다는 점이에요. \"거절하면 미안한데…\"라는 반복이 생겨요. 안정 유지가 최우선인 구조 때문이에요.",
  "SF_金": "금(金)의 세밀함은 감정 인식과 만나 더 정교해져요. 사소한 표정 변화도 읽어내죠. 하지만 \"내가 너무 예민한가?\"라는 반복이 생깁니다. 민감함은 약점이 아니라 관찰력이 세밀하기 때문이에요.",
  "SF_水": "수(水)의 깊은 공감 구조는 타인의 감정을 흡수해요. 그래서 위로는 잘하지만 소진이 빠를 수 있어요. \"왜 내가 더 힘들지?\"라는 반복이 생깁니다. 감정 동조가 강한 구조이기 때문이에요."
};

// 개운법 스타일 mission7
const gaeunbypMission7 = {
  "木": ["🌅 동쪽 창가에서 5분 햇살 쬐며 심호흡하기", "🌿 녹색 물건 지갑에 넣기", "🌱 작은 화분에 물 주기", "🚶‍♀️ 동쪽으로 10분 걷기", "📗 녹색 노트에 목표 3가지 적기", "🥗 채소 위주 식사하기", "🎵 나무 소리 ASMR 듣기"],
  "火": ["🌞 남쪽에서 5분 명상하기", "❤️ 빨간색 양말 착용하기", "🔥 양초 피우기", "☀️ 낮 12시 햇빛 쬐기", "💃 신나는 음악에 맞춰 춤추기", "🌶️ 매운 음식 먹기", "📱 성과 자랑하기"],
  "土": ["🧘 방 중앙에서 명상하기", "💛 노란색 스카프 착용하기", "🏠 거실 청소 5분하기", "🍚 따뜻한 밥 제대로 먹기", "🕯️ 황색 촛불 켜기", "🌾 현미 간식 먹기", "📝 감사일기 5가지 적기"],
  "金": ["🌅 서쪽에서 석양 감상하기", "🤍 흰색 액세서리 착용하기", "✨ 지갑 정리하기", "🧹 책상 정리하기", "🥛 우유 한 잔 마시기", "🌬️ 환기 5분하기", "📝 내일 할 일 정리하기"],
  "水": ["🌊 북쪽으로 산책하기", "💙 파란색 옷 입기", "💧 물 한 잔 마시며 다짐하기", "🛁 따뜻한 물로 손 씻기", "🎧 물소리 ASMR 듣기", "🐟 생선 먹기", "📖 조용한 곳에서 독서하기"]
};

// 이름 오버라이드 (마크다운 이름에서 변경할 경우)
const nameOverrides = {
  "NT_金": "냉미냥"
};

const taglines = {
  "NT_木": "모든 걸 분석하고 혼자 결론 냄", "NT_火": "말 없이 모든 걸 장악", "NT_土": "혼자 깊은 생각에 잠김", "NT_金": "완벽주의, 날카로운 눈빛", "NT_水": "다 알고 있지만 말 안 함",
  "NF_木": "새벽에 혼자 울고 일기 씀", "NF_火": "꿈 얘기 3시간 가능", "NF_土": "네 말 다 들어줄게", "NF_金": "너무 순수해서 세상이 버거움", "NF_水": "말은 없는데 분위기 압도",
  "ST_木": "할 일 다 하고 잠 자는 타입", "ST_火": "생각보다 행동이 먼저", "ST_土": "묵묵히 다 해주는 맏이 기질", "ST_金": "틀린 거 못 참음, 다시 해", "ST_水": "패닉에도 표정 변화 없음",
  "SF_木": "포근한 위로로 주변을 감쌈", "SF_火": "모임의 중심, 에너지 뿜뿜", "SF_土": "헌신적 돌봄의 대명사", "SF_金": "디테일 장인, 작은 것도 놓치지 않아", "SF_水": "마음의 상처를 어루만지는 타입"
};

const defaultFortunes = {
  love: "2026년 연애운은 서로를 이해하고 성장하는 방향으로 흘러갑니다. 진심어린 소통이 관계를 깊게 만듭니다.",
  money: "2026년 재물운은 안정적인 흐름을 보입니다. 계획적인 소비와 저축이 장기적인 안정을 가져옵니다.",
  career: "2026년 커리어운은 꾸준한 노력의 결실을 보는 해입니다. 새로운 도전에도 용기를 내세요.",
  health: "2026년 건강운은 규칙적인 생활습관이 중요합니다. 충분한 휴식과 적절한 운동이 필요합니다.",
  relationship: "2026년 인간관계운은 주변과의 조화가 중요합니다. 서로를 배려하는 마음이 관계를 돈독히 합니다."
};

// Parse manually
const md = fs.readFileSync(mdPath, 'utf-8');

const matches = [];
const headerRegex = /^## ===\s*(.+?)\s*===$/gm;
let m;
while ((m = headerRegex.exec(md)) !== null) {
  const inner = m[1].trim();
  const normalized = inner.replace(/\\\|/g, '|');
  const parts = normalized.split('|').map(p => p.trim());
  
  if (parts.length >= 3) {
    const id = parts[0].trim();
    const rest = parts[1];
    const mbti = parts[2].trim();
    
    const restTrimmed = rest.trim();
    const lastSpaceIdx = restTrimmed.lastIndexOf(' ');
    let name, emoji;
    if (lastSpaceIdx > 0) {
      name = restTrimmed.substring(0, lastSpaceIdx).trim();
      emoji = restTrimmed.substring(lastSpaceIdx + 1).trim();
    } else {
      name = restTrimmed;
      emoji = '';
    }
    
    matches.push({ index: m.index, id, name, emoji, mbti });
  }
}

matches.sort((a,b)=>a.index-b.index);

const chars = [];

for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  const start = match.index;
  const end = i < matches.length - 1 ? matches[i + 1].index : md.length;
  const block = md.substring(start, end);
  const sections = {};

  const diagMatch = block.match(/### ---diagnosis---\s*\n?([\s\S]*?)(?=### ---|## ===|$)/);
  if (diagMatch) sections.diagnosis = diagMatch[1].trim().replace(/\s+/g, ' ').replace(/-+/g, '').trim();
  const ohaengMatch = block.match(/### ---ohaengMap---\s*\n?([\s\S]*?)(?=### ---|## ===|$)/);
  if (ohaengMatch) sections.ohaengMap = ohaengMatch[1].trim().replace(/\s+/g, ' ').replace(/-+/g, '').trim();
  const mbtiMatch = block.match(/### ---mbtiEngine---\s*\n?([\s\S]*?)(?=### ---|## ===|$)/);
  if (mbtiMatch) sections.mbtiEngine = mbtiMatch[1].trim().replace(/\s+/g, ' ').replace(/-+/g, '').trim();
  const comboMatch = block.match(/### ---combination---\s*\n?([\s\S]*?)(?=### ---|## ===|$)/);
  if (comboMatch) sections.combination = comboMatch[1].trim().replace(/\s+/g, ' ').replace(/-+/g, '').trim();

  chars.push({ id: match.id, name: match.name, emoji: match.emoji, mbti: match.mbti, sections });
}

console.log('Found', matches.length, 'characters');

// Generate TypeScript
let ts = `export interface CatContent {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  subtitles: {
    diagnosis: string;
    ohaengMap: string;
    mbtiEngine: string;
    combination: string;
    pattern: string;
  };
  sections: {
    diagnosis: string;
    ohaengMap: string;
    mbtiEngine: string;
    combination: string;
    pattern: string;
    love: string;
    money: string;
    career: string;
    health: string;
    relationship: string;
    mission7: string[];
  };
}

export const CAT_CONTENTS: Record<string, CatContent> = {
`;

for (const ch of chars) {
  const t = taglines[ch.id] || '';
  const s = ch.sections;
  const sub = subtitles[ch.id] || { diagnosis: '', ohaengMap: '', mbtiEngine: '', combination: '', pattern: '컨텐츠 준비 중...' };
  const patternContent = patternContents[ch.id] || '컨텐츠 준비 중...';
  const name = nameOverrides[ch.id] || ch.name;
  
  const ohaeng = ch.id.split('_')[1];
  const mission7 = gaeunbypMission7[ohaeng] || gaeunbypMission7["木"];
  
  const escapeStr = (str) => str.replace(/"/g, '\\"').replace(/\n/g, ' ');
  
  ts += `  "${ch.id}": {
    id: "${ch.id}",
    name: "${name}",
    emoji: "${ch.emoji}",
    tagline: "${t}",
    subtitles: {
      diagnosis: "${escapeStr(sub.diagnosis)}",
      ohaengMap: "${escapeStr(sub.ohaengMap)}",
      mbtiEngine: "${escapeStr(sub.mbtiEngine)}",
      combination: "${escapeStr(sub.combination)}",
      pattern: "${escapeStr(sub.pattern)}"
    },
    sections: {
      diagnosis: "${escapeStr(s.diagnosis || '')}",
      ohaengMap: "${escapeStr(s.ohaengMap || '')}",
      mbtiEngine: "${escapeStr(s.mbtiEngine || '')}",
      combination: "${escapeStr(s.combination || '')}",
      pattern: "${escapeStr(patternContent)}",
      love: "${defaultFortunes.love}",
      money: "${defaultFortunes.money}",
      career: "${defaultFortunes.career}",
      health: "${defaultFortunes.health}",
      relationship: "${defaultFortunes.relationship}",
      mission7: [${mission7.map(x => `"${x}"`).join(', ')}]
    }
  },
`;
}

const catIds = [
  "NT_木", "NT_火", "NT_土", "NT_金", "NT_水",
  "NF_木", "NF_火", "NF_土", "NF_金", "NF_水",
  "ST_木", "ST_火", "ST_土", "ST_金", "ST_水",
  "SF_木", "SF_火", "SF_土", "SF_金", "SF_水"
];

ts += `};

export const CAT_IDS = [
  ${catIds.map(id => `"${id}"`).join(', ')}
];
`;

fs.writeFileSync(outPath, ts, 'utf-8');
console.log('\n✅ Generated catContents.ts with', chars.length, 'characters');
console.log('✅ All 20 pattern contents updated!');
