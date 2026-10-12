const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputHandler;
const inputLines = [];

inputReader.on('line', (lineContent) => {
  inputLines.push(lineContent);
});

inputReader.on('close', () => {
  inputHandler = initializeInputHandler(inputLines);
  console.error('\n↑入力 ↓出力');
  executeSolution();
});

function createDeepCopy(originalObject) {
  if (originalObject instanceof Set) {
    return new Set(Array.from(originalObject));
  }
  return JSON.parse(JSON.stringify(originalObject));
}

class InputProcessor {
  constructor(linesArray) {
    this.dataLines = linesArray;
    this.currentIndex = 0;
    this.totalLines = linesArray.length;
  }

  hasMoreTokens() {
    return this.currentIndex < this.totalLines;
  }

  getNextToken() {
    if (this.hasMoreTokens()) {
      return this.dataLines[this.currentIndex++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }
}

function initializeInputHandler(lines) {
  return new InputProcessor(lines);
}

const InputConverter = {
  toInteger: (val) => parseInt(val, 10),
  toStringArray: (val) => val.split(' '),
  toIntArray: (val) => val.split(' ').map(Number),
  toCharList: (val) => val.split(''),
  toCharIntList: (val) => val.split('').map(Number),
  joinWithSpace: (arr) => arr.join(' '),
  joinWithNewline: (arr) => arr.join('\n'),
  joinWithoutSeparator: (arr) => arr.join('')
};

function safeConvert(value, converterFunction) {
  try {
    return converterFunction(value);
  } catch (e) {
    return value;
  }
}

function getNextToken() {
  return inputHandler.getNextToken();
}

function hasMoreTokens() {
  return inputHandler.hasMoreTokens();
}

function readNextInt() {
  return safeConvert(getNextToken(), InputConverter.toInteger);
}

function readNextStrArray() {
  return safeConvert(getNextToken(), InputConverter.toStringArray);
}

function readNextIntArray() {
  return safeConvert(getNextToken(), InputConverter.toIntArray);
}

function readNextCharArray() {
  return safeConvert(getNextToken(), InputConverter.toCharList);
}

function printResult(content) {
  console.log(content);
}

function logDebugError(message) {
  console.error('debug:' + require('util').inspect(message, false, null));
}

function executeSolution() {
  const firstLineData = readNextIntArray();
  const maxMonth = firstLineData[0];
  const maxDay = firstLineData[1];

  let validDateCount = 0;
  const MIN_DIGIT_THRESHOLD = 2;

  const isValidSpecialDate = (month, day) => {
    const tensDigit = Math.floor(day / 10);
    const unitsDigit = day % 10;

    const isTensDigitValid = tensDigit >= MIN_DIGIT_THRESHOLD;
    const isUnitsDigitValid = unitsDigit >= MIN_DIGIT_THRESHOLD;
    const productMatchesMonth = (tensDigit * unitsDigit) === month;

    return isTensDigitValid && isUnitsDigitValid && productMatchesMonth;
  };

  for (let currentMonth = 1; currentMonth <= maxMonth; currentMonth++) {
    for (let currentDay = 22; currentDay <= maxDay; currentDay++) {
      if (isValidSpecialDate(currentMonth, currentDay)) {
        validDateCount++;
      }
    }
  }

  printResult(validDateCount);
}
