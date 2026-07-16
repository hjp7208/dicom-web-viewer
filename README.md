# DICOM Viewer 프로젝트

Next.js와 Cornerstone.js 기반으로 구축된 웹 기반 DICOM 의료 영상 뷰어입니다. 웹 브라우저 상에서 로컬 DICOM 파일 및 ZIP 압축 파일을 직접 업로드하여 의료 영상을 시각화하고, 분석 도구 및 AI 추론 결과를 오버레이하여 확인할 수 있습니다.

## ✨ 주요 기능 (Main Features)

- **로컬 파일 및 ZIP 업로드**: `dcm` 파일 또는 여러 파일이 포함된 `.zip` 압축 파일을 뷰어에 드래그 앤 드롭하여 브라우저에서 직접 파싱 및 로드합니다.
- **고성능 의료 영상 렌더링**: Cornerstone.js 기반으로 스크롤, 빠른 이미지 로드 등 쾌적한 렌더링 성능을 제공합니다.
- **다중 뷰포트 레이아웃 지원**: 1x1, 1x2, 2x2 등의 그리드 레이아웃을 통해 여러 DICOM 시리즈를 동시에 비교 분석할 수 있습니다.
- **측정 및 시각화 도구**: 
  - 이동(Pan) 및 확대/축소(Zoom)
  - 윈도우/레벨(Window/Level) 조작 (밝기 및 대조 조절)
  - 길이(Length), 각도(Angle), 사각형 영역(Rectangle ROI) 측정
- **AI 결과 오버레이**: AI 분석 결과(병변 위치 등)를 수신하여 영상 위에 마커로 시각화하고, 사이드바에서 상세 레포트를 제공합니다.
- **환자 정보 익명화(Anonymization)**: 화면에 표시되는 민감한 환자 정보(PHI)를 가려주는 기능을 제공합니다.
- **다크/라이트 테마**: 사용자 환경에 맞게 눈이 편안한 다크 모드와 라이트 모드를 지원합니다.
- **윈도우 프리셋**: 폐(Lung), 뼈(Bone), 뇌(Brain), 연조직(Soft Tissue) 등 부위별로 최적화된 밝기/대조 프리셋을 원클릭으로 적용할 수 있습니다.

---

## 🛠 기술 스택 (Tech Stack)
### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI/View**: React 18
- **상태 관리**: Zustand (전역 뷰어 상태 및 테마 관리)
- **스타일링**: Tailwind CSS, Lucide React (아이콘)

### Medical Imaging
- **렌더링 엔진**: Cornerstone.js (v5) (`@cornerstonejs/core`, `@cornerstonejs/dicom-image-loader`, `@cornerstonejs/tools`)
- **DICOM 파싱**: `dicom-parser`, `dcmjs`
- **유틸리티**: `unzipit` (ZIP 파일 내 DICOM 추출 및 처리)

---

## 🏗 아키텍처 (Architecture)

본 뷰어 애플리케이션은 **Client-Side Rendering(CSR)** 중심의 구조를 따르며, 브라우저 단에서 무거운 의료 영상 처리와 렌더링을 수행하도록 설계되었습니다.

1. **상태 관리 (State Management)**: `Zustand`를 활용하여 툴 활성화 상태, 활성 뷰포트 레이아웃, 로드된 DICOM 시리즈 목록 등의 글로벌 상태를 관리합니다.
2. **DICOM 파싱 및 로드**: 사용자가 로컬 파일을 Drag & Drop 하면, `unzipit`과 파일 리더를 통해 메모리 상에서 DICOM 바이너리를 파싱합니다. 파싱된 데이터는 `dicom-image-loader`를 거쳐 Cornerstone.js가 인식할 수 있는 이미지 캐시로 등록됩니다.
3. **렌더링 (Rendering)**: `Cornerstone.js (v5)`의 렌더링 엔진을 사용하여 HTML5 Canvas 위에 고성능 2D/3D(Stack) 렌더링을 수행합니다.
4. **AI 연동 (AI Integration)**: 서버로부터 전달받은 AI 분석 결과 데이터를 기반으로, 영상 위에 병변 위치(Lesion)나 측정값 ROI를 오버레이(Overlay) 합니다.

---

## 📂 프로그램 구조 (Program Structure)

주요 비즈니스 로직과 컴포넌트는 `src/features` 하위에 도메인 별로 분리되어 있습니다.

```text
src/
 └── features/
      ├── dicom-viewer/          # DICOM 뷰어 핵심 도메인
      │    ├── components/       # 뷰어 관련 UI 컴포넌트
      │    │    ├── DicomViewer.tsx     # Cornerstone 뷰포트 컨테이너
      │    │    ├── SeriesSidebar.tsx   # 업로드된 시리즈/환자 리스트 사이드바
      │    │    ├── AIResultSidebar.tsx # AI 분석 결과 및 레포트 사이드바
      │    │    ├── Toolbar.tsx         # Pan, Zoom, W/L 등 측정 도구 툴바
      │    │    └── ViewerLayout.tsx    # 전체 뷰어 레이아웃 조립
      │    ├── hooks/            # 커스텀 훅 (ex. useDicomFileDrop: 파일 업로드 처리)
      │    ├── store/            # 상태 관리 (useViewerStore: 뷰어 전역 상태)
      │    └── utils/            # 유틸리티 (DICOM 파싱, ZIP 압축 해제, 파일 처리 등)
      │
      └── theme/                 # 테마 도메인
           └── useThemeStore.ts  # 다크모드/라이트모드 전역 상태 관리
```

---

## 🚀 실행 방법 (How to Run)

### 1. 사전 요구 사항
- **Node.js**: v18.x 이상 권장
- **패키지 매니저**: npm 또는 yarn

### 2. 패키지 설치
프로젝트 루트(`dicom-viewer` 폴더)로 이동한 후 종속성 패키지를 설치합니다.
```bash
npm install
# 또는
yarn install
```

### 3. 로컬 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

### 4. 접속 및 사용 방법
1. 브라우저에서 `로컬: http://localhost:3000` 또는 `실제 도메인: hjp7208.site` 에 접속합니다.
2. 로컬 컴퓨터에 있는 `.dcm` 파일들이나 해당 파일들이 포함된 `.zip` 파일을 화면 우측 캔버스로 **드래그 앤 드롭** 합니다.
3. 파일 파싱이 완료되면 좌측 사이드바(Series Sidebar)에서 원하는 시리즈를 선택하여 뷰어에 표시합니다.
4. 상단 툴바를 이용해 이미지 확대/축소, 윈도우링(밝기/대조), 길이/각도 측정 등의 기능을 사용할 수 있습니다.
