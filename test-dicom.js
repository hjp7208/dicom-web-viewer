const fs = require('fs');
const path = require('path');
const dicomParser = require('dicom-parser');

const folderPath = 'C:\\Users\\tjoeun\\Desktop\\보관용\\2차 프로젝트\\STS01\\201906';

function readDirRecursive(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(readDirRecursive(filePath));
        } else {
            results.push(filePath);
        }
    });
    return results;
}

try {
    const files = readDirRecursive(folderPath);
    console.log(`Found ${files.length} files in the directory.`);
    
    let validDicoms = 0;
    let multiframeCount = 0;
    let errors = 0;
    
    // Sample metadata to print out for debugging
    let sampleParsed = null;

    files.forEach(file => {
        try {
            const buffer = fs.readFileSync(file);
            const byteArray = new Uint8Array(buffer);
            const dataSet = dicomParser.parseDicom(byteArray);
            validDicoms++;

            const numFrames = dataSet.string('x00280008');
            if (numFrames && parseInt(numFrames, 10) > 1) {
                multiframeCount++;
                console.log(`Multiframe file found: ${file} (Frames: ${numFrames})`);
            }

            if (!sampleParsed) {
                const getStr = (tag) => dataSet.string(tag) || '';
                const getInt = (tag) => { const s = dataSet.string(tag); return s ? parseInt(s, 10) : 0; };
                const getFloat = (tag) => { const s = dataSet.string(tag); return s ? parseFloat(s) : 0; };
                
                sampleParsed = {
                    patientName: getStr('x00100010'),
                    studyDate: getStr('x00080020'),
                    modality: getStr('x00080060'),
                    seriesInstanceUid: getStr('x0020000e'),
                    instanceNumber: getInt('x00200013'),
                    numberOfFrames: Math.max(1, getInt('x00280008'))
                };
            }
        } catch (e) {
            // Probably not a dicom file or dicomdir
            errors++;
        }
    });

    console.log(`\nResults:`);
    console.log(`Valid DICOM files: ${validDicoms}`);
    console.log(`Multiframe files: ${multiframeCount}`);
    console.log(`Invalid/Error files: ${errors}`);
    
    console.log('\nSample Parsed Metadata from the first file:');
    console.log(JSON.stringify(sampleParsed, null, 2));

} catch (e) {
    console.error('Error reading directory:', e.message);
}
