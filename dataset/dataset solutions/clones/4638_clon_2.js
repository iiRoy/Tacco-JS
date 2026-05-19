var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  console.error("\n"); // Newline for separation
  var startTime = new Date();
  executeSolution();
  var endTime = new Date() - startTime;
  
  logDebug("execution time : " + (endTime) + "ms");
  logDebug("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

function retrieveInteger(){
  return convertInput(getNextLine(), 1);
}

function retrieveStringArray(){
  return convertInput(getNextLine(), 2);
}

function retrieveIntegerArray(){
  return convertInput(getNextLine(), 4);
}

function retrieveCharacterArray(){
  return convertInput(getNextLine(), 6);
}

function getNextLine(){
  return dataProcessor.fetchNextEntry();
}

function hasMoreLines(){
  return dataProcessor.checkAvailability();
}

function initializeInputHandler(sourceData){  
  var handlerObject = {
    sourceLines : sourceData,
    currentPosition : 0,
    totalLines : sourceData.length,
    checkAvailability : function(){
      return (this.currentPosition < this.totalLines);
    },
    fetchNextEntry : function(){
      if(!this.checkAvailability()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentEntry = this.sourceLines[this.currentPosition];
        this.currentPosition++;
        return currentEntry;
      }
    }
  };
  return handlerObject;
}

function printResult(outputValue){
  console.log(outputValue);
}

function logDebug(debugMessage){
  console.error("debug:" + require("util").inspect(debugMessage, false, null));
}

// Input conversion utility
// 1: to integer
// 2: split by space
// 4: split by space and convert to number array
// 6: split by character
// 7: split by character and convert to number array
// 8: join by space
// 9: join by newline
// 0: join without separator
function convertInput(inputItem, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputItem);
      case 2: return inputItem.split(" ");
      case 4: return inputItem.split(" ").map(Number);
      case 6: return inputItem.split("");
      case 7: return inputItem.split("").map(Number);
      case 8: return inputItem.join(" ");
      case 9: return inputItem.join("\n");
      case 0: return inputItem.join("");
      default: return inputItem;
    }
  } catch(error) {
    return inputItem;
  }
}

function executeSolution(){
	var firstLineData = retrieveIntegerArray();
	var numElements = firstLineData[0];
	var targetCount = firstLineData[1];
	var heightsArray = retrieveIntegerArray();
	var minimumCost = Math.pow(10, 16); // Initialize with a very large value

	if(targetCount === 1){
		printResult(0);
		return;
	}

	for(var combinationIndex = 0; combinationIndex < (1 << numElements); combinationIndex++){
		var currentCost = 0;
        var maximumHeightSeen = 0;
        var elementsChosen = 0;

		for(var elementIndex = 0; elementIndex < numElements; elementIndex++){
			if((combinationIndex & (1 << elementIndex)) !== 0){ // Check if the element is selected
                elementsChosen++;
				if(maximumHeightSeen >= heightsArray[elementIndex]){
                  currentCost += maximumHeightSeen - heightsArray[elementIndex] + 1;
                  maximumHeightSeen++;
                }
			}
            maximumHeightSeen = Math.max(heightsArray[elementIndex], maximumHeightSeen);
		}

		if(elementsChosen >= targetCount){
			minimumCost = Math.min(minimumCost, currentCost);
		}
	}
	printResult(minimumCost);
}
