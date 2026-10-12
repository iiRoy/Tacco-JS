var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  logDebug("-----start-----");
  
  const startTime = new Date();
  executeMainLogic();
  const endTime = new Date();
  
  logExecutionMetrics(startTime, endTime);
});

function logExecutionMetrics(start, end) {
  const duration = end - start;
  logDebug("----- end -----");
  logDebug("time : " + (duration) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
}

function getNextInt(){return convertInput(getNextToken(),1);}
function getNextStrArray(){return convertInput(getNextToken(),2);}
function getNextIntArray(){return convertInput(getNextToken(),4);}
function getNextCharArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return dataProcessor.next();}
function hasMoreTokens(){return dataProcessor.hasNext();}

function initializeInputHandler(sourceInput){  
  const handlerInstance = {
    sourceLines : sourceInput,
    currentLineIndex : 0,
    totalLines : sourceInput.length,
    
    hasNext : function(){
      return (this.currentLineIndex < this.totalLines);
    },
    
    next : function(){
      if(!this.hasNext()){
        const outOfBoundsMessage = "ArrayIndexOutOfBoundsException これ以上ないよ";
        throw outOfBoundsMessage;
      } else {
        const currentLineContent = this.sourceLines[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineContent;
      }
    }
  };
  return handlerInstance;
}

function printResult(outputValue){console.log(outputValue);}
function logDebug(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,null));}

function convertInput(inputValue, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(Number);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch(e){
    return inputValue;
  }
}

function executeMainLogic(){
  const arraySize = getNextInt();
  const numberArray = getNextIntArray();

  const calculateSteppedSum = (startIndex, step, limit, arr) => {
    let currentSum = 0;
    for (let innerIndex = startIndex; innerIndex < limit; innerIndex += step) {
      currentSum += arr[innerIndex];
    }
    return currentSum;
  };

  const resetSteppedElements = (startIndex, step, limit, arr) => {
    const zeroValue = 0;
    for (let innerIndex = startIndex; innerIndex < limit; innerIndex += step) {
      arr[innerIndex] = zeroValue;
    }
  };

  const initialOuterIndex = arraySize - 1;
  for (let outerIndex = initialOuterIndex; outerIndex >= 0; outerIndex--) {
    const stepValue = outerIndex + 1;
    const currentSum = calculateSteppedSum(outerIndex, stepValue, arraySize, numberArray);

    if (currentSum < 0) {
      resetSteppedElements(outerIndex, stepValue, arraySize, numberArray);
    }
  }

  const sumAllElements = (arr) => {
    let total = 0;
    for (let k = 0; k < arr.length; k++) {
      total += arr[k];
    }
    return total;
  };
  
  let finalSum = sumAllElements(numberArray);

  printResult(finalSum);
}
