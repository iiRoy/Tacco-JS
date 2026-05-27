const inputLineReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputDataHandler;
let collectedInputLines = [];

inputLineReader.on('line', function(lineContent){
  collectedInputLines.push(lineContent);
});

inputLineReader.on('close', function(){
  inputDataHandler = setupInputHandler(collectedInputLines);
  console.error("\n");
  const operationStartTime = Date.now();
  runApplicationLogic();
  const elapsedTime = Date.now() - operationStartTime;
  emitDebugLog("time : " + (elapsedTime) + "ms");
  emitDebugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCloneObject(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

function retrieveNextInt(){ return performTypeConversion(fetchNextLine(), 1); }
function retrieveNextStrArray(){ return performTypeConversion(fetchNextLine(), 2); }
function retrieveNextIntArray(){ return performTypeConversion(fetchNextLine(), 4); }
function retrieveNextCharArray(){ return performTypeConversion(fetchNextLine(), 6); }

function fetchNextLine(){ return inputDataHandler.fetchNextLine(); }
function hasPendingInput(){ return inputDataHandler.hasPendingInput(); }

function setupInputHandler(rawLines){
  const handler = {
    sourceLines : rawLines,
    currentPosition : 0,
    totalAvailableLines : rawLines.length,
    hasPendingInput : function(){
      return (this.currentPosition < this.totalAvailableLines);
    },
    fetchNextLine : function(){
      if(this.hasPendingInput()){
        return this.sourceLines[this.currentPosition++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
  return handler;
}

function emitOutput(logMessage){
  console.log(logMessage);
}

function emitDebugLog(logMessage){
  console.error("debug:" + require("util").inspect(logMessage,false,null));
}

function performTypeConversion(valueToConvert, conversionMode){
  try {
    let conversionResult;
    switch(conversionMode){
      case 1:
        conversionResult = parseInt(valueToConvert);
        break;
      case 2:
        conversionResult = valueToConvert.split(" ");
        break;
      case 4:
        conversionResult = valueToConvert.split(" ").map(Number);
        break;
      case 6:
        conversionResult = valueToConvert.split("");
        break;
      case 7:
        conversionResult = valueToConvert.split("").map(Number);
        break;
      case 8:
        conversionResult = valueToConvert.join(" ");
        break;
      case 9:
        conversionResult = valueToConvert.join("\n");
        break;
      case 0:
        conversionResult = valueToConvert.join("");
        break;
      default:
        conversionResult = valueToConvert;
    }
    return conversionResult;
  } catch(e){
    return valueToConvert;
  }
}

function runApplicationLogic(){
  const messagesToDisplay = [
    "Yes",
    4,
    "3 1 2 3",
    "3 1 4 5",
    "3 2 4 6",
    "3 3 5 6"
  ];

  const processAndEmitMessages = (messageList) => {
    for (let i = 0; i < messageList.length; i++) {
      emitOutput(messageList[i]);
    }
  };

  processAndEmitMessages(messagesToDisplay);
}
