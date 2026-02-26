import { CatCharacter, CatId, MbtiGroup, Ohaeng } from '@/types';
import { CAT_CONTENTS } from '@/data/catContents';

const CAT_DATA: Record<CatId, { name: string; emoji: string; tagline: string }> = {
  'NT_木': { name: '탐정냥', emoji: '🔍', tagline: '모든 걸 분석하고 혼자 결론 냄' },
  'NT_火': { name: '보스냥', emoji: '😤', tagline: '말 없이 모든 걸 장악' },
  'NT_土': { name: '철학냥', emoji: '🤔', tagline: '혼자 깊은 생각에 잠김' },
  'NT_金': { name: '냉미냥', emoji: '🧊', tagline: '완벽주의, 날카로운 눈빛' },
  'NT_水': { name: '음모냥', emoji: '🌑', tagline: '다 알고 있지만 말 안 함' },
  'NF_木': { name: '새벽냥', emoji: '🌙', tagline: '새벽에 혼자 울고 일기 씀' },
  'NF_火': { name: '열정냥', emoji: '🌟', tagline: '꿈 얘기 3시간 가능' },
  'NF_土': { name: '공감냥', emoji: '🫂', tagline: '네 말 다 들어줄게' },
  'NF_金': { name: '순백냥', emoji: '🤍', tagline: '너무 순수해서 세상이 버거움' },
  'NF_水': { name: '신비냥', emoji: '🔮', tagline: '말은 없는데 분위기 압도' },
  'ST_木': { name: '믿음냥', emoji: '📋', tagline: '할 일 다 하고 잠 자는 타입' },
  'ST_火': { name: '돌격냥', emoji: '💥', tagline: '생각보다 행동이 먼저' },
  'ST_土': { name: '든든냥', emoji: '🏠', tagline: '묵묵히 다 해주는 맏이 기질' },
  'ST_金': { name: '완벽냥', emoji: '✨', tagline: '틀린 거 못 참음, 다시 해' },
  'ST_水': { name: '침착냥', emoji: '🧘', tagline: '패닉에도 표정 변화 없음' },
  'SF_木': { name: '따뜻냥', emoji: '🌳', tagline: '포근한 위로로 주변을 감쌈' },
  'SF_火': { name: '인싸냥', emoji: '🎉', tagline: '모임의 중심, 에너지 뿜뿜' },
  'SF_土': { name: '집사냥', emoji: '🏠', tagline: '헌신적 돌봄의 대명사' },
  'SF_金': { name: '섬세냥', emoji: '🎀', tagline: '디테일 장인, 작은 것도 놓치지 않아' },
  'SF_水': { name: '치유냥', emoji: '💙', tagline: '마음의 상처를 어루만지는 타입' },
};

export function getCatCharacter(group: MbtiGroup, ohaeng: Ohaeng): CatCharacter {
  const catId = `${group}_${ohaeng}` as CatId;
  const data = CAT_DATA[catId];
  const content = CAT_CONTENTS[catId];

  return {
    id: catId,
    name: data?.name ?? catId,
    emoji: data?.emoji ?? '🐱',
    appearance: '',
    tagline: data?.tagline ?? '',
    shortDesc: content?.sections?.diagnosis ?? '',
    fullDesc: content?.sections?.combination ?? '',
    yearFortune: content?.sections?.love ?? '',
    monthFortune: {},
  };
}
