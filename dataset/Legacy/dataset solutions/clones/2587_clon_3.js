const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputHandler;
const inputLines = [];

inputReader.on('line', (line) => {
  inputLines.push(line);
});

inputReader.on('close', () => {
  inputHandler = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function createDeepCopy(sourceObj) {
  return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));
}

const conversionMap = {
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(' '),
  4: (val) => val.split(' ').map(Number),
  6: (val) => val.split(''),
  7: (val) => val.split('').map(Number),
  8: (arr) => arr.join(' '),
  9: (arr) => arr.join('\n'),
  0: (arr) => arr.join('')
};

function convertInput(value, typeCode) {
  try {
    const converter = conversionMap[typeCode];
    return converter ? converter(value) : value;
  } catch (e) {
    return value;
  }
}

function readInteger() { return convertInput(getNextToken(), 1); }
function readStringArray() { return convertInput(getNextToken(), 2); }
function readIntegerArray() { return convertInput(getNextToken(), 4); }
function readCharacterArray() { return convertInput(getNextToken(), 6); }

function getNextToken() { return inputHandler.getNext(); }
function hasMoreTokens() { return inputHandler.hasMore(); }

function initializeInputProcessor(lines) {
  let currentLineIndex = 0;
  const totalLines = lines.length;
  const dataLines = lines;

  return {
    hasMore: () => currentLineIndex < totalLines,
    getNext: () => {
      if (currentLineIndex < totalLines) {
        return dataLines[currentLineIndex++];
      } else {
        throw new Error('InputProcessorException: No more input available.');
      }
    }
  };
}

function printOutput(message) { console.log(message); }
function printDebug(data) { console.error('debug:' + require('util').inspect(data, false, null)); }

function executeMainLogic() {
  const numElements = readInteger();
  const sortedValues = readIntegerArray();

  sortedValues.sort((a, b) => a - b);

  let currentLevelValues = [];
  const initialValue = sortedValues.pop();
  currentLevelValues.push(initialValue);

  for (let levelIndex = 1; levelIndex <= numElements; levelIndex++) {
    let nextLevelValues = [];
    const elementsToPopCount = 1 << levelIndex;

    for (let elementIndex = 0; elementIndex < elementsToPopCount; elementIndex++) {
      const poppedValue = sortedValues.pop();
      nextLevelValues.push(poppedValue);
    }

    for (let elementIndex = 0; elementIndex < nextLevelValues.length; elementIndex++) {
      if (currentLevelValues[elementIndex] <= nextLevelValues[elementIndex]) {
        printOutput("No");
        return;
      }
    }
    currentLevelValues = currentLevelValues.concat(nextLevelValues);
  }

  printOutput("Yes");
}
