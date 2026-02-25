import { CatCharacter, MbtiGroup, Ohaeng, CatId } from '@/types';
import { CATS } from '@/data/cats';

/**
 * MBTI 그룹과 오행으로 CatId 생성
 */
export function getCatId(group: MbtiGroup, ohaeng: Ohaeng): CatId {
    return `${group}_${ohaeng}` as CatId;
}

/**
 * MBTI 그룹과 오행으로 CatCharacter 조회
 */
export function getCatCharacter(group: MbtiGroup, ohaeng: Ohaeng): CatCharacter {
    const id = getCatId(group, ohaeng);
    const cat = CATS[id];
    if (!cat) {
        throw new Error(`Cat not found: ${id}`);
    }
    return cat;
}
