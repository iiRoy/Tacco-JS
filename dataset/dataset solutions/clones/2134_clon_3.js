const inputInterface = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputProcessor;
let collectedInputLines = [];

inputInterface.on('line', function(inputLine){
  collectedInputLines.push(inputLine);
});

inputInterface.on('close', function(){
  inputProcessor = createInputProcessor(collectedInputLines);
  const debugSeparatorMessage = '\n↑入力 ↓出力';
  console.error(debugSeparatorMessage);
  runApplicationLogic();
});

function createDeepCopy(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

class InputProcessor {
  constructor(linesArray) {
    this.lines = linesArray;
    this.currentIndex = 0;
    this.maxLines = linesArray.length;
  }

  hasMoreLines() {
    return this.currentIndex < this.maxLines;
  }

  fetchNextLine() {
    if (this.hasMoreLines()) {
      return this.lines[this.currentIndex++];
    } else {
      throw new Error('ArrayIndexOutOfBoundsException ‚There is no more input');
    }
  }
}

function readNextInteger(){ return applyInputConversion(fetchNextLine(), 1); }
function readNextStringArray(){ return applyInputConversion(fetchNextLine(), 2); }
function readNextIntegerArray(){ return applyInputConversion(fetchNextLine(), 4); }
function readNextCharacterArray(){ return applyInputConversion(fetchNextLine(), 6); }

function fetchNextLine(){ return inputProcessor.fetchNextLine(); }
function hasMoreLines(){ return inputProcessor.hasMoreLines(); }

function createInputProcessor(inputLines){
  return new InputProcessor(inputLines);
}

function outputResult(data){ console.log(data); }
function outputDebug(data){ console.error('debug:' + require('util').inspect(data,false,null)); }

const conversionHandlers = {
  1: (val) => parseInt(val),
  2: (val) => val.split(' '),
  4: (val) => val.split(' ').map(Number),
  6: (val) => val.split(''),
  7: (val) => val.split('').map(Number),
  8: (val) => val.join(' '),
  9: (val) => val.join('\n'),
  0: (val) => val.join(''),
};

function applyInputConversion(inputValue, conversionType){
  try {
    const handler = conversionHandlers[conversionType];
    return handler ? handler(inputValue) : inputValue;
  } catch(e) {
    return inputValue;
  }
}

function calculateDigitsInTargetBase(numberValue, baseValue) {
  return numberValue.toString(baseValue).length;
}

function runApplicationLogic(){
  const initialParameters = readNextIntegerArray();
  const decimalNumber = initialParameters[0];
  const targetRadix = initialParameters[1];

  const numberOfDigits = calculateDigitsInTargetBase(decimalNumber, targetRadix);
  outputResult(numberOfDigits);
}
