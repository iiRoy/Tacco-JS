const fileSystemModule = require('fs');
const rawDataAcquisition = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawDataAcquisition.trim().split('\n');

const generatedSegments = processedLines
  .filter(dataLine => dataLine !== '0 0' && dataLine.trim() !== '')
  .map(dimensionString => dimensionString.split(' ').map(Number))
  .map(([numRows, numCols]) => {
    const singleRowPattern = '#'.repeat(numCols);
    const multiRowBlock = (singleRowPattern + '\n').repeat(numRows);
    return multiRowBlock + '\n';
  });

const compositeResult = generatedSegments.join('');

console.log(compositeResult);