var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor;
var inputLines = [];

inputReader.on('line', function(lineContent){
    inputLines.push(lineContent);
});

inputReader.on('close', function(){
  inputProcessor = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executeCoreLogic();
});

function createDeepCopy(sourceObject){
    return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function readInteger(){ return convertInput(getNextLine(), 1); }
function readStringArray(){ return convertInput(getNextLine(), 2); }
function readIntegerArray(){ return convertInput(getNextLine(), 4); }
function readCharacterArray(){ return convertInput(getNextLine(), 6); }

function getNextLine(){ return inputProcessor.next(); }
function hasMoreLines(){ return inputProcessor.hasMoreLines(); }

function initializeInputProcessor(linesData){
  return {
    lineList : linesData,
    currentIndex : 0,
    maxLines : linesData.length,
    hasMoreLines : function(){ return (this.currentIndex < this.maxLines); },
    next : function(){
        if(this.hasMoreLines()){
            return this.lineList[this.currentIndex++];
        } else {
            throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
        }
    }
  };
}

function printOutput(dataToPrint){ console.log(dataToPrint); }
function printDebugError(debugData){ console.error('debug:' + require('util').inspect(debugData,false,null)); }

const conversionHandlers = {
    1: (val) => parseInt(val),
    2: (val) => val.split(' '),
    4: (val) => val.split(' ').map(Number),
    6: (val) => val.split(''),
    7: (val) => val.split('').map(Number),
    8: (val) => val.join(' '),
    9: (val) => val.join('\n'),
    0: (val) => val.join('')
};

function convertInput(inputValue, conversionType){
    try {
        const handler = conversionHandlers[conversionType];
        return handler ? handler(inputValue) : inputValue;
    } catch(e) {
        return inputValue;
    }
}

function executeCoreLogic(){
  const count = readInteger();
  const numbers = readIntegerArray();

  numbers.sort((a, b) => a - b);

  const firstElement = numbers[0];
  const lastElement = numbers[count - 1];

  const intermediateNumbers = numbers.slice(1, count - 1);
  const intermediateAbsoluteSum = intermediateNumbers.reduce((accumulator, currentVal) => accumulator + Math.abs(currentVal), 0);

  const totalSum = -firstElement + lastElement + intermediateAbsoluteSum;
  printOutput(totalSum);

  function processNumberAndRecord(currentNum, currentLeftAcc, currentRightAcc) {
      let updatedLeftAcc = currentLeftAcc;
      let updatedRightAcc = currentRightAcc;
      let operationString;

      if (currentNum < 0) {
          operationString = `${currentRightAcc} ${currentNum}`;
          updatedRightAcc -= currentNum;
      } else {
          operationString = `${currentLeftAcc} ${currentNum}`;
          updatedLeftAcc -= currentNum;
      }
      return { updatedLeftAcc, updatedRightAcc, operationString };
  }

  const operationSteps = [];
  let leftAccumulator = firstElement;
  let rightAccumulator = lastElement;

  for (let idx = 1; idx < count - 1; idx++) {
    const currentNumber = numbers[idx];
    const result = processNumberAndRecord(currentNumber, leftAccumulator, rightAccumulator);
    leftAccumulator = result.updatedLeftAcc;
    rightAccumulator = result.updatedRightAcc;
    operationSteps.push(result.operationString);
  }

  operationSteps.push(`${rightAccumulator} ${leftAccumulator}`);

  printOutput(convertInput(operationSteps, 9));
}
