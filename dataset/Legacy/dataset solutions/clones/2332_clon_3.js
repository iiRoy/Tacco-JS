const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
const rawInputLines = [];
let inputProcessor;

inputReader.on('line', function(lineContent){rawInputLines.push(lineContent);});

inputReader.on('close', function(){
  inputProcessor = initializeInputProcessor(rawInputLines);
  
  const logExecutionMetrics = () => {
    console.error('\n');
    const startTime = Date.now();
    executeMainLogic();
    const endTime = Date.now() - startTime;
    logDebugMessage('Execution time: ' + endTime + 'ms');
    logDebugMessage('Memory usage: ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
  };

  logExecutionMetrics();
});

function deepCopyValue(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function getNextInteger(){ return convertInputToken(fetchNextToken(), 1); }
function getNextStringArray(){ return convertInputToken(fetchNextToken(), 2); }
function getNextIntegerArray(){ return convertInputToken(fetchNextToken(), 4); }
function getNextCharacterArray(){ return convertInputToken(fetchNextToken(), 6); }

function fetchNextToken(){ return inputProcessor.next(); }
function hasMoreTokens(){ return inputProcessor.hasMoreTokens(); }

function initializeInputProcessor(linesArray){
  const processorState = {
    dataList : linesArray,
    currentIdx : 0,
    maxIdx : linesArray.length
  };

  const hasMore = function(){
    return (processorState.currentIdx < processorState.maxIdx);
  };

  const getNext = function(){
    if(hasMore()){
      return processorState.dataList[processorState.currentIdx++];
    } else {
      throw new Error('ArrayIndexOutOfBoundsException ‚There is no more input');
    }
  };

  return {
    hasMoreTokens: hasMore,
    next: getNext
  };
}

function printResult(outputValue){ console.log(outputValue); }

const inspectUtil = require('util').inspect;
function logDebugMessage(message){ console.error('debug:' + inspectUtil(message, false, null)); }

function convertInputToken(inputValue, conversionType){
  try {
    switch(conversionType){
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
  } catch(e) {
    return inputValue;
  }
}

function executeMainLogic(){
  const totalElements = getNextInteger();
  const numberSequence = getNextIntegerArray();

  if (totalElements <= 0) {
    printResult(-1);
    return;
  }

  let missingCount = 0;
  let expectedValue = 1;

  for(let currentIndex = 0; currentIndex < totalElements; currentIndex++){
    const currentNumber = numberSequence[currentIndex];
    if(currentNumber === expectedValue){
      expectedValue++;
    } else {
      missingCount++;
    }
  }

  const finalResult = (missingCount === totalElements) ? -1 : missingCount;
  printResult(finalResult);
}
