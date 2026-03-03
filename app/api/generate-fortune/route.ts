import { NextRequest, NextResponse } from 'next/server';
import { SajuPayload, Ohaeng } from '@/types';

type FortuneSection = 'love' | 'money' | 'career' | 'health' | 'relationship';

const SECTION_META: Record<FortuneSection, { label: string; instruction: string }> = {
  love:         { label: '연애',     instruction: '재성/관성 분포가 연애에 미치는 영향, 용신 활용 연애 전략, 합충형 영향, 대운·세운 타이밍, 구체적 행동 조언' },
  money:        { label: '재물',     instruction: '재성·식상 분포가 재물에 미치는 영향, 용신 활용 재물 전략, 합충형 영향, 좋은 달·주의할 달 연계, 투자/지출 조언' },
  career:       { label: '커리어',   instruction: '관성·인성 분포가 커리어에 미치는 영향, 용신 활용 커리어 전략, 대운 성향 변화와 커리어 방향, 직장/사업 구체 조언' },
  health:       { label: '건강',     instruction: '오행↔장기 매핑(木=간/담, 火=심장/소장, 土=비/위, 金=폐/대장, 水=신장/방광), 과다/과소 오행의 건강 리스크, 계절별 주의사항, 생활습관 조언' },
  relationship: { label: '인간관계', instruction: '비겁·식상 분포가 관계에 미치는 영향, 반복 패턴 원인과 관계 패턴 연결, 용신 활용 관계 전략, 가족/친구/직장 관계 조언' },
};

