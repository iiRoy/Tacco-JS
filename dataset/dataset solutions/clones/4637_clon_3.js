const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputProcessor;
const rawInputLines = [];

inputReader.on('line', (line) => { rawInputLines.push(line); });

inputReader.on('close', () => {
  inputProcessor = createInputProcessor(rawInputLines);
  console.error("\n");
  const startTime = new Date();
  executeSolution();
  const endTime = new Date() - startTime;
  
  logDebug(`time : ${endTime}ms`);
  logDebug(`memory : ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

function deepClone(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

function parseNextInt(){ return parseInt(inputProcessor.next()); }
function parseNextStringArray(){ return inputProcessor.next().split(" "); }
function parseNextIntArray(){ return inputProcessor.next().split(" ").map(Number); }
function parseNextCharArray(){ return inputProcessor.next().split(""); }

function getNextInputLine(){ return inputProcessor.next(); }
function hasMoreInput(){ return inputProcessor.hasNext(); }

function createInputProcessor(lines){  
  const processorInstance = {
    dataLines : lines,
    currentLineIndex : 0,
    totalLines : lines.length,
    
    hasNext : function(){
      return (this.currentLineIndex < this.totalLines);
    },
    
    next : function(){
      if(!this.hasNext()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      }
      const currentInput = this.dataLines[this.currentLineIndex];
      this.currentLineIndex++;
      return currentInput;
    }
  };
  return processorInstance;
}

function printResult(data){ console.log(data); }
function logDebug(message){ console.error("debug:" + require("util").inspect(message,false,null)); }

function calculateSubsetCost(subsetElements) {
    let currentCost = 0;
    const mutableSubset = [...subsetElements]; 

    for (let k = 0; k < mutableSubset.length - 1; k++) {
        if (mutableSubset[k] >= mutableSubset[k + 1]) {
            const neededIncrease = mutableSubset[k] - mutableSubset[k + 1] + 1;
            currentCost += neededIncrease;
            mutableSubset[k + 1] += neededIncrease;
        }
    }
    return currentCost;
}

function executeSolution(){
    const [elementCount, targetSubsetSize] = parseNextIntArray();
    const originalNumbers = parseNextIntArray();

    const MAX_POSSIBLE_COST = Math.pow(10, 16);
    let minCost = MAX_POSSIBLE_COST;

    if (targetSubsetSize === 1) {
        printResult(0);
        return;
    }

    const totalSubsets = 1 << elementCount;

    for (let subsetMask = 0; subsetMask < totalSubsets; subsetMask++) {
        const currentSubset = [originalNumbers[0]];

        for (let elementIndex = 1; elementIndex < elementCount; elementIndex++) {
            if ((subsetMask & (1 << elementIndex)) !== 0) {
                currentSubset.push(originalNumbers[elementIndex]);
            }
        }

        if (currentSubset.length === targetSubsetSize) {
            const costForThisSubset = calculateSubsetCost(currentSubset);
            minCost = Math.min(minCost, costForThisSubset);
        }
    }
    printResult(minCost);
}
