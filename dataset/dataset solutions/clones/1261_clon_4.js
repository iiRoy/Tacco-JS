const sourceDataBuffer = require('node:fs').readFileSync(0);
const sourceTextContent = sourceDataBuffer.toString('utf8');

const endSequence = '\n0 0';
let processingBoundary = sourceTextContent.indexOf(endSequence);
let relevantInput = sourceTextContent;

if (processingBoundary !== -1) {
    relevantInput = sourceTextContent.substring(0, processingBoundary);
}

const lineFragments = relevantInput.split('\n');
const dimensionRecords = [];

for (let currentLineIndex = 0; currentLineIndex < lineFragments.length; currentLineIndex++) {
    const currentLineValue = lineFragments[currentLineIndex].trim();
    if (currentLineValue.length === 0) {
        continue;
    }

    const valueComponents = currentLineValue.split(' ');
    const hDimension = Number(valueComponents[0]);
    const wDimension = Number(valueComponents[1]);

    if (hDimension > 0 && wDimension > 0) {
        dimensionRecords.push({ heightParam: hDimension, widthParam: wDimension });
    }
}

const generatedStructures = [];

for (let recordIndex = 0; recordIndex < dimensionRecords.length; recordIndex++) {
    const currentRecord = dimensionRecords[recordIndex];
    const structureHeight = currentRecord.heightParam;
    const structureWidth = currentRecord.widthParam;

    const currentStructureLines = [];
    for (let r = 0; r < structureHeight; r++) {
        let rowContent = '';
        for (let c = 0; c < structureWidth; c++) {
            const isBorderRow = (r === 0 || r === structureHeight - 1);
            const isBorderColumn = (c === 0 || c === structureWidth - 1);

            if (isBorderRow || isBorderColumn) {
                rowContent += '#';
            } else {
                rowContent += '.';
            }
        }
        currentStructureLines.push(rowContent);
    }
    generatedStructures.push(currentStructureLines.join('\n'));
}

let finalOutputString = generatedStructures.join('\n\n');
finalOutputString += '\n';

process.stdout.write(finalOutputString);