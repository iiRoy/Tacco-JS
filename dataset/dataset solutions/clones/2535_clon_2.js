const streamHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let dataParser;
const receivedLines = [];
streamHandler.on('line', function(currentLine) {
  receivedLines.push(currentLine);
});
streamHandler.on('close', function() {
  dataParser = setupInputProcessor(receivedLines);
  console.error("\n");
  const commencementTime = Date.now();
  executeProgram();
  const duration = Date.now() - commencementTime;
  logDiagnostic("Processing duration : " + duration + "ms");
  logDiagnostic("Memory utilization : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(originalItem) {
  return JSON.parse(JSON.stringify(originalItem));
}
function retrieveNextInteger() {
  return processValue(fetchNextItem(), 1);
}
function retrieveNextStringArray() {
  return processValue(fetchNextItem(), 2);
}
function retrieveNextIntegerArray() {
  return processValue(fetchNextItem(), 4);
}
function retrieveNextCharacterArray() {
  return processValue(fetchNextItem(), 6);
}
function fetchNextItem() {
  return dataParser.getNextItem();
}
function hasFurtherItems() {
  return dataParser.hasMoreItems();
}
function setupInputProcessor(sourceInputs) {
  return {
    sourceData: sourceInputs,
    currentPosition: 0,
    maximumCount: sourceInputs.length,
    hasMoreItems: function() {
      return (this.currentPosition < this.maximumCount);
    },
    getNextItem: function() {
      if (this.hasMoreItems()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw "InputBoundaryExceededException ‚No more input lines available";
      }
    }
  };
}
function outputResult(message) {
  console.log(message);
}
function logDiagnostic(info) {
  console.error("diagnostic:" + require("util").inspect(info, false, null));
}
// The 'operationCode' parameter specifies the transformation type:
// - Default/Other : returns the value as is.
// - 1: Parses as an integer.
// - 2: Splits by spaces into a string array.
// - 4: Splits by spaces and converts each part to a number.
// - 6: Splits into an array of single characters.
// - 7: Splits into characters and converts each to a number.
// - 8: Joins array elements with spaces.
// - 9: Joins array elements with newlines.
// - 0: Joins array elements without any separator.
function processValue(valueToProcess, operationCode) {
  try {
    switch (operationCode) {
      case 1:
        return parseInt(valueToProcess);
      case 2:
        return valueToProcess.split(" ");
      case 4:
        return valueToProcess.split(" ").map(Number);
      case 6:
        return valueToProcess.split("");
      case 7:
        return valueToProcess.split("").map(Number);
      case 8:
        return valueToProcess.join(" ");
      case 9:
        return valueToProcess.join("\n");
      case 0:
        return valueToProcess.join("");
      default:
        return valueToProcess;
    }
  } catch (err) {
    return valueToProcess;
  }
}
function executeProgram() {
  const initialParameters = retrieveNextIntegerArray();
  const totalItems = initialParameters[0];
  const totalOperations = initialParameters[1];
  const operationDefinitions = new Array(totalOperations + 1);
  const itemDependencies = {};
  for (let opIdx = 0; opIdx < totalOperations; opIdx++) {
    const currentOperationDetails = retrieveNextIntegerArray();
    const operationCost = currentOperationDetails[0];
    const dependencyCount = currentOperationDetails[1];
    const unlockedItems = retrieveNextIntegerArray();
    operationDefinitions[opIdx + 1] = {
      operationCost: operationCost,
      unlockedElements: unlockedItems
    };
    for (let depIdx = 0; depIdx < dependencyCount; depIdx++) {
      const currentUnlockedItem = unlockedItems[depIdx];
      if (itemDependencies[currentUnlockedItem] === null || itemDependencies[currentUnlockedItem] === undefined) {
        itemDependencies[currentUnlockedItem] = [];
      }
      itemDependencies[currentUnlockedItem].push(opIdx + 1);
    }
  }
  let finalAccumulatedCost = 0;
  const activatedElements = new Set();
  for (let itemNum = 1; itemNum <= totalItems; itemNum++) {
    if (!activatedElements.has(itemNum)) {
      let minimumCost = 100000000000;
      let bestOperationIndex = -1;
      const potentialOperations = itemDependencies[itemNum];
      if (potentialOperations === null || potentialOperations === undefined) {
        outputResult(-1);
        return;
      }
      for (let opIter = 0; opIter < potentialOperations.length; opIter++) {
        const currentOpIndex = potentialOperations[opIter];
        if (minimumCost > operationDefinitions[currentOpIndex].operationCost) {
          minimumCost = operationDefinitions[currentOpIndex].operationCost;
          bestOperationIndex = currentOpIndex;
        }
      }
      finalAccumulatedCost += minimumCost;
      for (let unlockedIter = 0; unlockedIter < operationDefinitions[bestOperationIndex].unlockedElements.length; unlockedIter++) {
        activatedElements.add(operationDefinitions[bestOperationIndex].unlockedElements[unlockedIter]);
      }
    }
  }
  outputResult(finalAccumulatedCost);
}