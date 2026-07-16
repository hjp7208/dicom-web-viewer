import zipfile, xml.etree.ElementTree as ET, sys

def extract_pptx(path, out_path):
    try:
        with zipfile.ZipFile(path, 'r') as z:
            slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
            slides.sort(key=lambda x: int(x.replace('ppt/slides/slide', '').replace('.xml', '')))
            with open(out_path, 'w', encoding='utf-8') as out:
                for slide in slides:
                    xml_content = z.read(slide)
                    texts = [e.text for e in ET.fromstring(xml_content).iter() if e.tag.endswith('}t') and e.text]
                    out.write(f"--- {slide} ---\n")
                    out.write('\n'.join(texts) + '\n\n')
    except Exception as e:
        print(f"PPTX error: {e}")

def extract_docx(path, out_path):
    try:
        with zipfile.ZipFile(path, 'r') as z:
            doc = z.read('word/document.xml')
            with open(out_path, 'w', encoding='utf-8') as out:
                out.write('\n'.join([e.text for e in ET.fromstring(doc).iter() if e.tag.endswith('}t') and e.text]))
    except Exception as e:
        print(f"DOCX error: {e}")

extract_pptx(sys.argv[1], 'full_pptx.txt')
extract_docx(sys.argv[2], 'full_docx.txt')
