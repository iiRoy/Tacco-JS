let inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let dataHandler;
let inputLines = [];

inputReader.on('line', function(currentLine){
    inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataHandler = initializeInputHandler(inputLines);
  console.error("\n");

  const startTime = Date.now();
  executeMainLogic();
  const endTime = Date.now();
  const durationMs = endTime - startTime;

  printDebugError(`time : ${durationMs}ms`);

  const memoryStats = process.memoryUsage();
  const heapTotalBytes = memoryStats.heapTotal;
  const memoryKb = Math.round(heapTotalBytes / 1024);
  printDebugError(`memory : ${memoryKb}KB`);
});

function createDeepCopy(sourceObject){
    return JSON.parse(JSON.stringify(sourceObject));
}

function getNextInt(){
    return convertInput(fetchNext(), 1);
}

function getNextStrArray(){
    return convertInput(fetchNext(), 2);
}

function getNextIntArray(){
    return convertInput(fetchNext(), 4);
}

function getNextCharArray(){
    return convertInput(fetchNext(), 6);
}

function fetchNext(){
    return dataHandler.next();
}

function hasMoreInput(){
    return dataHandler.hasMoreInput();
}

function initializeInputHandler(sourceInput){
  const inputProcessor = {
    sourceLines : sourceInput,
    currentIdx : 0,
    maxLines : sourceInput.length,
    hasMoreInput : function(){
        return (this.currentIdx < this.maxLines);
    },
    next : function(){
        if(this.hasMoreInput()){
            const nextValue = this.sourceLines[this.currentIdx];
            this.currentIdx++;
            return nextValue;
        } else {
            throw "ArrayIndexOutOfBoundsException ‚There is no more input";
        }
    }
  };
  return inputProcessor;
}

function printOutput(outputString){
    console.log(outputString);
}

function printDebugError(debugMessage){
    const debugPrefix = "debug:";
    console.error(debugPrefix + require("util").inspect(debugMessage, false, null));
}

//param "no" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function convertInput(inputValue, conversionType){
    try {
        let processedResult;
        switch(conversionType){
            case 1:
                processedResult = parseInt(inputValue);
                break;
            case 2:
                processedResult = inputValue.split(" ");
                break;
            case 4:
                const spaceSeparatedParts = inputValue.split(" ");
                processedResult = spaceSeparatedParts.map(Number);
                break;
            case 6:
                processedResult = inputValue.split("");
                break;
            case 7:
                const characterArray = inputValue.split("");
                processedResult = characterArray.map(Number);
                break;
            case 8:
                processedResult = inputValue.join(" ");
                break;
            case 9:
                processedResult = inputValue.join("\n");
                break;
            case 0:
                processedResult = inputValue.join("");
                break;
            default:
                processedResult = inputValue;
        }
        return processedResult;
    } catch(e){
        return inputValue;
    }
}

function executeMainLogic(){
  const messagesToPrint = ["aaa", "aab", "abb", "abc"];
  for (let i = 0; i < messagesToPrint.length; i++) {
    printOutput(messagesToPrint[i]);
  }
}
