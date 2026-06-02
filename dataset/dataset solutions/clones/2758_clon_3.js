const readlineInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputHandler;
const inputLines = [];

readlineInterface.on('line', function(inputLine){inputLines.push(inputLine);});
readlineInterface.on('close', function(){
  inputHandler = initializeInputProcessor(inputLines);
  console.error("\n");
  
  measureAndExecute(executeMainLogic);
  
  const heapTotalBytes = process.memoryUsage().heapTotal;
  const heapTotalKB = Math.round(heapTotalBytes / 1024);
  printDebug("memory : " + heapTotalKB + "KB");
});

function deepCloneObject(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

function readNextInteger(){return convertInput(getNextLine(), 1);}
function readNextStringArray(){return convertInput(getNextLine(), 2);}
function readNextIntegerArray(){return convertInput(getNextLine(), 4);}
function readNextCharacterArray(){return convertInput(getNextLine(), 6);}

function getNextLine(){return inputHandler.getNextLine();}
function hasMoreLines(){return inputHandler.hasMoreLines();}

class InputProcessor {
  constructor(lines) {
    this.lineList = lines;
    this.currentIndex = 0;
    this.maxLines = lines.length;
  }

  hasMoreLines() {
    return (this.currentIndex < this.maxLines);
  }

  getNextLine() {
    if (!this.hasMoreLines()) {
      throw "ArrayIndexOutOfBoundsException これ以上ないよ";
    }
    const currentLineValue = this.lineList[this.currentIndex];
    this.currentIndex++;
    return currentLineValue;
  }
}

function initializeInputProcessor(inputData){  
  return new InputProcessor(inputData);
}

function printOutput(message){console.log(message);}

const utilInspector = require("util").inspect;
function printDebug(message){
  console.error("debug:" + utilInspector(message, false, null));
}

const parseInteger = (str) => parseInt(str);
const splitBySpace = (str) => str.split(" ");
const splitByChar = (str) => str.split("");
const mapToNumbers = (arr) => arr.map(Number);
const joinWithSpace = (arr) => arr.join(" ");
const joinWithNewline = (arr) => arr.join("\n");
const joinWithoutSeparator = (arr) => arr.join("");

function convertInput(inputValue, conversionType) {
  try {
    let processedValue;
    switch (conversionType) {
      case 1:
        processedValue = parseInteger(inputValue);
        break;
      case 2:
        processedValue = splitBySpace(inputValue);
        break;
      case 4:
        processedValue = mapToNumbers(splitBySpace(inputValue));
        break;
      case 6:
        processedValue = splitByChar(inputValue);
        break;
      case 7:
        processedValue = mapToNumbers(splitByChar(inputValue));
        break;
      case 8:
        processedValue = joinWithSpace(inputValue);
        break;
      case 9:
        processedValue = joinWithNewline(inputValue);
        break;
      case 0:
        processedValue = joinWithoutSeparator(inputValue);
        break;
      default:
        processedValue = inputValue;
        break;
    }
    return processedValue;
  } catch (error) {
    return inputValue;
  }
}

function measureAndExecute(callback) {
  const startTime = new Date();
  callback();
  const endTime = new Date();
  const durationMs = endTime - startTime;
  printDebug("time : " + durationMs + "ms");
}

function executeMainLogic(){
	const firstLineData = readNextIntegerArray();
	const numItems = firstLineData[0];
	const costPerItem = firstLineData[1];
	const fixedCost = firstLineData[2];
	
	const totalCostIfPerItem = numItems * costPerItem;
	const finalMinimumCost = Math.min(fixedCost, totalCostIfPerItem);
	
	printOutput(finalMinimumCost);
}
