// catContents: characters 데이터를 legacy catId 형식으로도 접근 가능하게 export
// result 페이지와 report 페이지에서 사용

import { ALL_CHARACTERS } from './characters';
import { CATS } from './cats';

// 80개 캐릭터 (MBTI_오행 형식 - 새 시스템)
// + 20개 레거시 캐릭터 (MbtiGroup_오행 형식 - 기존 시스템)
// 둘 다 접근 가능하도록 합침
export const CAT_CONTENTS: Record<string, any> = {
    ...ALL_CHARACTERS,
    ...CATS,
};
