const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataHandler;
const inputLines = [];

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  dataHandler = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function createDeepCopy(sourceObject) {
  if (sourceObject instanceof Set) {
    return new Set(Array.from(sourceObject));
  }
  return JSON.parse(JSON.stringify(sourceObject));
}

function readInteger() { return convertInput(getNextToken(), 1); }
function readStringArray() { return convertInput(getNextToken(), 2); }
function readIntegerArray() { return convertInput(getNextToken(), 4); }
function readCharacterArray() { return convertInput(getNextToken(), 6); }

function getNextToken() { return dataHandler.next(); }
function hasMoreTokens() { return dataHandler.hasMoreTokens(); }

function initializeInputProcessor(linesArray) {
  const processor = {
    lineList: linesArray,
    currentIndex: 0,
    maxLines: linesArray.length,
    hasMoreTokens: function() {
      return (this.currentIndex < this.maxLines);
    },
    next: function() {
      if (this.hasMoreTokens()) {
        return this.lineList[this.currentIndex++];
      } else {
        throw new Error('ArrayIndexOutOfBoundsException ‚There is no more input');
      }
    }
  };
  return processor;
}

function printOutput(data) { console.log(data); }

const utilModule = require('util');
function printDebug(debugData) {
  console.error('debug:' + utilModule.inspect(debugData, false, null));
}

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
  } catch (conversionError) {
    return inputValue;
  }
}

function executeMainLogic() {
  const inputCount = readInteger();

  const outerLoopLimit = inputCount - 1;
  const bitIterationLimit = 10;

  for (let outerLoopIdx = 0; outerLoopIdx < outerLoopLimit; outerLoopIdx++) {
    for (let innerLoopIdx = outerLoopIdx + 1; innerLoopIdx < inputCount; innerLoopIdx++) {
      for (let bitPosition = 0; bitPosition < bitIterationLimit; bitPosition++) {
        const firstOperandBit = (outerLoopIdx >> bitPosition) & 1;
        const secondOperandBit = (innerLoopIdx >> bitPosition) & bitPosition;

        if (firstOperandBit !== secondOperandBit) {
          printOutput(bitPosition + 1);
        }
      }
    }
  }
}
