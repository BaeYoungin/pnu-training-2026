/**
 * 구글 시트 CSV 데이터 실시간 로딩 및 정규화 모듈
 */

const TrainingAPI = {
  /**
   * 구글 시트 또는 로컬 CSV에서 연수 데이터를 실시간 파싱하여 반환합니다.
   * @returns {Promise<{data: Array, isFallback: boolean, message: string}>}
   */
  async fetchTrainings() {
    let csvText = '';
    let isFallback = false;
    let message = '구글 시트 실시간 연동 성공';

    // 1. 구글 시트 gviz CSV 호출 (캐시 방지 타임스탬프 추가)
    try {
      const sheetUrlWithTimestamp = `${CONFIG.SHEET_URL}&_t=${Date.now()}`;
      const response = await fetch(sheetUrlWithTimestamp, {
        cache: 'no-cache',
        headers: { 'Pragma': 'no-cache' }
      });

      if (!response.ok) {
        throw new Error(`HTTP 에러: ${response.status}`);
      }

      const text = await response.text();
      
      // 구글 로그인 페이지(HTML)로 리다이렉트된 경우 예외 처리
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html') || text.includes('ServiceLogin')) {
        throw new Error('구글 시트 로그인 필요 또는 권한 문제');
      }

      csvText = text;
    } catch (err) {
      console.warn('구글 시트 실시간 로드 실패, 로컬 백업(raw_data.csv)으로 대체합니다:', err.message);
      isFallback = true;
      message = `백업 데이터 표시 중 (${err.message})`;
      
      // 로컬 백업 CSV 로드
      try {
        const fallbackRes = await fetch(`${CONFIG.FALLBACK_CSV}?_t=${Date.now()}`);
        if (!fallbackRes.ok) throw new Error('백업 CSV 파일을 읽을 수 없습니다.');
        csvText = await fallbackRes.text();
      } catch (backupErr) {
        console.error('백업 데이터 로드 실패:', backupErr);
        throw new Error('연수 데이터를 불러오는 데 실패했습니다.');
      }
    }

    // 2. PapaParse를 이용한 CSV 파싱 (쉼표, 따옴표, 줄바꿈 완전 지원)
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.replace(/[\ufeff"]/g, '').trim()
    });

    if (parseResult.errors && parseResult.errors.length > 0) {
      console.warn('CSV 파싱 정보:', parseResult.errors);
    }

    // 3. 데이터 정규화 (부산대 직무연수 시트 컬럼 규격)
    const normalizedData = parseResult.data.map((row, index) => {
      return this._normalizeRow(row, index + 1);
    }).filter(item => item.title && item.title.trim() !== '');

    return {
      data: normalizedData,
      isFallback,
      message
    };
  },

  /**
   * 구글 시트 컬럼을 사이트 표준 모델로 정규화
   */
  _normalizeRow(row, defaultId) {
    const getVal = (...keys) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
          return String(row[k]).trim();
        }
      }
      return '';
    };

    const id = getVal('과정코드', 'id', 'ID', '연수번호', '번호') || `PNU-2026-${String(defaultId).padStart(3, '0')}`;
    const title = getVal('과정명', '연수명', 'title', '제목');
    const category = getVal('분야', '카테고리', 'category', '구분') || '직무공통';
    const target = getVal('대상', '참여대상', 'target') || '전 직원';
    const requirement = getVal('이수구분', '구분', 'requirement') || '권장';
    const method = getVal('교육방식', '방식', 'method') || '집합';
    const hours = getVal('교육시간', '연수시간', 'hours', '시수') || '미정';
    const capacity = getVal('정원', '모집인원', 'capacity') || '제한없음';
    const period = getVal('교육기간', '연수기간', '일정', 'period') || '상시';
    const apply_period = getVal('신청기간', '접수기간', 'apply_period') || '상시';
    const department = getVal('담당부서', '주관부서', '부서', 'department') || '부산대학교 인재개발원';
    const summary = getVal('한줄소개', '요약', 'summary');
    const description = getVal('상세소개', '연수목적', '목적', 'description') || summary || '상세 교육 내용은 담당 부서로 문의 바랍니다.';
    const goals = getVal('학습목표', '목표', 'goals') || '';
    const curriculum = getVal('주요내용', '커리큘럼', '세부일정', 'curriculum') || '추후 공개 예정';
    const apply_url = getVal('신청링크', '신청URL', 'apply_url') || 'https://forms.google.com';
    const contact = getVal('문의', '문의처', '연락처', 'contact') || '인재개발원 051-510-1234';
    
    // 접수 상태 계산 (명시된 상태가 없을 경우 신청기간 기준 유추)
    let status = getVal('접수상태', '상태', 'status');
    if (!status) {
      if (apply_period === '상시' || apply_period.includes('상시')) {
        status = '접수중';
      } else {
        status = '접수중';
      }
    }

    return {
      id,
      title,
      category,
      target,
      requirement,
      method,
      hours,
      capacity,
      period,
      apply_period,
      department,
      summary: summary || title,
      description,
      goals,
      curriculum,
      apply_url,
      contact,
      location: method.includes('온라인') ? '스마트 LMS 온라인 교육' : (method.includes('혼합') ? '온·오프라인 병행' : '부산대학교 지정 강의실'),
      status
    };
  }
};
