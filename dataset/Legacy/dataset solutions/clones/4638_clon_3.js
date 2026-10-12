const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let inputProcessorData;
const inputLinesBuffer = [];
inputReader.on('line', (inputLine) => { inputLinesBuffer.push(inputLine); });
inputReader.on('close', () => {
  inputProcessorData = initializeInputProcessor(inputLinesBuffer);
  console.error("\n");
  const startTime = new Date();
  executeMainLogic();
  const endTime = new Date() - startTime;
  
  const memoryUsageKB = Math.round(process.memoryUsage().heapTotal / 1024);
  printDebugError(`time : ${endTime}ms`);
  printDebugError(`memory : ${memoryUsageKB}KB`);
});

function deepCopyObject(sourceObj) { return JSON.parse(JSON.stringify(sourceObj)); }
function readInt() { return convertInputType(getNextInputLine(), 1); }
function readStrArray() { return convertInputType(getNextInputLine(), 2); }
function readIntArray() { return convertInputType(getNextInputLine(), 4); }
function readCharArray() { return convertInputType(getNextInputLine(), 6); }
function getNextInputLine() { return inputProcessorData.getNext(); }
function hasMoreInput() { return inputProcessorData.hasMore(); }

function initializeInputProcessor(inputLines) {  
  const processor = {
    linesList : inputLines,
    currentIndex : 0,
    maxLines : inputLines.length,
    hasMore : function(){ return (this.currentIndex < this.maxLines); },
    getNext : function(){
      if(!this.hasMore()){
        throw "ArrayIndexOutOfBoundsException: No more input lines available.";
      }
      const currentInputLine = this.linesList[this.currentIndex];
      this.currentIndex++;
      return currentInputLine;
    }
  };
  return processor;
}

function printOutput(message) { console.log(message); }
function printDebugError(message) { console.error("debug:" + require("util").inspect(message, false, null)); }

function convertInputType(inputValue, conversionType) {
  try {
    switch(conversionType) {
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
  } catch(e) {
    return inputValue;
  }
}

function executeMainLogic() {
    const firstLineData = readIntArray();
    const numBuildings = firstLineData[0];
    const minVisibleCount = firstLineData[1];
    const buildingHeights = readIntArray();

    const MAX_POSSIBLE_COST = Math.pow(10, 16);
    let minCost = MAX_POSSIBLE_COST;

    if (minVisibleCount === 1) {
        printOutput(0);
        return;
    }

    for (let combinationMask = 0; combinationMask < (1 << numBuildings); combinationMask++) {
        const { cost: currentCombinationCost, selectedCount: buildingsSelectedInCombination } =
            calculateCombinationMetrics(numBuildings, buildingHeights, combinationMask);

        if (buildingsSelectedInCombination >= minVisibleCount) {
            minCost = Math.min(minCost, currentCombinationCost);
        }
    }
    printOutput(minCost);
}

function calculateCombinationMetrics(numBuildings, heights, currentMask) {
    let combinationCost = 0;
    let currentMaxHeightInView = 0;
    let selectedBuildingsCounter = 0;

    for (let buildingIndex = 0; buildingIndex < numBuildings; buildingIndex++) {
        const originalBuildingHeight = heights[buildingIndex];
        const isCurrentBuildingSelected = ((currentMask >> buildingIndex) & 1) !== 0;

        if (isCurrentBuildingSelected) {
            selectedBuildingsCounter++;
            if (currentMaxHeightInView >= originalBuildingHeight) {
                combinationCost += currentMaxHeightInView - originalBuildingHeight + 1;
                currentMaxHeightInView++;
            }
        }
        currentMaxHeightInView = Math.max(originalBuildingHeight, currentMaxHeightInView);
    }
    return { cost: combinationCost, selectedCount: selectedBuildingsCounter };
}
