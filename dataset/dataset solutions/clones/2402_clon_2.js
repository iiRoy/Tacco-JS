var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataHandler = initializeInputProcessor(inputLines);
  console.error('\n');
  var startTime = Date.now();
  executePrimaryLogic();
  var endTime = Date.now() - startTime;
  logDebugMessage('execution time : ' + endTime + 'ms');
  logDebugMessage('memory usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function retrieveNextInteger(){
  return performTypeConversion(fetchNextInputToken(), 1);
}

function retrieveNextStringArray(){
  return performTypeConversion(fetchNextInputToken(), 2);
}

function retrieveNextIntegerArray(){
  return performTypeConversion(fetchNextInputToken(), 4);
}

function retrieveNextCharacterArray(){
  return performTypeConversion(fetchNextInputToken(), 6);
}

function fetchNextInputToken(){
  return dataHandler.fetchNextInputToken();
}

function checkHasMoreInput(){
  return dataHandler.checkHasMoreInput();
}

function initializeInputProcessor(lines){  
  return {
    sourceDataLines : lines,
    currentDataIndex : 0,
    maximumDataCount : lines.length,
    checkHasMoreInput : function(){
      return (this.currentDataIndex < this.maximumDataCount);
    },
    fetchNextInputToken : function(){
      if(this.checkHasMoreInput()){
        return this.sourceDataLines[this.currentDataIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function displayResult(message){
  console.log(message);
}

function logDebugMessage(debugContent){
  console.error('debug:' + require('util').inspect(debugContent, false, null));
}

function performTypeConversion(inputData, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputData);
      case 2: return inputData.split(' ');
      case 4: return inputData.split(' ').map(Number);
      case 6: return inputData.split('');
      case 7: return inputData.split('').map(Number);
      case 8: return inputData.join(' ');
      case 9: return inputData.join('\n');
      case 0: return inputData.join('');
      default: return inputData;
    }
  } catch(error) {
    return inputData;
  }
}

function executePrimaryLogic(){
  var initialParameters = retrieveNextIntegerArray();
  var totalPathLength = initialParameters[0];
  var maximumStepSize = initialParameters[1];
  var pathDescription = fetchNextInputToken();
  var jumpSequence = [];
  var currentPathPosition = totalPathLength;

  while(true){
    logDebugMessage(currentPathPosition);
    var canMakeValidJump = false;
    var selectedJumpDistance = 0;
    var distanceFromCurrent = 0;

    for(var backwardScanIndex = currentPathPosition - 1; backwardScanIndex > (currentPathPosition - maximumStepSize - 1) && backwardScanIndex >= 0; backwardScanIndex--){
      distanceFromCurrent++;
      if(pathDescription[backwardScanIndex] === "0"){
        canMakeValidJump = true;
        selectedJumpDistance = distanceFromCurrent;
      }
    }

    currentPathPosition -= selectedJumpDistance;

    if(!canMakeValidJump){
      displayResult(-1);
      return;
    } else {
      jumpSequence.push(selectedJumpDistance);
    }

    if(currentPathPosition === 0){
      break;
    }
  }

  jumpSequence.sort(function(){ return -1; });
  displayResult(performTypeConversion(jumpSequence, 8));
}
