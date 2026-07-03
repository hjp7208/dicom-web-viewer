$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Add()
    $selection = $word.Selection

    $selection.Font.Name = "Malgun Gothic"
    
    # Title
    $selection.Font.Size = 16
    $selection.Font.Bold = $true
    $selection.TypeText("DICOM 뷰어 & 대시보드 (주제 A, D) 3인 업무 배분 가이드")
    $selection.TypeParagraph()
    $selection.TypeParagraph()

    $selection.Font.Size = 11
    $selection.Font.Bold = $false
    $selection.TypeText("주제 A(웹 DICOM 뷰어)와 주제 D(PACS 운영 대시보드)를 효율적으로 개발하기 위한 도메인 중심의 3인 역할 분담표입니다.")
    $selection.TypeParagraph()
    $selection.TypeParagraph()

    # Create Table (4 rows, 4 columns)
    $table = $doc.Tables.Add($selection.Range, 4, 4)
    $table.Borders.Enable = $true
    
    # Header Row
    $table.Cell(1,1).Range.Text = "팀원"
    $table.Cell(1,2).Range.Text = "담당 파트"
    $table.Cell(1,3).Range.Text = "프론트엔드 (React / Cornerstone3D)"
    $table.Cell(1,4).Range.Text = "백엔드 (Spring Boot / Orthanc)"
    
    $table.Rows.Item(1).Range.Font.Bold = $true
    $table.Rows.Item(1).Shading.BackgroundPatternColor = 15132390 # Light Gray
    
    # Row 2
    $table.Cell(2,1).Range.Text = "팀원 1"
    $table.Cell(2,2).Range.Text = "DICOM Viewer Core (주제 A 핵심)"
    $table.Cell(2,3).Range.Text = "- Cornerstone3D 기반 메인 뷰어 렌더링 파이프라인 구축`n- 윈도잉(WW/WL), 줌/팬, 길이/각도 등 계측(Measurement) 도구 구현`n- 멀티 모니터 / 분할 화면 레이아웃"
    $table.Cell(2,4).Range.Text = "- Orthanc DICOMweb 연동 (WADO-RS)`n- 뷰어용 이미지 최적화 전송 로직`n- (필요시) 레거시 통신 지원"

    # Row 3
    $table.Cell(3,1).Range.Text = "팀원 2"
    $table.Cell(3,2).Range.Text = "게이트웨이 & Worklist (주제 A 지원)"
    $table.Cell(3,3).Range.Text = "- 검사 목록(Worklist) UI 개발 (검색, 필터링, 페이징)`n- 로그인 및 권한 관리 UI"
    $table.Cell(3,4).Range.Text = "- QIDO-RS 기반 검색 API 구축`n- 권한/인증 게이트웨이 구축`n- 사용자 접근 권한(RBAC) 검증 및 태그 파싱"

    # Row 4
    $table.Cell(4,1).Range.Text = "팀원 3"
    $table.Cell(4,2).Range.Text = "PACS 운영 대시보드 (주제 D 전담)"
    $table.Cell(4,3).Range.Text = "- 차트 라이브러리를 활용한 통계 대시보드 UI (Recharts 등)`n- 장애 모니터링 및 스토리지 현황 알림 UI"
    $table.Cell(4,4).Range.Text = "- 모달리티별 검사 건수 및 스토리지 사용량 집계 API`n- DELFLAG(삭제 예정 상태) 현황 모니터링`n- DB/스토리지 상태 수집 배치(Batch)"

    # Adjust column widths slightly if possible, else rely on autofit
    $table.Columns.Item(1).PreferredWidth = 50
    $table.Columns.Item(2).PreferredWidth = 120

    # Move selection below table: 6 is wdStory
    $selection.EndKey(6) | Out-Null
    $selection.TypeParagraph()
    $selection.TypeParagraph()
    
    # Tips
    $selection.Font.Bold = $true
    $selection.Font.Size = 13
    $selection.TypeText("협업 팁 (핵심 포인트)")
    $selection.TypeParagraph()
    $selection.TypeParagraph()
    $selection.Font.Bold = $false
    $selection.Font.Size = 11
    
    $tips = @"
1. Orthanc 사전 세팅: 프로젝트 시작 즉시 Orthanc(DICOM 서버)를 띄워두고 더미 DICOM 데이터를 적재해 세 명이 동시에 작업을 시작할 수 있도록 환경을 구성하세요.
2. Cornerstone3D 학습 시간 확보: 팀원 1에게는 초기 2~3일 정도 공식 문서와 예제를 뜯어볼 수 있는 충분한 리서치 시간을 부여해야 합니다.
3. 대시보드 가짜 데이터 활용: 팀원 3은 백엔드 데이터가 쌓이기 전에 통계 API에서 무작위 가짜 데이터(Mock)를 뱉도록 설정하여 프론트엔드 차트 UI를 빠르게 병렬 개발하세요.
"@
    $selection.TypeText($tips)
    
    $path = "c:\NextjsProjects\DICOM-Viewer\dicom-viewer\Topic_A_D_RNR_Table.docx"
    $doc.SaveAs([ref]$path)
    $doc.Close()
    $word.Quit()
    Write-Output "Word Document Created: $path"
} catch {
    if ($word) {
        $word.Quit()
    }
    Write-Error $_.Exception.Message
}
