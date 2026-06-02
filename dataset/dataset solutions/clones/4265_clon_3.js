const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputProcessor;
const inputLineBuffer = [];

inputReader.on('line', function(lineContent){
  inputLineBuffer.push(lineContent);
});

inputReader.on('close', function(){
  inputProcessor = createInputHandler(inputLineBuffer);
  console.error('\n↑入力 ↓出力');
  executeSolution();
});

class InputHandler {
  constructor(lines) {
    this.lines = lines;
    this.currentIndex = 0;
    this.maxLines = lines.length;
  }

  hasMoreValues() {
    return (this.currentIndex < this.maxLines);
  }

  getNextValue() {
    if (this.hasMoreValues()) {
      return this.lines[this.currentIndex++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }
}

function createInputHandler(inputLines) {
  return new InputHandler(inputLines);
}

function readInteger() { return processInputToken(getNextValue(), 1); }
function readStringArray() { return processInputToken(getNextValue(), 2); }
function readIntegerArray() { return processInputToken(getNextValue(), 4); }
function readCharacterArray() { return processInputToken(getNextValue(), 6); }

function getNextValue() { return inputProcessor.getNextValue(); }
function hasMoreValues() { return inputProcessor.hasMoreValues(); }

function outputResult(data) { console.log(data); }
function logDebug(data) { console.error('debug:' + require('util').inspect(data, false, null)); }

function processInputToken(token, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(token);
      case 2: return token.split(' ');
      case 4: return token.split(' ').map(Number);
      case 6: return token.split('');
      case 7: return token.split('').map(Number);
      case 8: return token.join(' ');
      case 9: return token.join('\n');
      case 0: return token.join('');
      default: return token;
    }
  } catch (e) {
    return token;
  }
}

function executeSolution() {
  const arraySizeN = readInteger();
  const arrayA = readIntegerArray();
  const arrayB = readIntegerArray();
  const arrayC = readIntegerArray();

  arrayA.sort(compareNumbersAscending);
  arrayB.sort(compareNumbersAscending);
  arrayC.sort(compareNumbersAscending);

  let totalCount = 0;

  for (let currentIdx = 0; currentIdx < arraySizeN; currentIdx++) {
    const bValue = arrayB[currentIdx];
    const countALessThanB = findCountLessThan(arrayA, bValue);
    const countCLargerThanB = findCountGreaterThan(arrayC, bValue);
    totalCount += countALessThanB * countCLargerThanB;
  }

  outputResult(totalCount);
}

function compareNumbersAscending(a, b) {
  return a - b;
}

function findCountLessThan(searchTargetArray, targetValue) {
  let lowerBoundIdx = -1;
  let upperBoundIdx = searchTargetArray.length;

  while (Math.abs(upperBoundIdx - lowerBoundIdx) > 1) {
    const midPointIdx = Math.floor((upperBoundIdx + lowerBoundIdx) / 2);
    if (searchTargetArray[midPointIdx] >= targetValue) {
      upperBoundIdx = midPointIdx;
    } else {
      lowerBoundIdx = midPointIdx;
    }
  }
  return upperBoundIdx;
}

function findCountGreaterThan(searchTargetArray, targetValue) {
  let lowerBoundIdx = -1;
  let upperBoundIdx = searchTargetArray.length;

  while (Math.abs(upperBoundIdx - lowerBoundIdx) > 1) {
    const midPointIdx = Math.floor((upperBoundIdx + lowerBoundIdx) / 2);
    if (searchTargetArray[midPointIdx] > targetValue) {
      upperBoundIdx = midPointIdx;
    } else {
      lowerBoundIdx = midPointIdx;
    }
  }
  return searchTargetArray.length - upperBoundIdx;
}
