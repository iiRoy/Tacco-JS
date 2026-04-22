const processConfig = {
    sourceFilePath: '/dev/stdin', // Standard input file path
    recordSeparator: '\n'       // Character sequence for line termination
};

let rawInputRecords = require('fs')
    .readFileSync(processConfig.sourceFilePath, 'utf8')
    .split(processConfig.recordSeparator);

rawInputRecords[0] = rawInputRecords[0].split(' ').map(parseInt);
const primaryHeight = rawInputRecords[0][0];
const primaryWidth = rawInputRecords[0][1];

const primaryGridData = rawInputRecords.slice(1, 1 + primaryHeight);

rawInputRecords[1 + primaryHeight] = rawInputRecords[1 + primaryHeight].split(' ').map(parseInt);
const templateRows = rawInputRecords[1 + primaryHeight][0];
const templateCols = rawInputRecords[1 + primaryHeight][1];

const searchTemplateData = rawInputRecords.slice(1 + primaryHeight + 1, 1 + primaryHeight + 1 + templateRows);

if (primaryHeight < templateRows || primaryWidth < templateCols) {
    process.exit();
}

const subGridSegments = primaryGridData.map(function (currentLineContent) {
    const segmentList = [];
    let segmentIndex;
    for (segmentIndex = 0; segmentIndex <= primaryWidth - templateCols; segmentIndex++) {
        segmentList.push(currentLineContent.slice(segmentIndex, segmentIndex + templateCols));
    }
    return segmentList;
});

for (let rowOffset = 0; rowOffset <= primaryHeight - templateRows; rowOffset++) {
    for (let colOffset = 0; colOffset <= primaryWidth - templateCols; colOffset++) {
        let isPatternMatch = true;
        for (let templateRowIdx = 0; templateRowIdx < templateRows; templateRowIdx++) {
            if (subGridSegments[rowOffset + templateRowIdx][colOffset] !== searchTemplateData[templateRowIdx]) {
                isPatternMatch = false;
                break;
            }
        }
        if (isPatternMatch) {
            console.log(rowOffset, colOffset);
        }
    }
}