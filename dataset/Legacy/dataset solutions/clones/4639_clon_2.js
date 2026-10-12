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
  console.error("\n");
  var startTime = new Date();
  executeMainLogic();
  var elapsedTime = new Date() - startTime;
  
  logDebugMessage("time : " + (elapsedTime) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

function retrieveInteger(){ return convertInput(getNextItem(), 1); }
function retrieveStringArray(){ return convertInput(getNextItem(), 2); }
function retrieveIntegerArray(){ return convertInput(getNextItem(), 4); }
function retrieveCharacterArray(){ return convertInput(getNextItem(), 6); }

function getNextItem(){ return dataProcessor.fetchNext(); }
function hasMoreItems(){ return dataProcessor.checkAvailability(); }

function initializeInputHandler(rawInputLines){  
  var handlerObject = {
    sourceData : rawInputLines,
    currentIndex : 0,
    maximumIndex : rawInputLines.length,
    checkAvailability : function(){ return (this.currentIndex < this.maximumIndex); },
    fetchNext : function(){
      if(!this.checkAvailability()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var nextInputLine = this.sourceData[this.currentIndex];
        this.currentIndex++;
        return nextInputLine;
      }
    }
  };
  return handlerObject;
}

function displayOutput(messageContent){
  console.log(messageContent);
}

function logDebugMessage(messageContent){
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

function convertInput(inputValue, conversionType){
  try {
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
  } catch(errorDetails){
    return inputValue;
  }
}

function executeMainLogic(){
	var firstLineData = retrieveIntegerArray();
	var elementCount = firstLineData[0];
	var targetCount = firstLineData[1];
	var valueList = retrieveIntegerArray();
	var minimumCost = Math.pow(10, 15);

	if(targetCount === 1){
		displayOutput(0);
		return;
	}

	for(var subsetIndex = 0; subsetIndex < (1 << elementCount); subsetIndex++){
		var chosenElements = [valueList[0]];
		for(var loopCounter = 1; loopCounter < elementCount; loopCounter++){
			if((subsetIndex & (1 << loopCounter)) !== 0){
				chosenElements.push(valueList[loopCounter]);
			}
		}

		if(chosenElements.length >= targetCount){
			var currentCost = 0;
			for(var loopCounter = 0; loopCounter < chosenElements.length - 1; loopCounter++){
				if(chosenElements[loopCounter] >= chosenElements[loopCounter + 1]){
					var incrementAmount = chosenElements[loopCounter] - chosenElements[loopCounter + 1] + 1;
					currentCost += incrementAmount;
					chosenElements[loopCounter + 1] += incrementAmount;
				}
			}
			minimumCost = Math.min(minimumCost, currentCost);
		}
	}
	displayOutput(minimumCost);
}
