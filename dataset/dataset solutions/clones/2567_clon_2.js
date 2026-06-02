var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor;
var inputLinesBuffer = [];

inputReader.on('line', function(currentLine){
  inputLinesBuffer.push(currentLine);
});

inputReader.on('close', function(){
  inputProcessor = initializeInputHandler(inputLinesBuffer);
  console.error("\n");
  var startTime = Date.now();
  executeAlgorithm();
  var elapsedTime = Date.now() - startTime;
  logDebugInfo("time : " + elapsedTime + "ms");
  logDebugInfo("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

function getNextInteger(){ return convertInputData(fetchNextToken(), 1); }
function getNextStringArray(){ return convertInputData(fetchNextToken(), 2); }
function getNextIntegerArray(){ return convertInputData(fetchNextToken(), 4); }
function getNextCharacterArray(){ return convertInputData(fetchNextToken(), 6); }

function fetchNextToken(){ return inputProcessor.retrieveNextElement(); }
function checkHasNextToken(){ return inputProcessor.hasMoreElements(); }

function initializeInputHandler(rawInputData){
  return {
    dataCollection : rawInputData,
    currentPosition : 0,
    maximumEntries : rawInputData.length,
    hasMoreElements : function(){
      return (this.currentPosition < this.maximumEntries);
    },
    retrieveNextElement : function(){
      if(this.hasMoreElements()){
        return this.dataCollection[this.currentPosition++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}

function printResult(outputValue){
  console.log(outputValue);
}

function logDebugInfo(debugMessage){
  console.error("debug:" + require("util").inspect(debugMessage, false, null));
}

function convertInputData(inputValue, conversionType){
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
  } catch(error) {
    return inputValue;
  }
}

function executeAlgorithm(){
  var inputCount = getNextInteger();
  var charSequence = getNextCharacterArray();
  var maxOverlapLength = 0;

  while(charSequence.length > 0){
    var zArray = new Array(charSequence.length);
    zArray[0] = charSequence.length;
    var idx1 = 1;
    var idx2 = 0;
    while(idx1 < charSequence.length){
      while((idx1 + idx2) < charSequence.length && (charSequence[idx2] === charSequence[idx1 + idx2])){
        idx2++;
      }
      zArray[idx1] = idx2;
      if(idx2 === 0){
        idx1++;
        continue;
      }
      var idx3 = 1;
      while((idx1 + idx3) < charSequence.length && (idx3 + zArray[idx3] < idx2)){
        zArray[idx1 + idx3] = zArray[idx3];
        idx3++;
      }
      idx1 += idx3;
      idx2 -= idx3;
    }
    for(var loopCounter = charSequence.length - 1; loopCounter >= charSequence.length / 2; loopCounter--){
      maxOverlapLength = Math.max(maxOverlapLength, zArray[loopCounter]);
    }
    charSequence.shift();
  }

  printResult(maxOverlapLength);
}
