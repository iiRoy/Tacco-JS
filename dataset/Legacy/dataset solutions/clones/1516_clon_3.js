const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let globalInputProcessor;
const collectedInputLines = [];

inputReader.on('line', (lineInput) => { collectedInputLines.push(lineInput); });
inputReader.on('close', () => {
  globalInputProcessor = new InputProcessor(collectedInputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function createDeepCopy(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

class InputProcessor {
  constructor(lines) {
    this.lineList = lines;
    this.currentLineIndex = 0;
    this.totalLines = lines.length;
  }

  hasMoreLines() {
    return this.currentLineIndex < this.totalLines;
  }

  fetchNextLine() {
    if (this.hasMoreLines()) {
      return this.lineList[this.currentLineIndex++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }
}

function convertInputData(value, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(value);
      case 2: return value.split(' ');
      case 4: return value.split(' ').map(Number);
      case 6: return value.split('');
      case 7: return value.split('').map(Number);
      case 8: return value.join(' ');
      case 9: return value.join('\n');
      case 0: return value.join('');
      default: return value;
    }
  } catch (e) {
    return value;
  }
}

function readInteger() { return convertInputData(globalInputProcessor.fetchNextLine(), 1); }
function readStringArray() { return convertInputData(globalInputProcessor.fetchNextLine(), 2); }
function readIntegerArray() { return convertInputData(globalInputProcessor.fetchNextLine(), 4); }
function readCharacterArray() { return convertInputData(globalInputProcessor.fetchNextLine(), 6); }
function getNextInputLine() { return globalInputProcessor.fetchNextLine(); }
function checkHasMoreInput() { return globalInputProcessor.hasMoreLines(); }

function outputResult(data) { console.log(data); }
function outputDebug(data) { console.error('debug:' + require('util').inspect(data, false, null)); }

const safeModulo = (value, modulus) => {
  const result = value % modulus;
  return result < 0 ? result + modulus : result;
};

function executeMainLogic() {
  const initialParameters = readIntegerArray();
  const arrayLength = initialParameters[0];
  const numberOfRanges = initialParameters[1];
  const MODULO_CONSTANT = 998244353;

  const dpState = Array.from({ length: arrayLength }, () => 0);
  const cumulativeSum = Array.from({ length: arrayLength }, () => 0);

  dpState[0] = 1;
  cumulativeSum[0] = 1;

  const rangeDefinitions = [];
  for (let k = 0; k < numberOfRanges; k++) {
    const currentRangeInput = readIntegerArray();
    rangeDefinitions.push({
      lowerBound: currentRangeInput[0],
      upperBound: currentRangeInput[1]
    });
  }

  const calculateRangeContribution = (currentIdx, range, dpArr, sumArr, modVal) => {
    const { lowerBound, upperBound } = range;

    const previousIndexForLowerBound = currentIdx - lowerBound;
    const previousIndexForUpperBoundMinusOne = currentIdx - upperBound - 1;

    if (previousIndexForLowerBound < 0) {
      return 0;
    }

    let contributionAmount = 0;
    if (lowerBound === upperBound) {
      contributionAmount = dpArr[previousIndexForLowerBound];
    } else if (previousIndexForUpperBoundMinusOne < 0) {
      contributionAmount = sumArr[previousIndexForLowerBound];
    } else {
      contributionAmount = sumArr[previousIndexForLowerBound] - sumArr[previousIndexForUpperBoundMinusOne];
    }
    return safeModulo(contributionAmount, modVal);
  };

  for (let currentIdx = 1; currentIdx < arrayLength; currentIdx++) {
    let totalDpContributionForCurrentIdx = 0;

    for (let rangeIterator = 0; rangeIterator < numberOfRanges; rangeIterator++) {
      const activeRange = rangeDefinitions[rangeIterator];
      const contributionFromThisRange = calculateRangeContribution(
        currentIdx,
        activeRange,
        dpState,
        cumulativeSum,
        MODULO_CONSTANT
      );
      totalDpContributionForCurrentIdx = safeModulo(totalDpContributionForCurrentIdx + contributionFromThisRange, MODULO_CONSTANT);
    }
    dpState[currentIdx] = totalDpContributionForCurrentIdx;

    const previousCumulativeValue = cumulativeSum[currentIdx - 1];
    const newCumulativeValue = dpState[currentIdx] + previousCumulativeValue;
    cumulativeSum[currentIdx] = safeModulo(newCumulativeValue, MODULO_CONSTANT);
  }

  outputResult(dpState[arrayLength - 1]);
}
