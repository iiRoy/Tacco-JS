var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var bufferedInputLines = [];
inputReader.on('line', function(inputLine){bufferedInputLines.push(inputLine);});
inputReader.on('close', function(){
  inputProcessor = initializeInputProcessor(bufferedInputLines);
  console.error("\n");
  var startTime = new Date();
  solveProblem();
  var endTime = new Date() - startTime;
  
  logDebugInfo("time : " + (endTime) + "ms");
  logDebugInfo("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(sourceObject){return JSON.parse(JSON.stringify(sourceObject));}
function readNextInteger(){return performTypeConversion(fetchNextLine(),1);} function readNextStringArray(){return performTypeConversion(fetchNextLine(),2);}
function readNextIntegerArray(){return performTypeConversion(fetchNextLine(),4);} function readNextCharacterArray(){return performTypeConversion(fetchNextLine(),6);}
function fetchNextLine(){return inputProcessor.next();} function hasMoreLines(){return inputProcessor.hasNext();}
function initializeInputProcessor(linesArray){  
  const outOfBoundsMessage = "ArrayIndexOutOfBoundsException これ以上ないよ";
  var processorInstance = {
    sourceLines : linesArray, currentLineIndex : 0, totalLines : linesArray.length,
    hasNext : function(){return (this.currentLineIndex < this.totalLines);},
    next : function(){
      if(!this.hasNext()){
        throw outOfBoundsMessage;
      } else {
        var currentLineContent = this.sourceLines[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineContent;
      }
    }
  };
  return processorInstance;
}
function displayResult(outputValue){console.log(outputValue);}
function logDebugInfo(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,null));}

function performTypeConversion(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1: return Number.parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(Number);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  }catch(e){
    return inputValue;
  }
}

function getSelectedSubset(sourceArray, combinationMask, elementCount) {
    const subset = [sourceArray[0]]; // Always include the first element
    for (let k = 1; k < elementCount; ++k) {
        // Check if the k-th bit is set in the combinationMask
        if (((combinationMask >>> k) & 1) === 1) {
            subset.push(sourceArray[k]);
        }
    }
    return subset;
}

function calculateAndAdjustCost(subsetHeights) {
    let costAccumulator = 0;
    for (let k = 1; k < subsetHeights.length; ++k) {
        const previousHeight = subsetHeights[k - 1];
        let currentHeight = subsetHeights[k];

        if (previousHeight >= currentHeight) {
            const heightDifference = previousHeight - currentHeight;
            const requiredIncrement = heightDifference + 1;
            costAccumulator += requiredIncrement;
            subsetHeights[k] = previousHeight + 1; // Adjust current height in place
        }
    }
    return costAccumulator;
}

function solveProblem(){
	const problemParameters = readNextIntegerArray();
	const totalElements = problemParameters[0];
	const minElementsToSelect = problemParameters[1];
	const initialHeights = readNextIntegerArray();
	
	const MAX_POSSIBLE_COST = 10 ** 16;
	let minimumTotalCost = MAX_POSSIBLE_COST;

	if(minElementsToSelect === 1){
		displayResult(0);
		return;
	}
	
	const totalCombinations = 1 << totalElements; // Equivalent to Math.pow(2, totalElements)
	for(let combinationIndex = 0; combinationIndex < totalCombinations; ++combinationIndex){
		const currentSubset = getSelectedSubset(initialHeights, combinationIndex, totalElements);
		
		const currentSubsetSize = currentSubset.length;
		if(currentSubsetSize < minElementsToSelect){
			continue; // Skip combinations that don't meet the minimum count
		}
		
		const currentCombinationCost = calculateAndAdjustCost(currentSubset);
		minimumTotalCost = Math.min(minimumTotalCost, currentCombinationCost);
	}
	displayResult(minimumTotalCost);
}
