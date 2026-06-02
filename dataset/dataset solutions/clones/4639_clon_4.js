var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var inputLines = [];
read.on('line', function(lineData){inputLines.push(lineData);});
read.on('close', function(){
  inputProcessor = initializeInput(inputLines);
  console.error("\n");
  var startTime = new Date();
  processMainLogic();
  var endTime = new Date() - startTime;
  
  debugLog("time : " + (endTime) + "ms");
  debugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopyObject(sourceObj){return JSON.parse(JSON.stringify(sourceObj));}
function getNextInt(){return convertInput(getNextToken(),1);}
function getNextStrArray(){return convertInput(getNextToken(),2);}
function getNextIntArray(){return convertInput(getNextToken(),4);}
function getNextCharArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return inputProcessor.retrieveNext();}
function hasMoreTokens(){return inputProcessor.checkHasNext();}

function initializeInput(lines){  
  var inputHandler = {
    dataList : lines,
    currentIndex : 0,
    maxIndex : lines.length,
    checkHasNext : function(){return (this.currentIndex < this.maxIndex);},
    retrieveNext : function(){
      if(!this.checkHasNext()){throw "InputOutOfBoundsException: No more input available";}
      else{var currentInput = this.dataList[this.currentIndex];this.currentIndex++;return currentInput;}
    }
  };
  return inputHandler;
}

function outputResult(data){console.log(data);}
function debugLog(message){console.error("debug:" + require("util").inspect(message,false,null));}

function convertInput(value, conversionType){
  try{
    switch(conversionType){
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

function processMainLogic(){
	const [totalBuildings, requiredVisible] = getNextIntArray();
	const buildingHeights = getNextIntArray();

	if (requiredVisible === 1) {
		outputResult(0);
		return;
	}

	let minimumOverallCost = Number.MAX_SAFE_INTEGER;

	const exploreBuildingOptions = (currentBuildingIndex, currentSelectionHeights, accumulatedCostForSelection) => {
		if (currentBuildingIndex === totalBuildings) {
			if (currentSelectionHeights.length >= requiredVisible) {
				minimumOverallCost = Math.min(minimumOverallCost, accumulatedCostForSelection);
			}
			return;
		}

		exploreBuildingOptions(currentBuildingIndex + 1, currentSelectionHeights, accumulatedCostForSelection);

		const lastSelectedHeight = currentSelectionHeights[currentSelectionHeights.length - 1];
		const originalHeightOfCurrentBuilding = buildingHeights[currentBuildingIndex];

		let costToAdjust = 0;
		let adjustedHeightForCurrent = originalHeightOfCurrentBuilding;

		if (originalHeightOfCurrentBuilding <= lastSelectedHeight) {
			costToAdjust = lastSelectedHeight - originalHeightOfCurrentBuilding + 1;
			adjustedHeightForCurrent = originalHeightOfCurrentBuilding + costToAdjust;
		}

		const newSelectionPath = [...currentSelectionHeights, adjustedHeightForCurrent];
		exploreBuildingOptions(currentBuildingIndex + 1, newSelectionPath, accumulatedCostForSelection + costToAdjust);
	};

	exploreBuildingOptions(1, [buildingHeights[0]], 0);

	outputResult(minimumOverallCost);
}
