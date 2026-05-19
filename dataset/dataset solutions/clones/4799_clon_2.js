const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataHandler;
const inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataHandler = initializeInput(inputLines);
  console.error('\n');
  const startTime = Date.now();
  executeMainLogic();
  const elapsedTime = Date.now() - startTime;
  logDebugMessage('time : ' + elapsedTime + 'ms');
  logDebugMessage('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function createDeepCopy(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function getNextInteger(){
  return convertInput(retrieveNextItem(), 1);
}

function getNextStringArray(){
  return convertInput(retrieveNextItem(), 2);
}

function getNextIntegerArray(){
  return convertInput(retrieveNextItem(), 4);
}

function getNextCharacterArray(){
  return convertInput(retrieveNextItem(), 6);
}

function retrieveNextItem(){
  return dataHandler.retrieveNextItem();
}

function hasMoreItems(){
  return dataHandler.hasMoreItems();
}

function initializeInput(inputData){
  return {
    sourceList : inputData,
    currentIndex : 0,
    maximumLength : inputData.length,
    hasMoreItems : function(){
      return (this.currentIndex < this.maximumLength);
    },
    retrieveNextItem : function(){
      if(this.hasMoreItems()){
        return this.sourceList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function printOutput(message){
  console.log(message);
}

function logDebugMessage(debugInfo){
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

function convertInput(itemToConvert, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(itemToConvert);
      case 2: return itemToConvert.split(' ');
      case 4: return itemToConvert.split(' ').map(Number);
      case 6: return itemToConvert.split('');
      case 7: return itemToConvert.split('').map(Number);
      case 8: return itemToConvert.join(' ');
      case 9: return itemToConvert.join('\n');
      case 0: return itemToConvert.join('');
      default: return itemToConvert;
    }
  } catch(error) {
    return itemToConvert;
  }
}

function executeMainLogic(){
  const dimensionSize = getNextInteger();
  const initialSequence = getNextIntegerArray();
  const resultGrid = new Array(dimensionSize * dimensionSize);

  for(let outerLoopIdx = 0; outerLoopIdx < dimensionSize; outerLoopIdx++){
    resultGrid[initialSequence[outerLoopIdx] - 1] = outerLoopIdx + 1;
  }

  for(let currentVal = 2; currentVal <= dimensionSize; currentVal++){
    let currentCount = currentVal - 1;
    for(let innerLoopIdx = 0; innerLoopIdx < dimensionSize * dimensionSize; innerLoopIdx++){
      if(resultGrid[innerLoopIdx] === null || resultGrid[innerLoopIdx] === undefined){
        currentCount--;
        resultGrid[innerLoopIdx] = currentVal;
        if(currentCount === 0){
          break;
        }
      } else if(resultGrid[innerLoopIdx] === currentVal){
        printOutput("No");
        return;
      }
    }
  }

  for(let currentVal = 1; currentVal < dimensionSize; currentVal++){
    let currentCount = dimensionSize - currentVal;
    for(let innerLoopIdx = initialSequence[currentVal - 1]; innerLoopIdx < dimensionSize * dimensionSize; innerLoopIdx++){
      if(resultGrid[innerLoopIdx] === null || resultGrid[innerLoopIdx] === undefined){
        currentCount--;
        resultGrid[innerLoopIdx] = currentVal;
        if(currentCount === 0){
          break;
        }
      }
    }
  }

  for(let outerLoopIdx = 0; outerLoopIdx < dimensionSize * dimensionSize; outerLoopIdx++){
    if(resultGrid[outerLoopIdx] === null || resultGrid[outerLoopIdx] === undefined){
      printOutput("No");
      return;
    }
  }

  printOutput("Yes");
  printOutput(convertInput(resultGrid, 8));
}
