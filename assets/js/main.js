/**
 * 2026 부산대학교 직무연수 포털 - 메인 페이지 로직
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  state: {
    trainings: [],
    filtered: [],
    categories: ['전체'],
    targets: ['전체'],
    filter: {
      keyword: '',
      category: '전체',
      target: '전체',
      method: '전체',
      status: '전체',
      sort: 'default'
    },
    isFallback: false
  },

  async init() {
    this.bindEvents();
    await this.loadData();
  },

  bindEvents() {
    // 키워드 검색 (실시간 디바운스)
    const searchInput = document.getElementById('search-input');
    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.state.filter.keyword = e.target.value.trim().toLowerCase();
          this.applyFilters();
        }, 150);
      });
    }

    // 대상 필터
    const targetSelect = document.getElementById('filter-target');
    if (targetSelect) {
      targetSelect.addEventListener('change', (e) => {
        this.state.filter.target = e.target.value;
        this.applyFilters();
      });
    }

    // 교육방식 필터
    const methodSelect = document.getElementById('filter-method');
    if (methodSelect) {
      methodSelect.addEventListener('change', (e) => {
        this.state.filter.method = e.target.value;
        this.applyFilters();
      });
    }

    // 상태/이수구분 필터
    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.state.filter.status = e.target.value;
        this.applyFilters();
      });
    }

    // 정렬
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.state.filter.sort = e.target.value;
        this.applyFilters();
      });
    }

    // 필터 초기화 버튼
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }
  },

  async loadData() {
    const listContainer = document.getElementById('training-grid');
    this.renderLoading(listContainer);

    try {
      const res = await TrainingAPI.fetchTrainings();
      this.state.trainings = res.data;
      this.state.isFallback = res.isFallback;

      this.renderDataSourceStatus(res);
      this.setupCategoryChips();
      this.setupTargetDropdown();
      this.updateStats();
      this.applyFilters();
    } catch (err) {
      console.error('데이터 로딩 오류:', err);
      this.renderError(listContainer, err.message);
    }
  },

  renderDataSourceStatus(res) {
    const statusBanner = document.getElementById('data-status-banner');
    if (!statusBanner) return;

    if (res.isFallback) {
      statusBanner.className = 'bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg shadow-sm flex items-center justify-between flex-wrap gap-2';
      statusBanner.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <div class="text-sm text-amber-800">
            <span class="font-semibold">오프라인 백업 데이터 표시 중:</span> 구글 시트 연결을 재시도하려면 새로고침하세요.
          </div>
        </div>
        <button onclick="location.reload()" class="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded transition">
          새로고침
        </button>
      `;
      statusBanner.classList.remove('hidden');
    } else {
      statusBanner.className = 'bg-emerald-50 border-l-4 border-emerald-500 p-3.5 mb-6 rounded-r-lg shadow-sm flex items-center justify-between text-xs text-emerald-800';
      statusBanner.innerHTML = `
        <div class="flex items-center space-x-2.5">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span><strong>구글 스프레드시트 실시간 동기화 완료:</strong> 시트에서 값을 수정하고 새로고침하면 본 페이지에 즉시 반영됩니다.</span>
        </div>
        <span class="text-emerald-700 font-mono text-[11px] bg-emerald-100 px-2 py-0.5 rounded">${new Date().toLocaleTimeString('ko-KR')} 연동됨</span>
      `;
      statusBanner.classList.remove('hidden');
    }
  },

  setupCategoryChips() {
    const chipContainer = document.getElementById('category-chips');
    if (!chipContainer) return;

    const uniqueCategories = ['전체', ...new Set(this.state.trainings.map(t => t.category).filter(Boolean))];
    this.state.categories = uniqueCategories;

    chipContainer.innerHTML = uniqueCategories.map(cat => `
      <button type="button" 
        data-category="${cat}"
        class="category-chip px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
          this.state.filter.category === cat 
            ? 'active' 
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }">
        ${cat}
      </button>
    `).join('');

    chipContainer.querySelectorAll('.category-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.getAttribute('data-category');
        this.state.filter.category = cat;
        
        chipContainer.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        this.applyFilters();
      });
    });
  },

  setupTargetDropdown() {
    const targetSelect = document.getElementById('filter-target');
    if (!targetSelect) return;

    const uniqueTargets = ['전체', ...new Set(this.state.trainings.map(t => t.target).filter(Boolean))];
    targetSelect.innerHTML = uniqueTargets.map(tgt => `
      <option value="${tgt}">${tgt === '전체' ? '대상 전체' : tgt}</option>
    `).join('');
  },

  updateStats() {
    const totalCountEl = document.getElementById('stat-total-count');
    const openCountEl = document.getElementById('stat-open-count');
    const categoryCountEl = document.getElementById('stat-category-count');

    if (totalCountEl) totalCountEl.textContent = `${this.state.trainings.length}개 과정`;
    if (openCountEl) {
      const openCount = this.state.trainings.filter(t => t.requirement === '필수' || t.status.includes('접수')).length;
      openCountEl.textContent = `${openCount}개`;
    }
    if (categoryCountEl) {
      const catCount = new Set(this.state.trainings.map(t => t.category)).size;
      categoryCountEl.textContent = `${catCount}개 분야`;
    }
  },

  applyFilters() {
    const { keyword, category, target, method, status, sort } = this.state.filter;

    let result = this.state.trainings.filter(item => {
      // 1. 키워드 검색
      if (keyword) {
        const text = `${item.id} ${item.title} ${item.summary} ${item.description} ${item.department} ${item.location}`.toLowerCase();
        if (!text.includes(keyword)) return false;
      }

      // 2. 카테고리 필터
      if (category !== '전체' && item.category !== category) {
        return false;
      }

      // 3. 대상 필터
      if (target !== '전체' && !item.target.includes(target) && !item.target.includes('전체') && item.target !== '전 직원') {
        return false;
      }

      // 4. 교육방식 필터
      if (method !== '전체' && !item.method.includes(method)) {
        return false;
      }

      // 5. 상태/이수구분 필터
      if (status !== '전체') {
        if (!item.status.includes(status) && item.requirement !== status) {
          return false;
        }
      }

      return true;
    });

    // 정렬 로직
    if (sort === 'hours-desc') {
      result.sort((a, b) => {
        const hA = parseInt(a.hours) || 0;
        const hB = parseInt(b.hours) || 0;
        return hB - hA;
      });
    } else if (sort === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    }

    this.state.filtered = result;
    this.renderCards(result);
    this.renderResultCount(result.length);
  },

  renderCards(items) {
    const container = document.getElementById('training-grid');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
          <svg class="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-base font-semibold text-slate-700">조건에 일치하는 직무연수가 없습니다.</p>
          <p class="text-xs text-slate-500 mt-1">검색어나 선택한 필터 조건을 다시 확인해주세요.</p>
          <button onclick="App.resetFilters()" class="mt-4 px-4 py-2 text-xs font-semibold text-pnu-blue bg-blue-50 hover:bg-blue-100 rounded-lg transition">
            필터 초기화
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      // 이수구분 뱃지
      let reqBadge = '';
      if (item.requirement === '필수') {
        reqBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">필수이수</span>';
      } else if (item.requirement === '권장') {
        reqBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">권장</span>';
      } else {
        reqBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">선택</span>';
      }
      
      return `
        <article class="training-card bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden group">
          <!-- 상단 뱃지 영역 -->
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                ${item.category}
              </span>
              <div class="flex items-center space-x-1.5">
                <span class="text-[11px] font-mono text-slate-400">${item.id}</span>
                ${reqBadge}
              </div>
            </div>

            <!-- 연수 제목 -->
            <h3 class="text-lg font-bold text-slate-900 group-hover:text-pnu-navy transition line-clamp-2 leading-snug mb-2.5">
              <a href="detail.html?id=${encodeURIComponent(item.id)}" class="focus:outline-none focus:underline">
                ${item.title}
              </a>
            </h3>

            <!-- 연수 요약 설명 -->
            <p class="text-xs text-slate-500 line-clamp-2 mb-5 leading-relaxed">
              ${item.summary || item.description}
            </p>
          </div>

          <!-- 메타 정보 영역 -->
          <div>
            <div class="space-y-2 border-t border-slate-100 pt-4 mb-5 text-xs text-slate-600">
              <div class="flex items-center">
                <svg class="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="font-medium text-slate-700 mr-2">일정:</span>
                <span class="truncate">${item.period}</span>
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium text-slate-700 mr-2">시수:</span>
                <span class="font-semibold text-slate-800">${item.hours}</span>
                <span class="mx-2 text-slate-300">|</span>
                <span class="text-slate-500">${item.method}</span>
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="font-medium text-slate-700 mr-2">대상:</span>
                <span class="truncate">${item.target}</span>
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span class="font-medium text-slate-700 mr-2">부서:</span>
                <span class="truncate">${item.department}</span>
              </div>
            </div>

            <!-- 하단 버튼 링크 -->
            <a href="detail.html?id=${encodeURIComponent(item.id)}" 
               class="w-full flex items-center justify-center py-2.5 px-4 bg-slate-50 hover:bg-pnu-navy text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 border border-slate-200 hover:border-pnu-navy group-hover:shadow-sm">
              상세보기 및 신청 안내
              <svg class="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </article>
      `;
    }).join('');
  },

  renderResultCount(count) {
    const countEl = document.getElementById('search-result-count');
    if (countEl) {
      countEl.textContent = `총 ${count}건`;
    }
  },

  resetFilters() {
    this.state.filter = {
      keyword: '',
      category: '전체',
      target: '전체',
      method: '전체',
      status: '전체',
      sort: 'default'
    };

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    const targetSelect = document.getElementById('filter-target');
    if (targetSelect) targetSelect.value = '전체';

    const methodSelect = document.getElementById('filter-method');
    if (methodSelect) methodSelect.value = '전체';

    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) statusSelect.value = '전체';

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'default';

    const chipContainer = document.getElementById('category-chips');
    if (chipContainer) {
      chipContainer.querySelectorAll('.category-chip').forEach(c => {
        if (c.getAttribute('data-category') === '전체') {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
    }

    this.applyFilters();
  },

  renderLoading(container) {
    if (!container) return;
    container.innerHTML = Array(6).fill(0).map(() => `
      <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-4">
            <div class="w-16 h-5 rounded-full skeleton-shimmer"></div>
            <div class="w-14 h-5 rounded-full skeleton-shimmer"></div>
          </div>
          <div class="w-3/4 h-6 rounded skeleton-shimmer mb-2"></div>
          <div class="w-1/2 h-4 rounded skeleton-shimmer mb-5"></div>
        </div>
        <div class="space-y-2 border-t border-slate-100 pt-4">
          <div class="w-full h-4 rounded skeleton-shimmer"></div>
          <div class="w-4/5 h-4 rounded skeleton-shimmer"></div>
          <div class="w-full h-9 rounded-xl skeleton-shimmer mt-4"></div>
        </div>
      </div>
    `).join('');
  },

  renderError(container, errorMsg) {
    if (!container) return;
    container.innerHTML = `
      <div class="col-span-full py-16 text-center bg-red-50 rounded-2xl border border-red-200 p-8">
        <svg class="mx-auto h-12 w-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-base font-bold text-red-800">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p class="text-xs text-red-600 mt-2">${errorMsg}</p>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition">
          다시 시도
        </button>
      </div>
    `;
  }
};
