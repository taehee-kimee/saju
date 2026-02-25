const fs = require('fs');
const path = require('path');

// Read the markdown file
const mdContent = fs.readFileSync(
  'C:\\Users\\playk\\.openclaw\\media\\inbound\\027a95d2-9008-47e1-925e-b071cfebe83d.md',
  'utf-8'
);

// Parse the markdown content
const lines = mdContent.split('\n');
const characters = [];
let currentChar = null;
let currentSection = null;

for (const line of lines) {
  // Match character header: ## === NT_木 | 탐정냥 🔍 | INTJ/INTP ===
  const charMatch = line.match(/## === (\w+_\w+) \| (.+?) (\S+) \| (.+?) ===/);
  if (charMatch) {
    if (currentChar) {
      characters.push(currentChar);
    }
    currentChar = {
      id: charMatch[1],
      name: charMatch[2].trim(),
      emoji: charMatch[3],
      mbti: charMatch[4],
      sections: {}
    };
    currentSection = null;
    continue;
  }

  // Match section header: ### ---diagnosis---
  const sectionMatch = line.match(/### ---(\w+)---/);
  if (sectionMatch && currentChar) {
    currentSection = sectionMatch[1];
    currentChar.sections[currentSection] = '';
    continue;
  }

  // Collect section content
  if (currentSection && currentChar && line.trim() && !line.startsWith('#') && !line.startsWith('---')) {
    currentChar.sections[currentSection] += (currentChar.sections[currentSection] ? ' ' : '') + line.trim();
  }
}

if (currentChar) {
  characters.push(currentChar);
}

// Generate TypeScript content
let tsContent = `export interface CatContent {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  sections: {
    diagnosis: string;
    ohaengMap: string;
    mbtiEngine: string;
    combination: string;
    love: string;
    money: string;
    career: string;
    health: string;
    relationship: string;
    mission7: string[];
  };
}

export const CAT_CONTENTS: Record<string, CatContent> = {\n`;

// Default mission7 for all characters
const defaultMission7 = [
  "오늘 한 가지 작은 목표 세우고 달성하기",
  "30분 산책하며 마음 비우기",
  "감사한 일 3가지 적어보기",
  "좋아하는 음식으로 나를 위로하기",
  "누군가에게 진심 어린 칭찬 한마디",
  "혼자 조용한 시간 20분 가지기",
  "이번 주 느낀 점 한 줄로 정리하기"
];

// Default fortune templates (will be replaced by AI)
const defaultFortunes = {
  love: "2026년 연애운은 서로를 이해하고 성장하는 방향으로 흘러갑니다. 진심어린 소통이 관계를 깊게 만듭니다.",
  money: "2026년 재물운은 안정적인 흐름을 보입니다. 계획적인 소비와 저축이 장기적인 안정을 가져옵니다.",
  career: "2026년 커리어운은 꾸준한 노력의 결실을 보는 해입니다. 새로운 도전에도 용기를 내세요.",
  health: "2026년 건강운은 규칙적인 생활습관이 중요합니다. 충분한 휴식과 적절한 운동이 필요합니다.",
  relationship: "2026년 인간관계운은 주변과의 조화가 중요합니다. 서로를 배려하는 마음이 관계를 돈독히 합니다."
};

// Taglines mapping
const taglines = {
  "NT_木": "모든 걸 분석하고 혼자 결론 냄",
  "NT_火": "말 없이 모든 걸 장악",
  "NT_土": "혼자 깊은 생각에 잠김",
  "NT_金": "완벽주의, 날카로운 눈빛",
  "NT_水": "다 알고 있지만 말 안 함",
  "NF_木": "새벽에 혼자 울고 일기 씀",
  "NF_火": "꿈 얘기 3시간 가능",
  "NF_土": "네 말 다 들어줄게",
  "NF_金": "너무 순수해서 세상이 버거움",
  "NF_水": "말은 없는데 분위기 압도",
  "ST_木": "할 일 다 하고 잠 자는 타입",
  "ST_火": "생각보다 행동이 먼저",
  "ST_土": "묵묵히 다 해주는 맏이 기질",
  "ST_金": "틀린 거 못 참음, 다시 해",
  "ST_水": "패닉에도 표정 변화 없음",
  "SF_木": "포근한 위로로 주변을 감쌈",
  "SF_火": "모임의 중심, 에너지 뿜뿜",
  "SF_土": "헌신적 돌봄의 대명사",
  "SF_金": "디테일 장인, 작은 것도 놓치지 않아",
  "SF_水": "마음의 상처를 어루만지는 타입"
};

for (const char of characters) {
  const tagline = taglines[char.id] || "";
  tsContent += `  "${char.id}": {
    id: "${char.id}",
    name: "${char.name}",
    emoji: "${char.emoji}",
    tagline: "${tagline}",
    sections: {
      diagnosis: "${char.sections.diagnosis || ''}",
      ohaengMap: "${char.sections.ohaengMap || ''}",
      mbtiEngine: "${char.sections.mbtiEngine || ''}",
      combination: "${char.sections.combination || ''}",
      love: "${defaultFortunes.love}",
      money: "${defaultFortunes.money}",
      career: "${defaultFortunes.career}",
      health: "${defaultFortunes.health}",
      relationship: "${defaultFortunes.relationship}",
      mission7: [${defaultMission7.map(m => `"${m}"`).join(', ')}]
    }
  },\n`;
}

tsContent += `};\n\nexport const CAT_IDS = [\n  "NT_木", "NT_火", "NT_土", "NT_金", "NT_水",\n  "NF_木", "NF_火", "NF_土", "NF_金", "NF_水",\n  "ST_木", "ST_火", "ST_土", "ST_金", "ST_水",\n  "SF_木", "SF_火", "SF_土", "SF_金", "SF_水"\n];\n`;

fs.writeFileSync('data/catContents.ts', tsContent, 'utf-8');
console.log(`Generated catContents.ts with ${characters.length} characters`);
