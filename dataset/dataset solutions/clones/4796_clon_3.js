var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLinesBuffer = [];

inputReader.on('line', function(currentLine){
  inputLinesBuffer.push(currentLine);
});

inputReader.on('close', function(){
  inputHandler = initializeInputHandler(inputLinesBuffer);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function deepCopyObject(sourceObj){
  return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));
}

function readNextInteger(){ return convertInput(getNextInputLine(), 1); }
function readNextStringArray(){ return convertInput(getNextInputLine(), 2); }
function readNextIntegerArray(){ return convertInput(getNextInputLine(), 4); }
function readNextCharacterArray(){ return convertInput(getNextInputLine(), 6); }

function getNextInputLine(){ return inputHandler.next(); }
function hasMoreInput(){ return inputHandler.hasMoreInput(); }

function initializeInputHandler(lines){
  const handlerState = {
    list : lines,
    currentIndex : 0,
    totalLines : lines.length,
    hasMoreInput : function(){
      return (this.currentIndex < this.totalLines);
    },
    next : function(){
      if(this.hasMoreInput()){
        return this.list[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
  return handlerState;
}

function printOutput(data){ console.log(data); }
function printDebugError(data){ console.error('debug:' + require('util').inspect(data,false,null)); }

function convertInput(inputValue, conversionType){
  try {
    switch(conversionType){
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
  } catch(e) {
    return inputValue;
  }
}

function executeMainLogic(){
  const getEvenPart = (num) => Math.floor(num / 2) * 2;
  const THREE_BLOCKS_BONUS = 3;

  const inputValuesArray = readNextIntegerArray();

  const [countI, countO, countT, countJ, countL, countS, countZ] = inputValuesArray;

  const evenI_for_calc1 = getEvenPart(countI);
  const evenJ_for_calc1 = getEvenPart(countJ);
  const evenL_for_calc1 = getEvenPart(countL);
  const calcResultOne = evenI_for_calc1 + evenJ_for_calc1 + evenL_for_calc1;

  const adjustedI_for_calc2 = countI - 1;
  const adjustedJ_for_calc2 = countJ - 1;
  const adjustedL_for_calc2 = countL - 1;

  const evenI_for_calc2 = getEvenPart(adjustedI_for_calc2);
  const evenJ_for_calc2 = getEvenPart(adjustedJ_for_calc2);
  const evenL_for_calc2 = getEvenPart(adjustedL_for_calc2);
  const calcResultTwo = evenI_for_calc2 + evenJ_for_calc2 + evenL_for_calc2 + THREE_BLOCKS_BONUS;

  const finalResult = Math.max(calcResultOne, calcResultTwo) + countO;

  printOutput(finalResult);
}
