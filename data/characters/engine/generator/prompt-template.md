[입력 데이터]
mbti_engine:
{MBTI_YAML}

ohaeng_engine:
{OHAENG_YAML}

conflict_map:
{CONFLICT_MAP_YAML}

collapse_loop:
{COLLAPSE_LOOP_YAML}

meta:
id: {MBTI}_{OHAENG_KR}
name: {NAME}
emoji: {EMOJI}
mbti: {MBTI}
ohaeng: {OHAENG_KR}

[생성 요청]
위 입력 데이터를 기반으로, "냥세(猫世)" 무료 리포트 Markdown 1개를 생성하라.

반드시 다음을 지켜라:
- 말투: '냥세' 서비스 컨셉에 맞춰 친근하고 다정한 고양이 집사 말투를 유지하라. (예: "~해요", "~냥!", "~일지도 몰라요")
- 소제목: 각 섹션의 원래 이름(diagnosis 등) 대신, 해당 내용을 요약하는 매력적인 '질문 형식'의 소제목을 이모지와 함께 사용하라.
- 출력 섹션 순서 고정: diagnosis → ohaengMap → combination → pattern → timingSense 내용을 순서대로 배치하라.
- 분량: 각 섹션당 충분한 설명(섹션별 800~1000자 내외)을 포함하여 전체적으로 풍성한 리포트를 작성하라.
- diagnosis 내용: 기능 스택과 4기능 질문(세상 인식/판단/불안정/스트레스)을 포함
- ohaengMap 내용: 에너지 이동/가속 조건/붕괴 조건/반복 루프를 포함
- combination 내용: 갈등 이동(conflict_map)과 붕괴 루프(collapse_loop)의 단계화를 포함
- pattern 내용: 행동 흐름(→)과 관계 패턴, 자기 의심 문장 1개 포함
- timingSense 내용: 과부하 신호 3개 이상 + 조절 전략(예언 금지)

금지:
- 운세 예측/연도 언급/단정적 표현/불안 조장/키워드 반복/기능 설명 복붙

[출력]
아래 형식으로만 출력하라:

---
id: ...
name: ...
emoji: ...
mbti: ...
ohaeng: ...
---

# {EMOJI} {NAME} – {MBTI} × {OHAENG_KR}

## 🐾 [Diagnosis 관련 질문형 소제목]
...

## 🧭 [OhaengMap 관련 질문형 소제목]
...

## 🧩 [Combination 관련 질문형 소제목]
...

## 🔄 [Pattern 관련 질문형 소제목]
...

## 🚨 [TimingSense 관련 질문형 소제목]
...