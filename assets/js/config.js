/**
 * 2026 부산대학교 직무연수 포털 공통 설정 파일
 */
const CONFIG = {
  // 구글 시트 gviz CSV 호출 URL (실시간 연동용)
  // headers=1 파라미터를 추가하여 1행 헤더와 32개 연수 데이터 행을 완벽 분리
  SHEET_URL: "https://docs.google.com/spreadsheets/d/17fLFPyfo5i67qFHnPidbmGgJVSLLASrL6GNV9hnyfEM/gviz/tq?tqx=out:csv&sheet=data&headers=1",
  
  // 로컬 백업 CSV 경로 (오프라인/네트워크 장애 대비용)
  FALLBACK_CSV: "./raw_data.csv",
  
  PORTAL_NAME: "2026 부산대학교 직무연수 안내 포털",
  UNIVERSITY_NAME: "국립부산대학교",
  YEAR: "2026"
};
