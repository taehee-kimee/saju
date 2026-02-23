import { CATS } from '@/data/cats';
import { CatCharacter, CatId, MbtiGroup, Ohaeng } from '@/types';

export function getCatId(mbtiGroup: MbtiGroup, ohaeng: Ohaeng): CatId {
  return `${mbtiGroup}_${ohaeng}` as CatId;
}

export function getCatCharacter(mbtiGroup: MbtiGroup, ohaeng: Ohaeng): CatCharacter {
  const id = getCatId(mbtiGroup, ohaeng);
  return CATS[id];
}
