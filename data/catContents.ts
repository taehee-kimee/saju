export interface CatContent {
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

// 20종 캐릭터 콘텐츠 - NT 그룹 (5종)
const NT_CATS: { [key: string]: CatContent } = {
  "NT_木": { id: "NT_木", name: "탐정냥", emoji: "🔍", tagline: "모든 걸 분석하고 혼자 결론 냄", sections: { diagnosis: "조용히 관찰하고 혼자 모든 걸 분석하는 타입. 남들이 눈치채기 전에 이미 다 파악하고 있습니다.", ohaengMap: "목(木)의 기운이 분석력과 성장 욕구를 부여합니다.", mbtiEngine: "INTJ/INTP의 직관(N)과 사고(T)가 결합해 '왜?'를 끝까지 파고듭니다.", combination: "목의 성장 욕구 + NT의 전략 = '더 나은 방법을 찾는 탐구자'.", love: "마음에 드는 상대를 오래 관찰하지만 표현이 늦습니다.", money: "정보 수집 후 신중하게 투자하는 타입.", career: "전략 기획, 데이터 분석, 연구직에 적합합니다.", health: "정신적 피로가 주요 문제입니다. 과도한 사색으로 불면증이 생길 수 있어요.", relationship: "깊은 대화를 좋아하지만 표면적 관계는 피합니다.", mission7: ["오늘 한 가지 결정을 10분 안에 날려보기", "완벽하지 않아도 괜찮은 일 1개 완료하기", "감정 표현 문장 1개 써보기", "혼자가 아닌 누군가와 대화하기", "정보 수집 30분만 하고 멈추기", "직감으로 선택한 것 1개 결과 확인하기", "이번 주 느낀 것을 3줄로 요약하기"] } },
  "NT_火": { id: "NT_火", name: "보스냥", emoji: "😤", tagline: "말 없이 모든 걸 장악하는 타입", sections: { diagnosis: "특별히 나서지 않아도 자연스럽게 중심이 되는 타입.", ohaengMap: "화(火)의 강렬한 에너지가 강력한 리더십을 만듭니다.", mbtiEngine: "ENTJ/ENTP의 외향과 사고가 '내가 이끄는 게 최고'라는 확신을 줍니다.", combination: "화의 추진력 + NT의 전략 = '강력한 실행 리더'.", love: "이끌고 싶은 욕구가 강합니다.", money: "목표 중심 재테크를 선호합니다.", career: "리더, 기업가, 프로젝트 매니저에 최적입니다.", health: "스트레스를 무시하고 과로하는 경향이 있습니다.", relationship: "능력으로 사람을 이끕니다.", mission7: ["오늘 상대방 의견 먼저 듣기", "완벽하지 않아도 칭찬하기", "감정 단어로 기분 표현하기", "팀원으로 참여핳기", "10분 일찍 퇴근하기", "실패한 일 적고 넘기기", "감사 표현하기"] } },
  "NT_土": { id: "NT_土", name: "철학냥", emoji: "🤔", tagline: "혼자 깊은 생각에 빠져있음", sections: { diagnosis: "세상의 본질을 탐구하는 철학자 타입.", ohaengMap: "토(土)의 안정감이 깊이 있는 통찰을 만듭니다.", mbtiEngine: "INTP/INTJ의 직관과 사고가 '철학적 분석가'를 만듭니다.", combination: "토의 깊이 + NT의 통찰 = '세상의 원리를 파헤치는 자'.", love: "정신적인 교류를 중시합니다.", money: "물질보다 정신적 가치를 중시합니다.", career: "학자, 연구원, 철학자, 전략기획자에 적합합니다.", health: "생각만 하지 말고 산책이나 명상으로 몸도 움직이세요.", relationship: "많은 사람과 얕게 지내기보다 소수와 깊게 교류합니다.", mission7: ["30분 산책하며 생각 정리하기", "생각을 글로 정리하기", "조용한 카페에서 시간 별내기", "질문 1개 던지기", "책 10페이지 읽기", "새로운 개념 찾아보기", "고민거리 1개 해결하기"] } },
  "NT_金": { id: "NT_金", name: "냉미남냥", emoji: "🧊", tagline: "완벽주의, 날카로운 눈빛", sections: { diagnosis: "감정을 드러내지 않고 완벽을 추구하는 타입.", ohaengMap: "금(金)의 정돈된 기운이 완벽한 시스템을 추구합니다.", mbtiEngine: "INTJ/ISTJ의 사고와 직관/감각이 '시스템 설계자'를 만듭니다.", combination: "금의 정돈 + NT의 전략 = '완벽을 추구하는 설계자'.", love: "마음을 여는 데 시간이 걸립니다.", money: "체계적인 재무관리를 합니다.", career: "품질관리, 시스템 설계, 회계, 감사직에 적합합니다.", health: "완벽주의 스트레스가 가장 큰 문제입니다.", relationship: "믿을 수 있는 소수의 사람만 곁에 둡니다.", mission7: ["완벽하지 않아도 'OK'라고 말하기", "실수 적고 넘기기", "칭찬 1회 하기", "계획에서 1개 빼고 진행하기", "30분 일찍 자기", "감정 표현 말하기", "목표 70%만 달성핳기"] } },
  "NT_水": { id: "NT_水", name: "음모냥", emoji: "🌑", tagline: "다 알고 있지만 말 안 함", sections: { diagnosis: "모든 것을 관찰하고 분석하지만 속내를 드러내지 않는 타입.", ohaengMap: "수(水)의 깊이와 NT의 통찰이 '보이지 않는 것을 보는 자'를 만듭니다.", mbtiEngine: "INTJ/INTP의 직관과 사고가 '전략가'를 만듭니다.", combination: "수의 깊이 + NT의 전략 = '그림자 속의 지배자'.", love: "상대를 오래 관찰하고 분석합니다.", money: "보수적이지만 장기적으로 수익을 내는 투자를 선호합니다.", career: "전략기획, 컨설팅, 정보관리에 적합합니다.", health: "스트레스를 혼자 삭이는 경향이 있습니다.", relationship: "친해지기 어렵지만 한번 친해지면 평생 갑니다.", mission7: ["속내를 표현하기", "고민 털어놓기", "명상으로 생각 정리하기", "새로운 사람과 대화하기", "30분 일찍 자기", "긍정적 문장 적기", "감사 표현하기"] } }
};

// 나머지 15종은 별도로 추가 예정
// NF, ST, SF 그룹

export const CAT_CONTENTS: { [key: string]: CatContent } = {
  ...NT_CATS
};

export const CAT_IDS = [
  "NT_木", "NT_火", "NT_土", "NT_金", "NT_水",
  "NF_木", "NF_火", "NF_土", "NF_金", "NF_水",
  "ST_木", "ST_火", "ST_土", "ST_金", "ST_水",
  "SF_木", "SF_火", "SF_土", "SF_金", "SF_水"
];
