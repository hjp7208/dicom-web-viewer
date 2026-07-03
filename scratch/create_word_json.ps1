$ErrorActionPreference = "Stop"
try {
    $jsonPath = "c:\NextjsProjects\DICOM-Viewer\dicom-viewer\scratch\table_data.json"
    $jsonText = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8)
    $data = $jsonText | ConvertFrom-Json

    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Add()
    $selection = $word.Selection

    $selection.Font.Name = "Malgun Gothic"
    
    # Title
    $selection.Font.Size = 16
    $selection.Font.Bold = $true
    $selection.TypeText($data.title)
    $selection.TypeParagraph()
    $selection.TypeParagraph()

    $selection.Font.Size = 11
    $selection.Font.Bold = $false
    $selection.TypeText($data.subtitle)
    $selection.TypeParagraph()
    $selection.TypeParagraph()

    $numRows = $data.rows.Length + 1
    $numCols = $data.headers.Length
    $table = $doc.Tables.Add($selection.Range, $numRows, $numCols)
    $table.Borders.Enable = $true
    
    # Headers
    for ($i = 0; $i -lt $numCols; $i++) {
        $table.Cell(1, $i+1).Range.Text = $data.headers[$i]
    }
    $table.Rows.Item(1).Range.Font.Bold = $true
    $table.Rows.Item(1).Shading.BackgroundPatternColor = 15132390
    
    # Rows
    for ($r = 0; $r -lt $data.rows.Length; $r++) {
        for ($c = 0; $c -lt $numCols; $c++) {
            $table.Cell($r+2, $c+1).Range.Text = $data.rows[$r][$c]
        }
    }

    $table.Columns.Item(1).PreferredWidth = 50
    $table.Columns.Item(2).PreferredWidth = 120

    $selection.EndKey(6) | Out-Null
    $selection.TypeParagraph()
    $selection.TypeParagraph()
    
    # Tips
    $selection.Font.Bold = $true
    $selection.Font.Size = 13
    $selection.TypeText($data.tips_title)
    $selection.TypeParagraph()
    $selection.TypeParagraph()

    $selection.Font.Bold = $false
    $selection.Font.Size = 11
    $selection.TypeText($data.tips_body)
    
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