export async function POST(req: NextRequest) {
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { saju, payload, mbti, ohaeng, catName, catTagline, section } = await req.json();

    if (!saju || !mbti || !ohaeng || !payload || !section) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fortuneSection = section as FortuneSection;
    if (!SECTION_META[fortuneSection]) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    const sajuPayload = payload as SajuPayload;
    const prompt = buildSectionPrompt(sajuPayload, mbti, ohaeng, catName, catTagline, fortuneSection);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 "냥세(냥이 세계관)" 운세 앱의 운세 작가입니다. 사주명리학(지장간·십신·용신·합충형·대운)과 MBTI를 결합해 2026년 운세를 작성합니다.

【세계관 — 반드시 이해하세요】
사용자는 MBTI×오행 조합에 따라 고양이 캐릭터(냥)를 부여받습니다. 운세는 그 캐릭터의 시점에서, 사용자를 "우리 ○○냥" (캐릭터 이름 기반)으로 부르며 작성합니다. "집사"라는 호칭은 절대 사용하지 마세요.

【말투 규칙 — 반드시 따르세요】
- "~냥", "~다냥", "~거냥" 같은 고양이 어미를 문단 끝에 자연스럽게 섞기 (2~3문장마다 한 번)
- 기본 어미는 "~해요", "~죠", "~거예요"
- 사용자를 부를 때: "우리 ○○냥" 또는 "당신". "집사님" 절대 금지.
- 따뜻하고 장난스러운 톤, 진지한 분석도 친근하게 전달
- 이모지를 3~5개 자연스럽게 사용 (🐾🔮✨💕🌿🔥💰 등)
- 사주 용어는 괄호 안에 쉬운 설명 병기
- 일반론 금지 — 이 사람의 사주 데이터에서만 나올 수 있는 맞춤 해석`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content generated');

    const parsed = JSON.parse(content);
    if (!parsed[fortuneSection]) throw new Error(`Missing field: ${fortuneSection}`);

    return NextResponse.json({ [fortuneSection]: parsed[fortuneSection] });
  } catch (error) {
    console.error('Fortune generation error:', error);
    return NextResponse.json({ error: 'Failed to generate fortune' }, { status: 500 });
  }
}

const DAY_MASTER_TRAITS: Record<string, string> = {
  '甲': '큰 나무(甲木) — 리더십, 확장성, 끈기',
  '乙': '덩굴(乙木) — 유연성, 적응력, 섬세함',
  '丙': '태양(丙火) — 밝음, 따뜻함, 표현력',
  '丁': '등불(丁火) — 집중력, 열정, 깊이',
  '戊': '산(戊土) — 안정성, 포용력, 신뢰',
  '己': '밭(己土) — 융통성, 돌봄, 섬세함',
  '庚': '큰 칼(庚金) — 결단력, 정의감, 강함',
  '辛': '보석(辛金) — 정교함, 완성도, 세련됨',
  '壬': '큰 강(壬水) — 자유로움, 지혜, 유동성',
  '癸': '이슬(癸水) — 직관력, 침투성, 섬세함',
};

function buildSectionPrompt(
  payload: SajuPayload,
  mbti: string,
  dominantOhaeng: Ohaeng,
  catName: string,
  catTagline: string,
  section: FortuneSection,
): string {
  const {
    pillars, dayMaster, fiveElementsCount, seasonFactor, balanceSummary,
    hiddenStems, enrichedFiveElements, tenGodChart, dayMasterStrength,
    favorableElement, branchInteractions, decadeLuck, annualAnalysis,
    ohaengBehaviors, repeatPatterns, structureSummary, mbtiSajuSynergy,
  } = payload;

  const currentYear = 2026;
  const birthYearApprox = currentYear - 30;
  const currentDecade = decadeLuck.find(d => {
    const age = currentYear - birthYearApprox;
    return age >= d.startAge && age <= d.endAge;
  });
  const nextDecade = currentDecade
    ? decadeLuck.find(d => d.startAge === currentDecade.endAge + 1)
    : undefined;

  const meta = SECTION_META[section];

  return `【구조 요약 — 이 사람의 핵심 축】
- 성격축: ${structureSummary.personalityAxis}
- 에너지 긴장: ${structureSummary.energyTension}
- 핵심 갈등: ${structureSummary.mainConflict}
- 위험 지대: ${structureSummary.riskZone}

【사용자 프로필】
- 캐릭터: ${catName} ("${catTagline}")
- MBTI: ${mbti} | 주요 오행: ${dominantOhaeng}
- 일간: ${dayMaster} (${DAY_MASTER_TRAITS[dayMaster] || '특수한 기운'})
- 신강/신약: ${dayMasterStrength.isStrong ? '신강' : '신약'} (점수: ${dayMasterStrength.score})

【사주 팔자 + 지장간】
- 연주: ${pillars.year.stem}${pillars.year.branch} (지장간: ${hiddenStems.year.join(',')})
- 월주: ${pillars.month.stem}${pillars.month.branch} (지장간: ${hiddenStems.month.join(',')}) — ${seasonFactor.notes}
- 일주: ${pillars.day.stem}${pillars.day.branch} (지장간: ${hiddenStems.day.join(',')})
- 시주: ${pillars.hour ? `${pillars.hour.stem}${pillars.hour.branch} (지장간: ${hiddenStems.hour.join(',')})` : '미입력'}

【오행 구성 (지장간 가중치 포함)】
- 木:${enrichedFiveElements['木']} 火:${enrichedFiveElements['火']} 土:${enrichedFiveElements['土']} 金:${enrichedFiveElements['金']} 水:${enrichedFiveElements['水']}
- 균형: ${balanceSummary.remarks}
- 기본 8자: 木${fiveElementsCount['木']} 火${fiveElementsCount['火']} 土${fiveElementsCount['土']} 金${fiveElementsCount['金']} 水${fiveElementsCount['水']}

【오행 행동 패턴】
${ohaengBehaviors.map(b => `- ${b.element} ${b.type === 'excess' ? '과다' : '과소'}: ${b.behavior}`).join('\n') || '- 특별한 과다/과소 없음'}

【십신(十神) 배치】
- 연간: ${tenGodChart.yearStem} | 월간: ${tenGodChart.monthStem} | 시간: ${tenGodChart.hourStem ?? '미입력'}
- 지지 본기 — 연:${tenGodChart.yearBranchMain} 월:${tenGodChart.monthBranchMain} 일:${tenGodChart.dayBranchMain}${tenGodChart.hourBranchMain ? ` 시:${tenGodChart.hourBranchMain}` : ''}
- 그룹: 비겁${tenGodChart.groupSummary['비겁']} 식상${tenGodChart.groupSummary['식상']} 재성${tenGodChart.groupSummary['재성']} 관성${tenGodChart.groupSummary['관성']} 인성${tenGodChart.groupSummary['인성']}
- ★ 우세: ${tenGodChart.dominantGroups.map(d => `${d.group}(${d.count}개) → ${d.behavior}`).join(' / ')}

【신강/신약 판정】
${dayMasterStrength.analysis}
- 계절 지지: ${dayMasterStrength.seasonSupport} | 도움: ${dayMasterStrength.helpingElements.join(',')} | 방해: ${dayMasterStrength.hinderingElements.join(',')}

【용신(用神)】
- 용신: ${favorableElement.yongsin} | 희신: ${favorableElement.secondary} | 기신: ${favorableElement.unfavorable}
- 이유: ${favorableElement.reasoning}

【MBTI × 사주 결합】
시너지: ${mbtiSajuSynergy.synergies.join(' / ') || '없음'}
리스크: ${mbtiSajuSynergy.risks.join(' / ') || '없음'}

【합충형】
${branchInteractions.interactions.map(i => `- [${i.type}] ${i.description}`).join('\n') || '- 없음'}

【반복 패턴 원인】
${repeatPatterns.map(p => `- ${p.condition} → "${p.pattern}"`).join('\n') || '- 없음'}

${decadeLuck.length > 0 ? `【대운 흐름】
- 현재: ${currentDecade?.description ?? '정보 없음'}
- 다음: ${nextDecade?.description ?? ''}` : ''}

【2026년 丙午 세운】
- 세운 십신: ${annualAnalysis.annualTenGod} — ${annualAnalysis.overallTheme}
${annualAnalysis.pillarInteractions.map(pi => `- ${pi.pillarName}: ${pi.significance}`).join('\n')}
- 좋은 달: ${annualAnalysis.favorableMonths.join(', ') || '없음'} | 주의 달: ${annualAnalysis.cautionMonths.join(', ') || '없음'}

═══════════════════════════════════════

【작성 요청 — ${meta.label} 운세 1개 섹션만】

위 데이터를 근거로 2026년 【${meta.label}】 운세를 작성하세요.
포함할 내용: ${meta.instruction}

작성 규칙:
- ${catName} 캐릭터가 사용자에게 이야기하는 톤 유지
- "~냥", "~다냥" 어미를 2~3문장마다 한 번씩 자연스럽게 섞기
- 사용자 호칭: "우리 ${catName}냥". "집사" 절대 금지.
- 이모지 3~5개 (🐾🔮✨💕🌿🔥💰🎯 등)
- 사주 용어는 괄호 안에 쉬운 설명 병기
- 문단은 \\n\\n으로 구분, 한 문단 3~5문장
- 총 4~6개 문단 (300자 이상)
- 일반론 금지 — 이 사람의 사주 데이터에서만 나올 수 있는 해석

【출력 형식 — 반드시 JSON】
{ "${section}": "문단1\\n\\n문단2\\n\\n문단3 ..." }`;
}
