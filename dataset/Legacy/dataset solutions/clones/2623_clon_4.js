const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputSourceData;
let lineBuffer = [];

inputReader.on('line', (currentLine) => { lineBuffer.push(currentLine); });
inputReader.on('close', () => {
  inputSourceData = createInputReader(lineBuffer);
  console.error('\n↑入力 ↓出力');
  executeSolution();
});

function deepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function readInteger() { return transformInput(fetchNextLine(), 1); }
function readStringArray() { return transformInput(fetchNextLine(), 2); }
function readIntegerArray() { return transformInput(fetchNextLine(), 4); }
function readCharacterArray() { return transformInput(fetchNextLine(), 6); }

function fetchNextLine() { return inputSourceData.retrieveNext(); }
function hasMoreLines() { return inputSourceData.canAdvance(); }

function createInputReader(lines) {
  let currentLineIndex = 0;
  const dataLines = lines;
  const totalLines = lines.length;

  return {
    canAdvance: () => (currentLineIndex < totalLines),
    retrieveNext: () => {
      if (currentLineIndex < totalLines) {
        return dataLines[currentLineIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function printLine(content) { console.log(content); }

function logDebug(data) { console.error('debug:' + require('util').inspect(data, false, null)); }

const inputTransformers = new Map([
  [1, (val) => parseInt(val)],
  [2, (val) => val.split(' ')],
  [4, (val) => val.split(' ').map(Number)],
  [6, (val) => val.split('')],
  [7, (val) => val.split('').map(Number)],
  [8, (val) => val.join(' ')],
  [9, (val) => val.join('\n')],
  [0, (val) => val.join('')]
]);

function transformInput(inputValue, transformationType) {
  try {
    const transformer = inputTransformers.get(transformationType);
    if (transformer) {
      return transformer(inputValue);
    }
    return inputValue;
  } catch (e) {
    return inputValue;
  }
}

function executeSolution() {
  const countValue = readInteger();

  Array.from({ length: countValue - 1 }, (_, valA) => valA)
    .flatMap(valA =>
      Array.from({ length: countValue - (valA + 1) }, (_, offset) => valA + 1 + offset)
        .map(valB => ({ valA, valB }))
    )
    .forEach(({ valA, valB }) => {
      const xorResult = valA ^ valB;

      const differingBitPositions = Array.from({ length: 10 }, (_, bitIndex) => bitIndex)
        .filter(bitIndex => (xorResult >> bitIndex) & 1)
        .map(bitIndex => bitIndex + 1);

      printLine(transformInput(differingBitPositions, 8));
    });
}
