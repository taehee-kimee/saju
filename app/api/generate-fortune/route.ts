import { NextRequest, NextResponse } from 'next/server';
import { SajuPayload, Ohaeng } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // Dynamically import OpenAI to avoid build-time initialization
    const { default: OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { saju, payload, mbti, ohaeng, catName, catTagline } = await req.json();

    if (!saju || !mbti || !ohaeng || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sajuPayload = payload as SajuPayload;

    const prompt = buildFortunePrompt(sajuPayload, mbti, ohaeng, catName, catTagline);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 한국 전통 사주명리학과 현대 심리학을 깊이 이해하는 전문 운세 작가입니다. 사용자의 사주 구성과 MBTI 성향을 정교하게 결합하여 개인화된 2026년 운세를 작성합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content generated');
    }

    const fortunes = JSON.parse(content);

    // Validate response structure
    const requiredKeys = ['love', 'money', 'career', 'health', 'relationship'];
    for (const key of requiredKeys) {
      if (!fortunes[key]) {
        throw new Error(`Missing required field: ${key}`);
      }
    }

    return NextResponse.json(fortunes);
  } catch (error) {
    console.error('Fortune generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate fortune' },
      { status: 500 }
    );
  }
}

function buildFortunePrompt(
  payload: SajuPayload,
  mbti: string,
  dominantOhaeng: Ohaeng,
  catName: string,
  catTagline: string
): string {
  const { pillars, dayMaster, fiveElementsCount, seasonFactor, balanceSummary, yearContext } = payload;

  // 일간 특성 설명
  const dayMasterTraits: Record<string, string> = {
    '甲': '큰 나무(甲木) - 리더십과 확장성, 끈기',
    '乙': '덩굴(乙木) - 유연성과 적응력, 섬세함',
    '丙': '태양(丙火) - 밝음과 따뜻함, 표현력',
    '丁': '등불(丁火) - 집중력과 열정, 깊이',
    '戊': '산(戊土) - 안정성과 포용력, 신뢰',
    '己': '밭(己土) - 융통성과 돌봄, 섬세함',
    '庚': '큰 칼(庚金) - 결단력과 정의감, 강함',
    '辛': '보석(辛金) - 정교함과 완성도, 세련됨',
    '壬': '큰 강(壬水) - 자유로움과 지혜, 유동성',
    '癸': '이슬(癸水) - 직관력과 침투성, 섬세함',
  };

  // 2026년 병오년과의 상호작용
  const annualStem = yearContext.annualPillar.stem;
  const annualBranch = yearContext.annualPillar.branch;
  
  return `【사용자 프로필】
- 캐릭터: ${catName} (${catTagline})
- MBTI: ${mbti}

【사주 상세 분석】

▶ 사주 팔자 (四柱八字)
- 연주(年柱): ${pillars.year.stem}${pillars.year.branch} - 태생적 기반과 가족 영향
- 월주(月柱): ${pillars.month.stem}${pillars.month.branch} - 성장 환경과 성격 형성 (${seasonFactor.notes})
- 일주(日柱): ${pillars.day.stem}${pillars.day.branch} - 본질적 성향과 배우자/자아
- 시주(時柱): ${pillars.hour ? `${pillars.hour.stem}${pillars.hour.branch}` : '미입력'} - 노후와 자식, 잠재력

▶ 일간(日間) 분석 - 당신의 핵심 에너지
- 일간: ${dayMaster} (${dayMasterTraits[dayMaster] || '특수한 기운'})
- 이는 당신의 근본 성격과 삶의 방향성을 결정합니다.

▶ 오행(五行) 구성 분석
- 목(木): ${fiveElementsCount['木']}개 - 성장, 확장, 계획성
- 화(火): ${fiveElementsCount['火']}개 - 열정, 표현, 추진력  
- 토(土): ${fiveElementsCount['土']}개 - 안정, 포용, 신뢰
- 금(金): ${fiveElementsCount['金']}개 - 완성, 정돈, 결단력
- 수(水): ${fiveElementsCount['水']}개 - 지혜, 유연성, 적응력

▶ 오행 균형 진단
- 강한 오행: ${balanceSummary.strong.join(', ') || '없음'} → 과하면 통제 필요
- 약한 오행: ${balanceSummary.weak.join(', ') || '없음'} → 보완과 균형 필요
- 특이사항: ${balanceSummary.remarks}

▶ 2026년 병오년(丙午) 대운 분석
- 2026년 기운: 병(丙火)오(午火) - 불(火)의 기운이 매우 강한 해
- 당신의 주요 오행 ${dominantOhaeng}과의 관계:
${getAnnualInteraction(dominantOhaeng, balanceSummary.weak, balanceSummary.strong)}

【운세 작성 요청】

위 사주 정보를 바탕으로 2026년 운세 5가지를 작성해주세요:

1. 연애 운세 (love): 200-250자
   - 일간 ${dayMaster}의 감정 표현 특성 + 2026년 화(火)의 기운이 연애에 미치는 영향
   - 구체적인 시기나 상황 제시
   - MBTI ${mbti} 성향과의 조화

2. 재물 운세 (money): 200-250자
   - 오행 균형(${balanceSummary.remarks})이 재물운에 미치는 영향
   - 2026년 투자/소비 전략
   - 강한 오행(${balanceSummary.strong.join(',')})을 활용한 수익 창출 방향

3. 커리어 운세 (career): 200-250자
   - 일간 ${dayMaster}의 직업 적성과 2026년 기회
   - 약한 오행(${balanceSummary.weak.join(',')})을 보완하는 직장 전략
   - MBTI ${mbti} 강점 활용법

4. 건강 운세 (health): 200-250자
   - 사주의 오행 불균형(${balanceSummary.remarks})이 건강에 미치는 영향
   - 2026년 주의할 신체 부위와 관리법
   - 계절별(${seasonFactor.notes}) 건강 관리 팁

5. 인간관계 운세 (relationship): 200-250자
   - 일간 ${dayMaster}의 대인관계 스타일
   - 2026년 인맥운과 주의할 점
   - 강한/약한 오행이 대인관계에 미치는 영향

【작성 규칙】
- 친근하고 따뜻한 톤 (~해요, ~죠)
- 사주 용어(일간, 오행, 사주)를 자연스럽게 녹여내기
- 구체적인 예시와 상황 제시
- 긍정적이지만 현실적인 조언
- 각 섹션마다 이모지 1-2개 적절히 사용
- 2026년이라는 시점 명시

【출력 형식 - 반드시 JSON으로】
{
  "love": "...",
  "money": "...",
  "career": "...",
  "health": "...",
  "relationship": "..."
}`;
}

