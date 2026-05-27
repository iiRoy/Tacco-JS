const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let rawInputLines = [];
inputReader.on('line', (line) => { rawInputLines.push(line); });
inputReader.on('close', () => {
  const inputHandlerInstance = createInputProcessor(rawInputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic(inputHandlerInstance);
});

function duplicateStructure(source) {
  return (source instanceof Set) ? new Set([...source]) : JSON.parse(JSON.stringify(source));
}

class InputHandler {
  constructor(lines) {
    this.dataLines = lines;
    this.currentPosition = 0;
    this.totalLines = lines.length;
  }

  canPullMore() {
    return (this.currentPosition < this.totalLines);
  }

  pullNext() {
    if (this.canPullMore()) {
      return this.dataLines[this.currentPosition++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }
}

function createInputProcessor(lines) {
  return new InputHandler(lines);
}

let globalInputSource;

function getNextToken() {
  return globalInputSource.pullNext();
}

function hasMoreTokens() {
  return globalInputSource.canPullMore();
}

const conversionMap = new Map([
  [1, (item) => parseInt(item)],
  [2, (item) => item.split(' ')],
  [4, (item) => item.split(' ').map(Number)],
  [6, (item) => item.split('')],
  [7, (item) => item.split('').map(Number)],
  [8, (item) => item.join(' ')],
  [9, (item) => item.join('\n')],
  [0, (item) => item.join('')]
]);

function convertInput(item, conversionType) {
  try {
    const converter = conversionMap.get(conversionType);
    return converter ? converter(item) : item;
  } catch (e) {
    return item;
  }
}

function readInteger() { return convertInput(getNextToken(), 1); }
function readStringArray() { return convertInput(getNextToken(), 2); }
function readIntegerArray() { return convertInput(getNextToken(), 4); }
function readCharacterArray() { return convertInput(getNextToken(), 6); }

function printLine(content) { console.log(content); }
function printDebug(content) { console.error('debug:' + require('util').inspect(content, false, null)); }

function executeMainLogic(inputSource) {
  globalInputSource = inputSource;

  const limitN = readInteger();

  Array.from({ length: limitN - 1 }).forEach((_, firstIndex) => {
    Array.from({ length: limitN - (firstIndex + 1) }).forEach((_, secondIndexOffset) => {
      const secondIndex = firstIndex + 1 + secondIndexOffset;

      Array.from({ length: 10 }).forEach((_, bitPosition) => {
        const bitOfFirst = (firstIndex >> bitPosition) & 1;
        const valueFromSecond = (secondIndex >> bitPosition) & bitPosition;

        if (bitOfFirst !== valueFromSecond) {
          printLine(bitPosition + 1);
        }
      });
    });
  });
}
