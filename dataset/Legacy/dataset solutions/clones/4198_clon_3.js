const readline = require('readline');
const util = require('util');

const inputReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let rawInputLines = [];
let inputProcessorInstance;

inputReader.on('line', (line) => {
  rawInputLines.push(line);
});

inputReader.on('close', () => {
  inputProcessorInstance = createInputProcessor(rawInputLines);
  console.error('\n↑入力 ↓出力');
  solveProblem();
});

function deepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

const CONV_TYPE = {
  PARSE_INT: 1,
  SPLIT_SPACE_STR: 2,
  SPLIT_SPACE_INT: 4,
  SPLIT_CHAR_STR: 6,
  SPLIT_CHAR_INT: 7,
  JOIN_SPACE: 8,
  JOIN_NEWLINE: 9,
  JOIN_NO_CHAR: 0
};

function createInputProcessor(lines) {
  let currentLineIndex = 0;
  const totalLines = lines.length;

  return {
    hasMoreTokens: () => currentLineIndex < totalLines,
    getNextToken: () => {
      if (currentLineIndex < totalLines) {
        return lines[currentLineIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    },
    convertInputToken: (token, conversionType) => {
      try {
        switch (conversionType) {
          case CONV_TYPE.PARSE_INT:
            return parseInt(token, 10);
          case CONV_TYPE.SPLIT_SPACE_STR:
            return token.split(' ');
          case CONV_TYPE.SPLIT_SPACE_INT:
            return token.split(' ').map(Number);
          case CONV_TYPE.SPLIT_CHAR_STR:
            return token.split('');
          case CONV_TYPE.SPLIT_CHAR_INT:
            return token.split('').map(Number);
          case CONV_TYPE.JOIN_SPACE:
            return token.join(' ');
          case CONV_TYPE.JOIN_NEWLINE:
            return token.join('\n');
          case CONV_TYPE.JOIN_NO_CHAR:
            return token.join('');
          default:
            return token;
        }
      } catch (e) {
        return token;
      }
    }
  };
}

function readInt() {
  return inputProcessorInstance.convertInputToken(inputProcessorInstance.getNextToken(), CONV_TYPE.PARSE_INT);
}

function readStrArray() {
  return inputProcessorInstance.convertInputToken(inputProcessorInstance.getNextToken(), CONV_TYPE.SPLIT_SPACE_STR);
}

function readIntArray() {
  return inputProcessorInstance.convertInputToken(inputProcessorInstance.getNextToken(), CONV_TYPE.SPLIT_SPACE_INT);
}

function readCharArray() {
  return inputProcessorInstance.convertInputToken(inputProcessorInstance.getNextToken(), CONV_TYPE.SPLIT_CHAR_STR);
}

function printResult(data) {
  console.log(data);
}

function printDebug(data) {
  console.error('debug:' + util.inspect(data, false, null));
}

function solveProblem() {
  const [numIntervals, capacity] = readIntArray();

  const MAX_COORDINATE_VALUE = 100005;
  const eventCounts = new Array(MAX_COORDINATE_VALUE).fill(0);

  const applyIntervalDifferences = (count, diffArray) => {
    for (let k = 0; k < count; k++) {
      const [startPoint, endPoint] = readIntArray();
      diffArray[startPoint]++;
      diffArray[endPoint + 1]--;
    }
  };

  applyIntervalDifferences(numIntervals, eventCounts);

  const calculateMaxOverlap = (diffArray, limit) => {
    let currentMaxOverlap = 1;
    let runningOverlapSum = 0;

    for (let k = 1; k < limit; k++) {
      runningOverlapSum += diffArray[k];
      currentMaxOverlap = Math.max(currentMaxOverlap, runningOverlapSum);
    }
    return currentMaxOverlap;
  };

  const finalMaxOverlap = calculateMaxOverlap(eventCounts, MAX_COORDINATE_VALUE);
  printResult(finalMaxOverlap);
}
