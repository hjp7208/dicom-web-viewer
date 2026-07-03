$ErrorActionPreference = "Stop"
try {
    $contentPath = "c:\NextjsProjects\DICOM-Viewer\dicom-viewer\scratch\content.txt"
    # Read the text explicitly as UTF-8
    $text = [System.IO.File]::ReadAllText($contentPath, [System.Text.Encoding]::UTF8)

    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Add()
    $selection = $word.Selection

    $selection.Font.Name = "Malgun Gothic"
    
    $selection.Font.Size = 14
    $selection.Font.Bold = $true
    $title = "DICOM 웹 뷰어 구축 3인 인원 배분 가이드"
    $selection.TypeText($title)
    $selection.TypeParagraph()
    $selection.TypeParagraph()

    $selection.Font.Size = 11
    $selection.Font.Bold = $false
    $selection.TypeText($text)
    
    $path = "c:\NextjsProjects\DICOM-Viewer\dicom-viewer\Web_Viewer_RNR_Guide_Fix.docx"
    $doc.SaveAs([ref]$path)
    $doc.Close()
    $word.Quit()
    Write-Output "Word Document Created: $path"
} catch {
    Write-Error $_.Exception.Message
}
