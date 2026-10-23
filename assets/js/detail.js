/**
 * 2026 부산대학교 직무연수 포털 - 상세 페이지 로직
 */

document.addEventListener('DOMContentLoaded', () => {
  DetailApp.init();
});

const DetailApp = {
  training: null,
  allTrainings: [],

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
      this.renderNotFound('연수 과정코드(ID) 파라미터가 누락되었습니다.');
      return;
    }

    await this.loadCourseDetail(id);
  },

  async loadCourseDetail(id) {
    const container = document.getElementById('detail-content');
    this.renderLoading(container);

    try {
      const res = await TrainingAPI.fetchTrainings();
      this.allTrainings = res.data;

      // 과정코드(ID)로 연수 탐색
      const targetId = decodeURIComponent(id).trim();
      const found = res.data.find(item => item.id.toLowerCase() === targetId.toLowerCase()) || 
                    res.data.find(item => item.title.includes(targetId)) ||
                    res.data[parseInt(targetId) - 1];

      if (!found) {
        this.renderNotFound(`과정코드 '${id}'에 해당하는 직무연수 정보를 찾을 수 없습니다.`);
        return;
      }

      this.training = found;
      this.renderDetail(found);
      this.renderRelatedCourses(found);
    } catch (err) {
      console.error('상세 정보 로드 실패:', err);
      this.renderError(container, err.message);
    }
  },

  renderDetail(item) {
    // 브라우저 탭 타이틀 업데이트
    document.title = `${item.title} - 2026 부산대학교 직무연수`;

    // Breadcrumb 과정명 설정
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    if (breadcrumbTitle) breadcrumbTitle.textContent = item.title;

    const container = document.getElementById('detail-content');
    if (!container) return;

    // 이수구분 뱃지
    let reqBadge = '';
    if (item.requirement === '필수') {
      reqBadge = '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">필수이수</span>';
    } else if (item.requirement === '권장') {
      reqBadge = '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">권장과정</span>';
    } else {
      reqBadge = '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">선택과정</span>';
    }

    // 커리큘럼(주요내용) 분할 처리 (· 또는 / 또는 줄바꿈 기준)
    const curriculumItems = item.curriculum
      ? item.curriculum.split(/[·\/\n\r]+/).map(s => s.trim()).filter(Boolean)
      : ['상세 커리큘럼은 담당 부서로 문의 바랍니다.'];

    // 학습목표 분할 처리
    const goalItems = item.goals
      ? item.goals.split(/[·\/\n\r]+/).map(s => s.trim()).filter(Boolean)
      : [];

    container.innerHTML = `
      <!-- 1. 헤더 카드 (Hero) -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 mb-8 shadow-sm relative overflow-hidden">
        <div class="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-blue-50 -z-0 opacity-70 pointer-events-none"></div>
        
        <div class="relative z-10">
          <div class="flex flex-wrap items-center gap-2.5 mb-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pnu-navy text-white">
              ${item.category}
            </span>
            <span class="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              ${item.id}
            </span>
            ${reqBadge}
            <span class="text-xs text-slate-500 font-medium ml-auto flex items-center">
              <svg class="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              주관: ${item.department}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            ${item.title}
          </h1>

          <p class="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl font-medium">
            ${item.summary}
          </p>
        </div>
      </div>

      <!-- 2. 핵심 요약 스펙 그리드 (6분할 카드) -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div class="flex items-center text-xs font-semibold text-slate-500 mb-1.5">
            <svg class="w-4 h-4 text-pnu-blue mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            교육 기간
          </div>
          <div class="text-sm sm:text-base font-bold text-slate-900">${item.period}</div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div class="flex items-center text-xs font-semibold text-slate-500 mb-1.5">
            <svg class="w-4 h-4 text-pnu-blue mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            교육 시간 및 방식
          </div>
          <div class="text-sm sm:text-base font-bold text-slate-900">${item.hours} <span class="text-xs font-normal text-slate-500">(${item.method})</span></div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div class="flex items-center text-xs font-semibold text-slate-500 mb-1.5">
            <svg class="w-4 h-4 text-pnu-blue mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            참여 대상
          </div>
          <div class="text-sm sm:text-base font-bold text-slate-900 truncate" title="${item.target}">${item.target}</div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div class="flex items-center text-xs font-semibold text-slate-500 mb-1.5">
            <svg class="w-4 h-4 text-pnu-blue mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            모집 정원
          </div>
          <div class="text-sm sm:text-base font-bold text-slate-900">${item.capacity}</div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div class="flex items-center text-xs font-semibold text-slate-500 mb-1.5">
            <svg class="w-4 h-4 text-pnu-blue mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            신청 기간
          </div>
          <div class="text-sm sm:text-base font-bold text-slate-900 truncate" title="${item.apply_period}">${item.apply_period}</div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div class="flex items-center text-xs font-semibold text-slate-500 mb-1.5">
            <svg class="w-4 h-4 text-pnu-blue mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            교육 장소
          </div>
          <div class="text-sm sm:text-base font-bold text-slate-900 truncate" title="${item.location}">${item.location}</div>
        </div>
      </div>

      <!-- 3. 상세 교육 내용 및 커리큘럼 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- 커리큘럼 및 목표 (2열) -->
        <div class="lg:col-span-2 space-y-8">
          <!-- 상세 소개 -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <svg class="w-5 h-5 text-pnu-navy mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              과정 상세 소개
            </h2>
            <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              ${item.description}
            </p>
          </div>

          <!-- 주요 학습 내용 / 커리큘럼 -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <svg class="w-5 h-5 text-pnu-navy mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              주요 학습 내용 및 커리큘럼
            </h2>

            <div class="space-y-3">
              ${curriculumItems.map((curr, idx) => `
                <div class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition">
                  <span class="flex-shrink-0 w-7 h-7 rounded-lg bg-pnu-navy text-white text-xs font-bold flex items-center justify-center mt-0.5 shadow-xs">
                    ${idx + 1}
                  </span>
                  <div class="text-sm font-semibold text-slate-800 leading-snug">
                    ${curr}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- 학습 목표가 있는 경우 표시 -->
            ${goalItems.length > 0 ? `
              <div class="mt-6 pt-6 border-t border-slate-100">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">학습 기대 목표</h3>
                <ul class="space-y-2">
                  ${goalItems.map(goal => `
                    <li class="flex items-start text-xs text-slate-600">
                      <svg class="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>${goal}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <!-- 이수 유의사항 -->
          <div class="p-5 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-2">
            <div class="font-bold flex items-center text-pnu-blue">
              <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              직무연수 이수 안내
            </div>
            <ul class="list-disc list-inside text-blue-800 space-y-1">
              <li>연수 시간의 80% 이상 출석 및 강의 평가 완료 시 직무연수 이수 처리됩니다.</li>
              <li>온라인 강좌는 스마트 LMS 플랫폼을 통해 지정 기간 내에 수강 완료해야 합니다.</li>
            </ul>
          </div>
        </div>

        <!-- 문의처 및 운영 정보 (1열) -->
        <div class="space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
            <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center">
              <svg class="w-4 h-4 text-pnu-blue mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              주관 부서 및 문의처
            </h3>
            
            <dl class="space-y-3.5 text-xs">
              <div>
                <dt class="text-slate-400 font-medium mb-0.5">주관 부서</dt>
                <dd class="text-slate-800 font-bold text-sm">${item.department}</dd>
              </div>
              <div>
                <dt class="text-slate-400 font-medium mb-0.5">문의처 / 전화번호</dt>
                <dd class="text-slate-800 font-bold text-sm">
                  ${item.contact}
                </dd>
              </div>
              <div>
                <dt class="text-slate-400 font-medium mb-0.5">이메일 문의</dt>
                <dd class="text-slate-800 font-bold text-sm">training@pusan.ac.kr</dd>
              </div>
            </dl>
          </div>

          <!-- 액션 CTA 카드 -->
          <div class="bg-gradient-to-br from-pnu-navy to-pnu-blue rounded-3xl p-6 sm:p-7 text-white shadow-md">
            <h4 class="text-base font-bold mb-2">연수 온라인 신청</h4>
            <p class="text-xs text-blue-100 mb-5 leading-relaxed">
              신청 기간을 확인하신 후 바로 신청서를 제출해 주세요.
            </p>
            
            <a href="${item.apply_url}" target="_blank" rel="noopener noreferrer"
               class="w-full flex items-center justify-center py-3.5 px-4 bg-white text-pnu-navy hover:bg-blue-50 rounded-xl text-sm font-extrabold transition shadow-sm mb-3">
              연수 신청 바로가기
              <svg class="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <button onclick="DetailApp.copyShareUrl()" 
                    class="w-full flex items-center justify-center py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition border border-white/20">
              <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              연수 링크 복사
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderRelatedCourses(current) {
    const container = document.getElementById('related-courses-section');
    if (!container) return;

    // 동일 카테고리 또는 다른 연수 3개 선별
    let related = this.allTrainings.filter(item => item.id !== current.id && item.category === current.category);
    if (related.length < 3) {
      const others = this.allTrainings.filter(item => item.id !== current.id && item.category !== current.category);
      related = [...related, ...others].slice(0, 3);
    } else {
      related = related.slice(0, 3);
    }

    if (related.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="border-t border-slate-200 pt-10">
        <h3 class="text-xl font-bold text-slate-900 mb-6">다른 직무연수 과정</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${related.map(item => `
            <div class="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                    ${item.category}
                  </span>
                  <span class="text-[11px] font-mono text-slate-400">${item.id}</span>
                </div>
                <h4 class="text-sm font-bold text-slate-900 line-clamp-2 mb-2">
                  <a href="detail.html?id=${encodeURIComponent(item.id)}" class="hover:text-pnu-navy">
                    ${item.title}
                  </a>
                </h4>
                <p class="text-xs text-slate-500 line-clamp-2 mb-4">${item.summary || item.description}</p>
              </div>
              <div class="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>${item.hours} (${item.method})</span>
                <a href="detail.html?id=${encodeURIComponent(item.id)}" class="font-bold text-pnu-blue hover:underline">
                  상세보기 &rarr;
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  copyShareUrl() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.showToast('연수 링크가 클립보드에 복사되었습니다.');
    }).catch(() => {
      prompt('링크를 복사하세요:', window.location.href);
    });
  },

  showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg z-50 transition-opacity duration-300 pointer-events-none opacity-0';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');

    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0');
    }, 2500);
  },

  renderLoading(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 p-8 mb-8">
        <div class="w-24 h-6 rounded-full skeleton-shimmer mb-4"></div>
        <div class="w-3/4 h-8 rounded skeleton-shimmer mb-3"></div>
        <div class="w-1/2 h-4 rounded skeleton-shimmer mb-6"></div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
          <div class="h-20 rounded-2xl skeleton-shimmer"></div>
          <div class="h-20 rounded-2xl skeleton-shimmer"></div>
          <div class="h-20 rounded-2xl skeleton-shimmer"></div>
        </div>
      </div>
    `;
  },

  renderNotFound(msg) {
    const container = document.getElementById('detail-content');
    if (!container) return;

    container.innerHTML = `
      <div class="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <svg class="mx-auto h-16 w-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-xl font-bold text-slate-800 mb-2">연수 정보를 찾을 수 없습니다</h2>
        <p class="text-xs text-slate-500 mb-6">${msg}</p>
        <a href="index.html" class="inline-flex items-center px-5 py-2.5 bg-pnu-navy text-white text-xs font-bold rounded-xl hover:bg-pnu-blue transition shadow-sm">
          &larr; 직무연수 목록으로 돌아가기
        </a>
      </div>
    `;
  },

  renderError(container, errorMsg) {
    if (!container) return;
    container.innerHTML = `
      <div class="py-16 text-center bg-red-50 rounded-3xl border border-red-200 p-8">
        <p class="text-base font-bold text-red-800">상세 데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p class="text-xs text-red-600 mt-2 mb-6">${errorMsg}</p>
        <div class="flex justify-center gap-3">
          <button onclick="location.reload()" class="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition">
            다시 시도
          </button>
          <a href="index.html" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            목록으로 이동
          </a>
        </div>
      </div>
    `;
  }
};
