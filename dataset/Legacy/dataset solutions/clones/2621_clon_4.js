const lineReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputHandlerInstance;
const rawInputLines = [];

lineReader.on('line', (line) => rawInputLines.push(line));
lineReader.on('close', () => {
  inputHandlerInstance = new InputProcessor(rawInputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

class InputProcessor {
  #lines;
  #currentPosition;

  constructor(inputArray) {
    this.#lines = inputArray;
    this.#currentPosition = 0;
  }

  hasRemaining() {
    return this.#currentPosition < this.#lines.length;
  }

  retrieveNext() {
    if (this.hasRemaining()) {
      return this.#lines[this.#currentPosition++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }
}

function replicateObject(source) { return (source instanceof Set) ? new Set(Array.from(source)) : JSON.parse(JSON.stringify(source)); }

const dataTransformers = new Map([
  [1, (val) => parseInt(val)],
  [2, (val) => val.split(' ')],
  [4, (val) => val.split(' ').map(Number)],
  [6, (val) => val.split('')],
  [7, (val) => val.split('').map(Number)],
  [8, (val) => val.join(' ')],
  [9, (val) => val.join('\n')],
  [0, (val) => val.join('')],
]);

function processConversion(value, conversionType) {
  try {
    const transformer = dataTransformers.get(conversionType);
    if (transformer) {
      return transformer(value);
    }
    return value;
  } catch (e) {
    return value;
  }
}

function retrieveInteger() { return processConversion(retrieveNextLine(), 1); }
function retrieveStringArray() { return processConversion(retrieveNextLine(), 2); }
function retrieveIntegerArray() { return processConversion(retrieveNextLine(), 4); }
function retrieveCharacterArray() { return processConversion(retrieveNextLine(), 6); }
function retrieveNextLine() { return inputHandlerInstance.retrieveNext(); }
function hasRemainingLines() { return inputHandlerInstance.hasRemaining(); }

function displayOutput(content) { console.log(content); }
function logDebug(content) { console.error('debug:' + require('util').inspect(content, false, null)); }

function executeMainLogic() {
  const upperLimit = retrieveInteger();

  const collectedResults = Array.from({ length: upperLimit - 1 }, (_, firstIdx) => {
    return Array.from({ length: upperLimit - (firstIdx + 1) }, (_, offset) => {
      const secondIdx = firstIdx + 1 + offset;
      const xorValue = firstIdx ^ secondIdx;

      return Array.from({ length: 10 }, (_, bitPos) => bitPos + 1)
        .filter(bitVal => (xorValue >> (bitVal - 1)) & 1);
    });
  }).flat(2);

  displayOutput(processConversion(collectedResults, 9));
}
