const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputHandler;
const inputLines = [];

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  inputHandler = new InputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function readInteger() { return convertInput(getNextToken(), 1); }
function readStringArray() { return convertInput(getNextToken(), 2); }
function readIntegerArray() { return convertInput(getNextToken(), 4); }
function readCharacterArray() { return convertInput(getNextToken(), 6); }
function getNextToken() { return inputHandler.next(); }
function hasMoreTokens() { return inputHandler.hasMore(); }

class InputProcessor {
  constructor(lines) {
    this.dataLines = lines;
    this.currentIndex = 0;
    this.totalLines = lines.length;
  }

  hasMore() {
    return (this.currentIndex < this.totalLines);
  }

  next() {
    if (this.hasMore()) {
      return this.dataLines[this.currentIndex++];
    } else {
      throw new Error('ArrayIndexOutOfBoundsException: No more input available.');
    }
  }
}

function printResult(outputValue) { console.log(outputValue); }
function printDebug(debugMessage) { console.error('debug:' + require('util').inspect(debugMessage, false, null)); }

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue, 10);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

function executeMainLogic() {
  const firstLineData = readIntegerArray();
  const arrayLength = firstLineData[0];
  const playerZScore = firstLineData[1];
  const playerWScore = firstLineData[2];

  const scoreList = readIntegerArray();

  const calculateAbsDiff = (valA, valB) => Math.abs(valA - valB);

  if (arrayLength === 1) {
    const lastElementIndex = arrayLength - 1;
    const lastScore = scoreList[lastElementIndex];
    const resultForSingleElement = calculateAbsDiff(lastScore, playerWScore);
    printResult(resultForSingleElement);
  } else {
    const lastElementIndex = arrayLength - 1;
    const secondLastElementIndex = arrayLength - 2;

    const lastScore = scoreList[lastElementIndex];
    const secondLastScore = scoreList[secondLastElementIndex];

    const diffBetweenLastTwo = calculateAbsDiff(secondLastScore, lastScore);
    const diffLastScoreAndW = calculateAbsDiff(lastScore, playerWScore);

    const finalResult = Math.max(diffBetweenLastTwo, diffLastScoreAndW);
    printResult(finalResult);
  }
}
