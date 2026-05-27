var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputSource; var rawInputLines = [];
inputReader.on('line', function(currentLine){rawInputLines.push(currentLine);});
inputReader.on('close', function(){
  inputSource = initializeInputProcessor(rawInputLines);
  console.error("\n");
  var startTime = Date.now();
  executeSolution();
  var duration = Date.now() - startTime;
  logDebugMessage("time : " + duration + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(originalObject){return JSON.parse(JSON.stringify(originalObject));}
function readNextInteger(){return performTypeConversion(fetchNextToken(),1);}
function readNextStringArray(){return performTypeConversion(fetchNextToken(),2);}
function readNextIntegerArray(){return performTypeConversion(fetchNextToken(),4);}
function readNextCharacterArray(){return performTypeConversion(fetchNextToken(),6);}
function fetchNextToken(){return inputSource.fetchNextToken();}
function hasMoreTokensAvailable(){return inputSource.hasMoreTokensAvailable();}
function initializeInputProcessor(inputData){  
  return {
    lineList : inputData, currentLineIndex : 0, maxLines : inputData.length,
    hasMoreTokensAvailable : function(){return (this.currentLineIndex < this.maxLines);},
    fetchNextToken : function(){if(this.hasMoreTokensAvailable()){return this.lineList[this.currentLineIndex++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
  };
}
function outputResult(content){console.log(content);}
function logDebugMessage(message){console.error("debug:" + require("util").inspect(message,false,null));}
function performTypeConversion(value, conversionType){try{switch(conversionType){case 1:return parseInt(value);case 2:return value.split(" ");case 4:return value.split(" ").map(Number);case 6:return value.split("");case 7:return value.split("").map(Number);case 8:return value.join(" ");case 9:return value.join("\n");case 0:return value.join("");default:return value;}}catch(e){return value;}}

function executeSolution(){
  const initialParameters = readNextIntegerArray();
  const requiredItemCount = initialParameters[0];
  const availableOperationCount = initialParameters[1];

  const operationDetailsCollection = new Array(availableOperationCount + 1);

  for (let opIndex = 1; opIndex <= availableOperationCount; opIndex++) {
    const currentOperationInput = readNextIntegerArray();
    const operationCost = currentOperationInput[0];
    const itemsAffectedCount = currentOperationInput[1]; // This variable is read but not used in the new strategy, matching original behavior.
    const itemsUnlockedByOperation = readNextIntegerArray();

    operationDetailsCollection[opIndex] = {
      costValue: operationCost,
      unlockedItems: itemsUnlockedByOperation,
      operationId: opIndex
    };
  }
  
  let totalAccumulatedCost = 0;
  const acquiredItemSet = new Set();
  const executedOperations = new Set();

  while (acquiredItemSet.size < requiredItemCount) {
    let cheapestOperationCost = Infinity;
    let bestOperationIdentifier = -1;

    for (let opIdentifier = 1; opIdentifier <= availableOperationCount; opIdentifier++) {
      if (executedOperations.has(opIdentifier)) {
        continue;
      }

      const currentOperationEntry = operationDetailsCollection[opIdentifier];
      const revealsNewItem = currentOperationEntry.unlockedItems.some(item => !acquiredItemSet.has(item));

      if (revealsNewItem) {
        if (currentOperationEntry.costValue < cheapestOperationCost) {
          cheapestOperationCost = currentOperationEntry.costValue;
          bestOperationIdentifier = opIdentifier;
        }
      }
    }

    if (bestOperationIdentifier === -1) {
      outputResult(-1);
      return;
    }

    totalAccumulatedCost += cheapestOperationCost;
    executedOperations.add(bestOperationIdentifier);

    const chosenOperationEntry = operationDetailsCollection[bestOperationIdentifier];
    for (const itemIdentifier of chosenOperationEntry.unlockedItems) {
      acquiredItemSet.add(itemIdentifier);
    }
  }

  outputResult(totalAccumulatedCost);
}
