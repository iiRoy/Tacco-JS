var inputHandler = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor; var receivedLines = [];
inputHandler.on('line', function(currentLine){receivedLines.push(currentLine);});
inputHandler.on('close', function(){
  inputProcessor = createInputProcessor(receivedLines);
  console.error("\n");
  var startTime = Date.now();
  executePrimaryLogic();
  var endTime = Date.now() - startTime;
  logErrorDebug("time : " + endTime + "ms");
  logErrorDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function deepCopyObject(sourceObject){return JSON.parse(JSON.stringify(sourceObject));}
function readNextInt(){return processInputConversion(fetchNextInputToken(),1);}
function readNextStringArray(){return processInputConversion(fetchNextInputToken(),2);}
function readNextIntArray(){return processInputConversion(fetchNextInputToken(),4);}
function readNextCharArray(){return processInputConversion(fetchNextInputToken(),6);}
function fetchNextInputToken(){return inputProcessor.fetchNextToken();}
function hasMoreInputTokens(){return inputProcessor.hasMoreInputTokens();}
function createInputProcessor(inputData){  
  return {
    lineList : inputData, currentIdx : 0, maxLines : inputData.length,
    hasMoreInputTokens : function(){return (this.currentIdx < this.maxLines);},
    fetchNextToken : function(){
      if(this.hasMoreInputTokens()){
        return this.lineList[this.currentIdx++];
      }else{
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}
function outputResult(dataToOutput){console.log(dataToOutput);}
function logErrorDebug(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,null));}
function processInputConversion(inputValue, conversionType){
  try{
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
  }catch(e){
    return inputValue;
  }
}

function executePrimaryLogic(){
  var initialCount = readNextInt();
  var currentSequence = readNextCharArray();
  var maximumOverlap = 0;
  
  while(currentSequence.length > 0){
    const sequenceLength = currentSequence.length;
    var zAlgorithmArray = new Array(sequenceLength);
    zAlgorithmArray[0] = sequenceLength;
    
    var currentPosition = 1;
    var matchLength = 0;
    
    while(currentPosition < sequenceLength){
      while((currentPosition + matchLength) < sequenceLength && 
            (currentSequence[matchLength] === currentSequence[currentPosition + matchLength])){
        matchLength++;
      }
      zAlgorithmArray[currentPosition] = matchLength;
      
      if(matchLength === 0){
        currentPosition++;
        continue;
      }
      
      var offsetIndex = 1;
      while((currentPosition + offsetIndex) < sequenceLength && (offsetIndex + zAlgorithmArray[offsetIndex] < matchLength)){
        zAlgorithmArray[currentPosition + offsetIndex] = zAlgorithmArray[offsetIndex];
        offsetIndex++;
      }
      currentPosition += offsetIndex;
      matchLength -= offsetIndex;
    }
    
    for(let scanIndex = sequenceLength - 1; scanIndex >= 1; --scanIndex){
      if(zAlgorithmArray[scanIndex] <= sequenceLength / 2){
        maximumOverlap = Math.max(maximumOverlap, zAlgorithmArray[scanIndex]);
      }
    }
    
    currentSequence.splice(0, 1);
  }
  
  outputResult(maximumOverlap);
}
