const fs = require('fs');

const systemConfig = {
  inputPath: process.platform === 'win32' ? 'tmp' : '/dev/stdin',
  lineDelimiter: process.platform === 'win32' ? '\r\n' : '\n'
};

function readAndParseInputArray(configuration) {
  const rawFileContent = fs.readFileSync(configuration.inputPath, 'ascii');
  const contentLines = rawFileContent.split(configuration.lineDelimiter);
  // The original code accesses line[1] directly, implying at least two lines.
  // We maintain this behavior.
  const targetLine = contentLines[1];
  return targetLine.split(' ').map(Number);
}

let dataArray = readAndParseInputArray(systemConfig);

const pivotFinalIndex = performPartition(dataArray, 0, dataArray.length);

const elementToHighlight = dataArray[pivotFinalIndex];
dataArray[pivotFinalIndex] = `[${elementToHighlight}]`;

console.log(dataArray.join(' '));

function performPartition(targetArray, startIndex, endIndex) {
  const swapElements = (arr, idx1, idx2) => {
    const tempValue = arr[idx1];
    arr[idx1] = arr[idx2];
    arr[idx2] = tempValue;
  };

  const pivotValue = targetArray[endIndex - 1];
  let storeIndex = startIndex;

  for (let currentIndex = startIndex; currentIndex < endIndex - 1; currentIndex++) {
    if (targetArray[currentIndex] <= pivotValue) {
      swapElements(targetArray, storeIndex, currentIndex);
      storeIndex++;
    }
  }

  swapElements(targetArray, storeIndex, endIndex - 1);
  return storeIndex;
}
