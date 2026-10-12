var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputSourceHandler;
var collectedInputLines = [];
read.on('line', function(input){collectedInputLines.push(input);});
read.on('close', function(){
  inputSourceHandler = initializeInputProcessor(collectedInputLines);
  console.error("\n");
  var start = new Date();
  performMainCalculation();
  var end = new Date() - start;
  
  outputDebugMessage("time : " + (end) + "ms");
  outputDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(originalObject){return JSON.parse(JSON.stringify(originalObject));}

function retrieveInteger(){return dataTransformationUtility(retrieveNextInputLine(), 1);}
function retrieveStringArray(){return dataTransformationUtility(retrieveNextInputLine(), 2);}
function retrieveNumericArray(){return dataTransformationUtility(retrieveNextInputLine(), 4);}
function retrieveCharacterArray(){return dataTransformationUtility(retrieveNextInputLine(), 6);}

function retrieveNextInputLine(){return inputSourceHandler.getNextItem();}
function hasMoreInput(){return inputSourceHandler.checkAvailability();}

class InputLineProcessor {
  constructor(linesCollection) {
    this.sourceData = linesCollection;
    this.currentPointer = 0;
  }

  checkAvailability() {
    return this.currentPointer < this.sourceData.length;
  }

  getNextItem() {
    if (!this.checkAvailability()) {
      throw "ArrayIndexOutOfBoundsException これ以上ないよ";
    }
    return this.sourceData[this.currentPointer++];
  }
}

function initializeInputProcessor(lines){  
  return new InputLineProcessor(lines);
}

function displayResult(content){console.log(content);}
function outputDebugMessage(message){console.error("debug:" + require("util").inspect(message,false,null));}

const transformationMap = new Map([
  [1, (val) => parseInt(val)],
  [2, (val) => val.split(" ")],
  [4, (val) => val.split(" ").map(Number)],
  [6, (val) => val.split("")],
  [7, (val) => val.split("").map(Number)],
  [8, (val) => val.join(" ")],
  [9, (val) => val.join("\n")],
  [0, (val) => val.join("")],
]);

function dataTransformationUtility(inputValue, transformationCode){
  try {
    const strategy = transformationMap.get(transformationCode);
    if (strategy) {
      return strategy(inputValue);
    }
    return inputValue;
  } catch(e) {
    return inputValue;
  }
}

function performMainCalculation(){
    const [itemCount, unitCost, budgetLimit] = retrieveNumericArray();
    
    const calculatedTotalCost = itemCount * unitCost;
    
    displayResult(Math.min(budgetLimit, calculatedTotalCost));
}
