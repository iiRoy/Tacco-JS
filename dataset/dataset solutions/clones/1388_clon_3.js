const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const textEncoding = 'utf8';
const lineSeparator = '\n';

let rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, textEncoding);
let inputLines = rawInputContent.split(lineSeparator);

let totalLines = inputLines.length;

for (let currentIndex = 0; currentIndex < totalLines; currentIndex++) {
    let currentLineData = inputLines[currentIndex];
    const outputPrefix = 'Case ';
    const separatorColon = ': ';
    let finalOutputString = outputPrefix + currentIndex + separatorColon + currentLineData;
    console.log(finalOutputString);
}