function getAnnualInteraction(
  dominant: Ohaeng,
  weak: Ohaeng[],
  strong: Ohaeng[]
): string {
  const lines: string[] = [];
  
  // 2026년은 화(火)의 해
  lines.push('  - 2026년은 병오(丙午)로 불(火)의 기운이 최고조에 달하는 해입니다.');
  
  if (dominant === '火') {
    lines.push('  - 당신의 주요 오행이 화(火)이므로, 2026년은 에너지가 넘치지만 과열에 주의해야 합니다.');
  } else if (dominant === '水') {
    lines.push('  - 당신의 주요 오행 수(水)와 2026년 화(火)가 상극이므로, 변화와 도전이 많은 해가 될 수 있습니다.');
  } else if (dominant === '金') {
    lines.push('  - 당신의 금(金)은 2026년 화(火)에 의해 단련되어 완성도가 높아지는 해입니다.');
  } else if (dominant === '木') {
    lines.push('  - 당신의 목(木)은 2026년 화(火)로 생(生)되어 성장과 확장의 기운이 강해집니다.');
  } else if (dominant === '土') {
    lines.push('  - 당신의 토(土)는 2026년 화(火)로부터 생(生)받아 안정적인 기운을 얻습니다.');
  }
  
  if (weak.includes('水')) {
    lines.push('  - 수(水)가 약하므로 2026년 화(火)의 과열을 식힐 수 있는 전략이 필요합니다.');
  }
  
  if (strong.includes('火')) {
    lines.push('  - 화(火)가 이미 강하므로 2026년은 특히 에너지 관리가 중요합니다.');
  }
  
  return lines.join('\n');
}
