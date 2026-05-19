const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
const lines = rawInputContent.split('\n');

const casePrefix = 'Case ';
const separatorChar = ':';

for (let currentIdx = 0, totalLines = lines.length; currentIdx < totalLines; currentIdx++) {
    const displayCaseNum = currentIdx + 1;
    const outputString = casePrefix + displayCaseNum + separatorChar + lines[currentIdx];
    console.log(outputString);
}
