var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var receivedLines = [];
read.on('line', function(inputLine){receivedLines.push(inputLine);});
read.on('close', function(){
  inputProcessor = initializeInputHandler(receivedLines);
  console.error("\n");
  var startTime = Date.now();
  executeMainLogic();
  var endTime = Date.now() - startTime;
  logError("time : " + (endTime) + "ms");
  logError("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(sourceObj){return JSON.parse(JSON.stringify(sourceObj));}
function getNextInt(){return convertInput(retrieveNext(),1);}
function getNextStrArray(){return convertInput(retrieveNext(),2);}
function getNextIntArray(){return convertInput(retrieveNext(),4);}
function getNextCharArray(){return convertInput(retrieveNext(),6);}
function retrieveNext(){return inputProcessor.fetchNext();}
function hasMoreInput(){return inputProcessor.hasMore();}
function initializeInputHandler(inputData){
  var handlerObject = {
    dataList : inputData, currentIdx : 0, totalCount : inputData.length,
    hasMore : function(){return (this.currentIdx < this.totalCount);},
    fetchNext : function(){if(!this.hasMore()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var currentInput = this.dataList[this.currentIdx];this.currentIdx++;return currentInput;}}
  };
  return handlerObject;
}
function outputResult(content){console.log(content);}
function logError(message){console.error("debug:" + require("util").inspect(message,false,null));}
function convertInput(value, conversionType){try{switch(conversionType){case 1:return parseInt(value);case 2:return value.split(" ");case 4:return value.split(" ").map(Number);case 6:return value.split("");case 7:return value.split("").map(Number);case 8:return value.join(" ");case 9:return value.join("\n");case 0:return value.join("");default:return value;}}catch(e){return value;}}

function executeMainLogic(){
	const parameters = getNextIntArray();
	const currentM = parameters[0];
	const currentK = parameters[1];

	const maxPossibleValue = 1 << currentM;

	if (currentK < 0 || currentK >= maxPossibleValue) {
		outputResult(-1);
		return;
	}

	if (currentM === 1) {
		outputResult(currentK === 0 ? "0 0 1 1" : -1);
		return;
	}

	if (currentK === 0) {
		const sequenceLength = maxPossibleValue;
		const generatedSequence = Array.from({ length: sequenceLength }, (_, indexValue) => [indexValue, indexValue]).flat();
		outputResult(convertInput(generatedSequence, 8));
	} else {
		const upperRangeBound = maxPossibleValue;
		const intermediateValues = Array.from({ length: upperRangeBound - 1 }, (_, index) => index + 1)
		                                  .filter(val => val !== currentK);

		const finalOutputSequence = [currentK, 0]
		                            .concat(intermediateValues)
		                            .concat(currentK)
		                            .concat(intermediateValues.slice().reverse())
		                            .concat(0);
		outputResult(convertInput(finalOutputSequence, 8));
	}
}
