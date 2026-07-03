$ErrorActionPreference = "Stop"
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Add()
    $selection = $word.Selection

    $selection.Font.Name = "Malgun Gothic"
    $selection.Font.Size = 14
    $selection.Font.Bold = $true
    $selection.TypeText("DICOM 웹 뷰어 구축 3인 인원 배분 가이드")
    $selection.TypeParagraph()
    $selection.TypeParagraph()

    $selection.Font.Size = 11
    $selection.Font.Bold = $false
    $text = @"
제공해주신 백엔드 README.md를 분석해본 결과, 현재 백엔드는 DICOM 파일 업로드 및 저장, AI 추론(ONNX Runtime), 결과물 생성(Secondary Capture, SC), 그리고 웹 뷰어용 PNG 변환 표시 기능을 완벽하게 갖추고 있습니다. 또한 인증(OAuth, JWT) 기능도 준비되어 있는 것으로 보입니다.

웹 뷰어(프론트엔드)는 Next.js(App Router) + React + Tailwind CSS 스택으로 개발될 예정인 것으로 보이며, 3명의 프론트엔드 개발자가 효율적으로 병렬 작업을 진행하기 위해 업무를 역할과 도메인 단위로 분리하는 것이 좋습니다.

다음은 웹 뷰어 구축을 가장 수월하게 진행할 수 있는 3인 업무 배분(R&R) 가이드입니다.

---

팀원 A: DICOM Viewer Core 및 이미지 렌더링 (가장 난이도 높음)
백엔드에서 변환해 주는 PNG 또는 원본 DICOM 이미지를 화면에 렌더링하고, 사용자가 이미지를 조작할 수 있는 뷰어 화면 자체에 집중합니다.

* 주요 담당 업무:
- 메인 뷰어 레이아웃 구현: 화면 분할, 썸네일 스트립(시리즈 목록), 도구 모음(Toolbar) UI 배치
- 이미지 렌더링 엔진 구축: 백엔드의 API를 활용해 캔버스(Canvas)나 이미지 태그에 렌더링
- 이미지 조작 툴 구현: 줌(Zoom), 팬(Pan), 스크롤(마우스 휠로 이미지 넘기기) 등의 상호작용
- AI 결과물 오버레이: AI 추론 후 반환된 결과(정상/이상, 확률 등)를 화면 상단이나 이미지 위에 표시하는 로직

---

팀원 B: API 통신, 데이터 상태 관리 및 AI 워크플로우
백엔드 API와의 통신을 전담하고, 복잡한 비동기 작업(파일 업로드, AI 추론 대기 등)과 전역 상태 관리(Zustand, Redux 등)를 책임집니다.

* 주요 담당 업무:
- HTTP 클라이언트 세팅: Axios 인스턴스 설정 및 백엔드 API 에러 핸들링
- DICOM 업로드 기능: 업로드 API 연동, 대용량 파일 다중 업로드 처리 및 진행률(Progress Bar) 표시 UI 연동
- AI 파이프라인 로직 연결: 경로 조회, 추론 요청 및 응답 데이터 가공
- 전역 상태 관리: 현재 선택된 환자/Study 정보, 현재 보고 있는 이미지 인덱스, 업로드/AI 추론 진행 상태 등을 전역 상태로 관리

---

팀원 C: 공통 UI/UX, 인증(Auth) 및 워크리스트(Worklist)
전체적인 웹 브라우저의 골격을 잡고, 로그인부터 환자 목록 조회까지 사용자가 뷰어에 진입하기 전까지의 경험을 구축합니다.

* 주요 담당 업무:
- 인증 및 라우팅 (Next.js App Router): JWT 및 OAuth2(카카오, 네이버, 구글) 로그인 연동, 퍼블릭/프라이빗 라우트 보호(Middleware 활용)
- 레이아웃 및 디자인 시스템: Tailwind CSS를 활용한 공통 컴포넌트(버튼, 모달, 토스트 알림, 로딩 스피너 등) 및 전역 레이아웃(헤더, 사이드바) 개발
- 워크리스트(Worklist) 페이지: 데이터베이스에 저장된 환자(Patient) 및 검사(Study) 목록을 보여주는 테이블 UI, 검색 및 필터링 기능 구현
- 뷰어 진입부 연결: 워크리스트에서 특정 환자를 클릭했을 때, 해당 Study ID를 뷰어 페이지로 넘겨주는 라우팅 처리

---

3인 협업 진행 시 팁 (효율을 극대화하는 방법)

1. 초기 (1~2일차): 공통 인터페이스 합의
- 팀원 B(Data) 주도로 API 응답 형태를 TypeScript interface로 가장 먼저 정의해야 합니다.
- 그래야 백엔드 연동이 완료되기 전이라도 팀원 A와 팀원 C가 Mock 데이터(가짜 데이터)를 만들어 UI 개발을 병렬로 시작할 수 있습니다.

2. 레이어(Layer) 분리
- 팀원 B가 API 호출 함수와 상태 관리 Hook을 만들어 주면, 팀원 A와 C는 내부 로직을 몰라도 UI 컴포넌트에서 그 Hook을 불러와서(Import) 클릭 이벤트에 연결하기만 하면 되도록 결합도를 낮추는 것이 좋습니다.

3. UI 컴포넌트 주도 (팀원 C의 역할 확대)
- 팀원 C가 Tailwind CSS를 활용해 버튼이나 모달 팝업 등을 미리 잘 만들어 두면, 팀원 A는 뷰어 도구 모음을 만들 때 그 컴포넌트를 가져다 쓰기만 하면 되므로 뷰어 렌더링 기술 자체에만 집중할 수 있습니다.
"@
    $selection.TypeText($text)
    
    $path = "c:\NextjsProjects\DICOM-Viewer\dicom-viewer\Web_Viewer_RNR_Guide.docx"
    $doc.SaveAs([ref]$path)
    $doc.Close()
    $word.Quit()
    Write-Output "Word Document Created: $path"
} catch {
    Write-Error $_.Exception.Message
}
