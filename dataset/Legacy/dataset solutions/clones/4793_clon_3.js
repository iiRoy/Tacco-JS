const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputProcessor;
const bufferedLines = [];

inputReader.on('line', (line) => {
  bufferedLines.push(line);
});

inputReader.on('close', () => {
  inputProcessor = createInputProcessor(bufferedLines);
  console.error('\n↑入力 ↓出力');
  executeProblemSolver();
});

function deepCopyValue(value) {
  return (value instanceof Set) ? new Set(Array.from(value)) : JSON.parse(JSON.stringify(value));
}

class InputProcessor {
  constructor(lines) {
    this.lines = lines;
    this.currentIndex = 0;
    this.maxLines = lines.length;
  }

  hasMoreLines() {
    return (this.currentIndex < this.maxLines);
  }

  fetchNextLine() {
    if (this.hasMoreLines()) {
      return this.lines[this.currentIndex++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }
}

function createInputProcessor(lines) {
  return new InputProcessor(lines);
}

function readNextInt() { return processInputConversion(fetchNextLine(), 1); }
function readNextStrArray() { return processInputConversion(fetchNextLine(), 2); }
function readNextIntArray() { return processInputConversion(fetchNextLine(), 4); }
function readNextCharArray() { return processInputConversion(fetchNextLine(), 6); }

function fetchNextLine() { return inputProcessor.fetchNextLine(); }
function hasMoreLines() { return inputProcessor.hasMoreLines(); }

function outputResult(data) { console.log(data); }
function outputDebug(data) { console.error('debug:' + require('util').inspect(data, false, null)); }

function processInputConversion(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function executeProblemSolver() {
  const inputValues = readNextIntArray();
  const [valA, valO, valT, valJ, valL, valS, valZ] = inputValues;

  const getEvenFloor = (num) => Math.floor(num / 2) * 2;

  const evenSumForStrategy1 = getEvenFloor(valA) + getEvenFloor(valJ) + getEvenFloor(valL);

  const evenSumForStrategy2Adjusted = getEvenFloor(valA - 1) + getEvenFloor(valJ - 1) + getEvenFloor(valL - 1);

  const bonusBlocksForStrategy2 = 6;

  const potentialOutputStrategy1 = evenSumForStrategy1;
  const potentialOutputStrategy2 = evenSumForStrategy2Adjusted + bonusBlocksForStrategy2;

  const maxStrategyResult = Math.max(potentialOutputStrategy1, potentialOutputStrategy2);

  outputResult(maxStrategyResult + valO);
}
