var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputSource;
var inputLines = [];
inputReader.on('line', function(line){inputLines.push(line);});
inputReader.on('close', function(){
  inputSource = initializeInput(inputLines);
  console.error("\n");
  var startTime = new Date();
  processData();
  var endTime = new Date() - startTime;
  
  logDebug("time : " + (endTime) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function deepCopyObject(obj){return JSON.parse(JSON.stringify(obj));}
function retrieveInteger(){return convertInput(getNextLine(),1);}
function retrieveStringArray(){return convertInput(getNextLine(),2);}
function retrieveIntegerArray(){return convertInput(getNextLine(),4);}
function retrieveCharacterArray(){return convertInput(getNextLine(),6);}
function getNextLine(){return inputSource.getNextLine();}
function hasMoreLines(){return inputSource.hasMoreLines();}
function initializeInput(lines){  
  var sourceObject = {
    lineList : lines, currentIdx : 0, maxLines : lines.length,
    hasMoreLines : function(){return (this.currentIdx < this.maxLines);},
    getNextLine : function(){if(!this.hasMoreLines()){throw "InputExhaustedException: No more lines to read";}else{var currentLine = this.lineList[this.currentIdx];this.currentIdx++;return currentLine;}}
  };
  return sourceObject;
}
function printResult(data){console.log(data);}
function logDebug(data){console.error("debug:" + require("util").inspect(data,false,null));}
function convertInput(value, typeCode){
  try{
    switch(typeCode){
      case 1:return parseInt(value);
      case 2:return value.split(" ");
      case 4:return value.split(" ").map(Number);
      case 6:return value.split("");
      case 7:return value.split("").map(Number);
      case 8:return value.join(" ");
      case 9:return value.join("\n");
      case 0:return value.join("");
      default:return value;
    }
  }catch(e){return value;}
}

let minimumCostValue;
let heightsArray;
let elementCount;
let targetCount;

function findMinCostRecursive(currentIdx, selectedCount, currentMaxHeight, accumulatedCost) {
    if (currentIdx === elementCount) {
        if (selectedCount >= targetCount) {
            minimumCostValue = Math.min(minimumCostValue, accumulatedCost);
        }
        return;
    }

    // Option 1: Do NOT select the current element (heightsArray[currentIdx])
    const nextMaxHeightNoSelect = Math.max(heightsArray[currentIdx], currentMaxHeight);
    findMinCostRecursive(currentIdx + 1, selectedCount, nextMaxHeightNoSelect, accumulatedCost);

    // Option 2: DO select the current element (heightsArray[currentIdx])
    let costIncrease = 0;
    let adjustedMaxHeightForNext = currentMaxHeight;

    if (currentMaxHeight >= heightsArray[currentIdx]) {
        costIncrease = currentMaxHeight - heightsArray[currentIdx] + 1;
        adjustedMaxHeightForNext = currentMaxHeight + 1;
    }
    
    const nextMaxHeightWithSelect = Math.max(heightsArray[currentIdx], adjustedMaxHeightForNext);
    findMinCostRecursive(currentIdx + 1, selectedCount + 1, nextMaxHeightWithSelect, accumulatedCost + costIncrease);
}

function processData(){
	const initialParams = retrieveIntegerArray();
	elementCount = initialParams[0];
	targetCount = initialParams[1];
	heightsArray = retrieveIntegerArray();
	
	minimumCostValue = Math.pow(10,16);

	if(targetCount === 1){
		printResult(0);
		return;
	}
    
    findMinCostRecursive(0, 0, 0, 0);

	printResult(minimumCostValue);
}
