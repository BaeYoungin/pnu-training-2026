# 2026 부산대학교 직무연수 안내 포털 (PNU Job Training Portal 2026)

2026년도 국립부산대학교 교직원 및 연구원을 위한 맞춤형 직무연수 안내 포털입니다.  
구글 스프레드시트와 실시간 연동되어 연수 프로그램 정보가 실시간으로 자동 동기화되며, GitHub Pages를 통해 배포되었습니다.

## 🔗 사이트 바로가기
- **배포 URL**: [https://baeyoungin.github.io/pnu-training-2026/](https://baeyoungin.github.io/pnu-training-2026/)
- **GitHub 저장소**: [https://github.com/BaeYoungin/pnu-training-2026](https://github.com/BaeYoungin/pnu-training-2026)

---

## 🌟 주요 기능 및 특징

1. **구글 스프레드시트 실시간 동기화 (Google Sheets gviz API + PapaParse)**
   - 관리자가 구글 시트의 내용을 수정하면 웹사이트 새로고침 시 실시간 반영
   - 브라우저 캐시 무효화 쿼리(`&_t=${Date.now()}`) 및 `cache: 'no-cache'` 탑재
   - 네트워크/접근 예외 발생 시 오프라인 백업 데이터셋(`raw_data.csv`)으로 무중단 동작 보장

2. **메인 페이지 (`index.html`)**
   - **히어로 섹션**: 2026년도 직무연수 개요 및 실시간 지표(총 개설과정, 필수/접수과정, 개설분야) 카운터
   - **통합 검색 & 다중 필터**:
     - 실시간 디바운스 키워드 검색 (연수명, 교육내용, 담당부서, 장소)
     - 분야별(카테고리) 칩 원클릭 필터링 (법정의무교육, 직무공통, 예산·회계, 정보화·AI 등)
     - 참여 대상, 교육 방식, 이수구분(필수/권장/선택)별 정밀 드롭다운 필터
     - 이수시간순 / 가나다순 정렬 및 필터 초기화
   - **연수 카드 그리드**: 이수구분 뱃지, 일정, 시수, 교육방식, 대상, 담당부서 표기 및 상세 페이지 링크

3. **상세 페이지 (`detail.html`)**
   - URL 파라미터(`?id=PNU-2026-001`) 기반의 경량 SPA 라우팅
   - 공식 과정명, 주관부서, 핵심 요강 6분할 스펙 카드 (일정, 시수/방식, 대상, 정원, 신청기간, 장소)
   - 과정 상세 소개 및 차시별 커리큘럼 타임라인 시각화
   - 연수 온라인 신청 바로가기 및 링크 복사(토스트 알림) 기능
   - 하단 동일 분야/유사 연수 추천 큐레이션

4. **UI/UX 디자인 (`frontend-design` 가이드 준수)**
   - 부산대학교 공식 브랜드 시그니처 네이비 Blue (`#003B71`) 및 Royal Blue (`#005BAC`) 적용
   - 프리미엄 한글 타이포그래피 (Pretendard) 및 Tailwind CSS 반응형 레이아웃
   - 부드러운 호버 리프트업 효과, 스켈레톤 로딩 애니메이션

---

## 📁 디렉토리 구조
```text
├── index.html               # 메인 페이지 (목록, 검색, 필터링)
├── detail.html              # 상세 페이지 (과정별 상세 요강, 커리큘럼)
├── raw_data.csv             # 구글 시트 오프라인 백업 데이터
├── project_plan.md          # 최초 작업 기획서
├── README.md                # 프로젝트 안내 문서
└── assets/
    ├── css/
    │   └── style.css        # PNU 테마 및 마이크로 애니메이션
    └── js/
        ├── config.js        # 시트 URL 및 시스템 상수
        ├── api.js           # PapaParse 기반 실시간 CSV 로더
        ├── main.js          # 메인 페이지 렌더링 및 필터링 로직
        └── detail.js        # 상세 페이지 라우팅 및 렌더링 로직
```

---
&copy; 2026 Pusan National University. All rights reserved.
