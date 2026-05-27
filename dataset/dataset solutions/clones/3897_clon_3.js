var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataHandler;
var inputLines = [];

function reportPerformanceMetrics(executionStartTime) {
  const durationMs = new Date() - executionStartTime;
  printDebug("time : " + durationMs + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
}

inputReader.on('line', function(currentLine){inputLines.push(currentLine);});
inputReader.on('close', function(){
  dataHandler = new InputHandler(inputLines);
  console.error("\n");
  var executionStartTime = new Date();
  executeLogic();
  reportPerformanceMetrics(executionStartTime);
});

function InputHandler(lines) {
  this.inputList = lines;
  this.currentIndex = 0;
  this.totalCount = lines.length;
}

InputHandler.prototype.hasMoreInput = function() {
  return (this.currentIndex < this.totalCount);
};

InputHandler.prototype.getNextInput = function() {
  if (!this.hasMoreInput()) {
    throw "ArrayIndexOutOfBoundsException これ以上ないよ";
  }
  var currentInput = this.inputList[this.currentIndex];
  this.currentIndex++;
  return currentInput;
};

function readInt(){return convertInput(dataHandler.getNextInput(),1);}
function readStrArray(){return convertInput(dataHandler.getNextInput(),2);}
function readIntArray(){return convertInput(dataHandler.getNextInput(),4);}
function readCharArray(){return convertInput(dataHandler.getNextInput(),6);}
function getNextInput(){return dataHandler.getNextInput();}
function hasMoreInput(){return dataHandler.hasMoreInput();}

function printOutput(s){console.log(s);}
function printDebug(s){console.error("debug:" + require("util").inspect(s,false,null));}

const conversionStrategies = {
  1: (val) => parseInt(val),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (arr) => arr.join(" "),
  9: (arr) => arr.join("\n"),
  0: (arr) => arr.join(""),
};

function convertInput(inputValue, conversionType){
  try{
    const strategy = conversionStrategies[conversionType];
    return strategy ? strategy(inputValue) : inputValue;
  }catch(e){
    return inputValue;
  }
}

function getSortedArrayCopy(originalArray) {
  const arrayCopy = JSON.parse(JSON.stringify(originalArray));
  arrayCopy.sort((a, b) => a - b);
  return arrayCopy;
}

function determineMedianValues(sortedArray, totalCount) {
  const midIndex = totalCount / 2;
  const upperMedian = sortedArray[midIndex];
  const lowerMedian = sortedArray[midIndex - 1];
  return { upper: upperMedian, lower: lowerMedian };
}

function executeLogic(){
	var totalNumbers = readInt();
	var initialNumbers = readIntArray();

	var orderedNumbers = getSortedArrayCopy(initialNumbers);
	printDebug(orderedNumbers);

	var outputResults = new Array(totalNumbers);
	const { upper: medianUpperValue, lower: medianLowerValue } = determineMedianValues(orderedNumbers, totalNumbers);

	printDebug({medianUpperValue, medianLowerValue});

	for(let currentIdx = 0; currentIdx < totalNumbers; currentIdx++){
		let assignedValue;
		if(medianLowerValue === medianUpperValue){
			assignedValue = medianUpperValue;
		} else {
			assignedValue = (medianLowerValue >= initialNumbers[currentIdx]) ? medianUpperValue : medianLowerValue;
		}
		outputResults[currentIdx] = assignedValue;
	}
	printOutput(convertInput(outputResults,9));
}
