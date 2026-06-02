const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputProcessorInstance;
const collectedInputLines = [];

inputReader.on('line', (line) => {
  collectedInputLines.push(line);
});

inputReader.on('close', () => {
  inputProcessorInstance = initializeInputProcessor(collectedInputLines);
  console.error('\n');
  const startTime = Date.now();
  solveProblem();
  const endTime = Date.now() - startTime;
  printDebug('time : ' + endTime + 'ms');
  printDebug('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function deepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

class InputProcessor {
  constructor(lines) {
    this.lines = lines;
    this.currentIndex = 0;
    this.maxLines = lines.length;
  }

  hasMoreTokens() {
    return (this.currentIndex < this.maxLines);
  }

  getNextToken() {
    if (this.hasMoreTokens()) {
      return this.lines[this.currentIndex++];
    } else {
      throw 'ArrayIndexOutOfBoundsException: No more input available.';
    }
  }
}

function initializeInputProcessor(inputData) {
  return new InputProcessor(inputData);
}

function printOutput(message) {
  console.log(message);
}

function printDebug(message) {
  console.error('debug:' + require('util').inspect(message, false, null));
}

function parseInteger(str) { return parseInt(str); }
function splitBySpace(str) { return str.split(' '); }
function splitAndParseInt(str) { return str.split(' ').map(Number); }
function splitByChar(str) { return str.split(''); }
function splitByCharAndParseInt(str) { return str.split('').map(Number); }
function joinBySpace(arr) { return arr.join(' '); }
function joinByNewline(arr) { return arr.join('\n'); }
function joinNoSeparator(arr) { return arr.join(''); }

function convertInput(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInteger(inputVal);
      case 2: return splitBySpace(inputVal);
      case 4: return splitAndParseInt(inputVal);
      case 6: return splitByChar(inputVal);
      case 7: return splitByCharAndParseInt(inputVal);
      case 8: return joinBySpace(inputVal);
      case 9: return joinByNewline(inputVal);
      case 0: return joinNoSeparator(inputVal);
      default: return inputVal;
    }
  } catch (e) {
    return inputVal;
  }
}

function readInt() { return convertInput(inputProcessorInstance.getNextToken(), 1); }
function readStrArray() { return convertInput(inputProcessorInstance.getNextToken(), 2); }
function readIntArray() { return convertInput(inputProcessorInstance.getNextToken(), 4); }
function readCharArray() { return convertInput(inputProcessorInstance.getNextToken(), 6); }
function getNextToken() { return inputProcessorInstance.getNextToken(); }
function hasMoreTokens() { return inputProcessorInstance.hasMoreTokens(); }

const TARGET_CHAR_ZERO = "0";

function findNextValidStep(currentPos, maxStepSize, pathStr) {
  let stepFound = false;
  let bestStepDistance = 0;

  const searchStartIdx = currentPos - 1;
  const searchEndIdxExclusive = Math.max(-1, currentPos - maxStepSize - 1);

  for (let checkIdx = searchStartIdx; checkIdx > searchEndIdxExclusive; checkIdx--) {
    if (pathStr[checkIdx] === TARGET_CHAR_ZERO) {
      bestStepDistance = currentPos - checkIdx;
      stepFound = true;
      break;
    }
  }
  return { stepFound, bestStepDistance };
}

function solveProblem() {
  const firstLineNumbers = readIntArray();
  const totalLength = firstLineNumbers[0];
  const maxStep = firstLineNumbers[1];
  const pathString = getNextToken();

  const stepsTaken = [];
  let currentPosition = totalLength;

  while (true) {
    printDebug(currentPosition);

    const { stepFound, bestStepDistance } = findNextValidStep(currentPosition, maxStep, pathString);

    if (!stepFound) {
      printOutput(-1);
      return;
    } else {
      stepsTaken.push(bestStepDistance);
      currentPosition -= bestStepDistance;
    }

    if (currentPosition === 0) {
      break;
    }
  }

  stepsTaken.sort((a, b) => b - a);
  printOutput(convertInput(stepsTaken, 8));
}
