const readlineInterface = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputProcessor;
const collectedInputLines = [];

readlineInterface.on('line', function(currentLine){
  collectedInputLines.push(currentLine);
});

const utilInspector = require('util').inspect;

function handleInputCloseEvent() {
  inputProcessor = initializeInputProcessor(collectedInputLines);
  console.error('\n');
  const startTime = Date.now();
  executeMainLogic();
  const elapsedTime = Date.now() - startTime;
  printDebug('time : ' + elapsedTime + 'ms');

  const memoryStats = process.memoryUsage();
  const heapTotalKilobytes = Math.round(memoryStats.heapTotal / 1024);
  printDebug('memory : ' + heapTotalKilobytes + 'KB');
}

readlineInterface.on('close', handleInputCloseEvent);

function createDeepClone(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function readNextInteger(){ return convertInput(getNextInputLine(), 1); }
function readNextStringArray(){ return convertInput(getNextInputLine(), 2); }
function readNextIntegerArray(){ return convertInput(getNextInputLine(), 4); }
function readNextCharacterArray(){ return convertInput(getNextInputLine(), 6); }

function getNextInputLine(){ return inputProcessor.next(); }
function hasMoreInputLines(){ return inputProcessor.hasMoreLines(); }

function initializeInputProcessor(linesArray){
  return {
    lineList : linesArray,
    currentIndex : 0,
    totalLines : linesArray.length,
    hasMoreLines : function(){ return (this.currentIndex < this.totalLines); },
    next : function(){
      if(this.hasMoreLines()){
        return this.lineList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function printOutput(message){ console.log(message); }
function printDebug(message){ console.error('debug:' + utilInspector(message, false, null)); }

function convertInput(inputValue, conversionType){
  try {
    let processedResult;
    switch(conversionType){
      case 1: processedResult = parseInt(inputValue); break;
      case 2: processedResult = inputValue.split(' '); break;
      case 4: processedResult = inputValue.split(' ').map(Number); break;
      case 6:
        const characters = inputValue.split('');
        processedResult = characters;
        break;
      case 7:
        const numericCharacters = inputValue.split('');
        processedResult = numericCharacters.map(Number);
        break;
      case 8: processedResult = inputValue.join(' '); break;
      case 9: processedResult = inputValue.join('\n'); break;
      case 0: processedResult = inputValue.join(''); break;
      default: processedResult = inputValue;
    }
    return processedResult;
  } catch(e){
    return inputValue;
  }
}

function calculateSumUpToN(n) {
  return n * (n + 1) / 2;
}

function executeMainLogic(){
  const limitValue = readNextInteger();
  let cumulativeSum = 0;

  for(let currentDivisor = 1; currentDivisor <= limitValue; currentDivisor++){
    const divisionResult = limitValue / currentDivisor;
    const integerQuotient = Math.floor(divisionResult);
    const sumOfArithmeticSeries = calculateSumUpToN(integerQuotient);
    const currentTermContribution = currentDivisor * sumOfArithmeticSeries;
    cumulativeSum += currentTermContribution;
  }
  printOutput(cumulativeSum);
}
