var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var inputLines = [];
inputReader.on('line', function(currentLine){inputLines.push(currentLine);});
inputReader.on('close', function(){
  inputProcessor = initializeInputProcessor(inputLines);
  logDebug("-----start-----");
  var startTime = new Date();
  executeMainLogic();
  var elapsedTime = new Date() - startTime;
  logDebug("----- end -----");
  logDebug("time : " + (elapsedTime) + "ms");
});
function getNextInt(){return convertInput(getNextLine(),1);} function getNextStrArray(){return convertInput(getNextLine(),2);}
function getNextIntArray(){return convertInput(getNextLine(),4);} function getNextCharArray(){return convertInput(getNextLine(),6);}
function getNextLine(){return inputProcessor.getNextLine();} function hasMoreLines(){return inputProcessor.hasMoreLines();}
function initializeInputProcessor(linesArray){  
  var processorInstance = {
    dataList : linesArray, currentIndex : 0, maxIndex : linesArray.length,
    hasMoreLines : function(){return (this.currentIndex < this.maxIndex);},
    getNextLine : function(){if(!this.hasMoreLines()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var currentInputLine = this.dataList[this.currentIndex];this.currentIndex++;return currentInputLine;}}
  };
  return processorInstance;
}
function printResult(outputValue){console.log(outputValue);}
function logDebug(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,null));}
function convertInput(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1:return parseInt(inputValue);
      case 2:return inputValue.split(" ");
      case 4:return inputValue.split(" ").map(Number);
      case 6:return inputValue.split("");
      case 7:return inputValue.split("").map(Number);
      case 8:return inputValue.join(" ");
      case 9:return inputValue.join("\n");
      case 0:return inputValue.join("");
      default:return inputValue;
    }
  }catch(e){
    return inputValue;
  }
}

function executeMainLogic(){
  const numElements = getNextInt();
  var initialNumbers = new Array(numElements);
  var totalDifference = 0;
  var processedSequence = [];

  for(let idx = 0; idx < numElements; idx++){
    initialNumbers[idx] = getNextInt();
  }
  initialNumbers.sort(function(a,b){
  	return a - b;
  });
  
  const firstElement = initialNumbers.shift();
  processedSequence.push(firstElement);

  while(initialNumbers.length > 0){
    const frontOfSequence = processedSequence[0];
    const backOfSequence = processedSequence[processedSequence.length - 1];
    const frontOfRemaining = initialNumbers[0];
    const backOfRemaining = initialNumbers[initialNumbers.length - 1];

    function determineOptimalPlacement(seqFront, seqBack, remFront, remBack) {
        if (seqFront === seqBack && remFront === remBack) {
            return 'push_back_remaining';
        } else if (seqFront === seqBack) {
            const diffFrontSeqRemFront = Math.abs(seqFront - remFront);
            const diffFrontSeqRemBack = Math.abs(seqFront - remBack);
            return (diffFrontSeqRemFront >= diffFrontSeqRemBack) ? 'push_front_remaining' : 'push_back_remaining';
        } else if (remFront === remBack) {
            const diffSeqFrontRemFront = Math.abs(seqFront - remFront);
            const diffSeqBackRemFront = Math.abs(seqBack - remFront);
            return (diffSeqFrontRemFront >= diffSeqBackRemFront) ? 'unshift_front_remaining' : 'push_front_remaining';
        } else {
            const diff1 = Math.abs(remFront - seqFront);
            const diff2 = Math.abs(remFront - seqBack);
            const diff3 = Math.abs(remBack - seqFront);
            const diff4 = Math.abs(remBack - seqBack);

            const maxDiff = Math.max(diff1, diff2, diff3, diff4);

            if (maxDiff === diff1) {
                return 'unshift_back_remaining';
            } else if (maxDiff === diff2) {
                return 'push_front_remaining';
            } else if (maxDiff === diff3) {
                return 'unshift_back_remaining';
            } else { // maxDiff === diff4
                return 'push_back_remaining';
            }
        }
    }

    const placementStrategy = determineOptimalPlacement(
        frontOfSequence, backOfSequence, frontOfRemaining, backOfRemaining
    );

    switch (placementStrategy) {
        case 'push_back_remaining':
            processedSequence.push(initialNumbers.pop());
            break;
        case 'push_front_remaining':
            processedSequence.push(initialNumbers.shift());
            break;
        case 'unshift_front_remaining':
            processedSequence.unshift(initialNumbers.shift());
            break;
        case 'unshift_back_remaining':
            processedSequence.unshift(initialNumbers.pop());
            break;
        default:
            logDebug("Error: Unknown placement strategy detected.");
            break;
    }
  }
  
  for(let idx = 1; idx < numElements; idx++){
    totalDifference += Math.abs(processedSequence[idx - 1] - processedSequence[idx]);
  }
  printResult(totalDifference);
}
