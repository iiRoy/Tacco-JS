const ARRAY_INDEX_OUT_OF_BOUNDS_MSG = "ArrayIndexOutOfBoundsException There is no more input";
const DEBUG_PREFIX = "debug:";

const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputProcessor;
const inputBuffer = [];

inputReader.on('line', (inputLine) => {
  inputBuffer.push(inputLine);
});

inputReader.on('close', () => {
  inputProcessor = createInputProcessor(inputBuffer);
  console.error("\n");
  const startTime = Date.now();
  solveProblem();
  const endTime = Date.now() - startTime;
  printDebug(`time : ${endTime}ms`);
  printDebug(`memory : ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

function createDeepCopy(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

function getNextInputLine() { return inputProcessor.getNextLine(); }
function hasMoreInput() { return inputProcessor.hasMoreLines(); }

function readInteger() { return convertInput(getNextInputLine(), 1); }
function readStringArray() { return convertInput(getNextInputLine(), 2); }
function readIntegerArray() { return convertInput(getNextInputLine(), 4); }
function readCharacterArray() { return convertInput(getNextInputLine(), 6); }

function createInputProcessor(lines) {
  let currentLineIndex = 0;
  const totalLines = lines.length;

  return {
    hasMoreLines: () => currentLineIndex < totalLines,
    getNextLine: () => {
      if (currentLineIndex < totalLines) {
        return lines[currentLineIndex++];
      } else {
        throw ARRAY_INDEX_OUT_OF_BOUNDS_MSG;
      }
    }
  };
}

function printOutput(message) { console.log(message); }
function printDebug(message) { console.error(DEBUG_PREFIX + require("util").inspect(message, false, null)); }

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue, 10);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(Number);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function findBestOperationToUnlockItem(targetItemId, itemToOperationMap, operationCatalog) {
  const candidateOperations = itemToOperationMap[targetItemId];

  if (!candidateOperations || candidateOperations.length === 0) {
    return { minCost: -1, operationIndex: -1 };
  }

  let minCost = Infinity;
  let bestOpIndex = -1;

  for (const opRef of candidateOperations) {
    const currentOpDetails = operationCatalog[opRef];
    if (currentOpDetails && currentOpDetails.cost < minCost) {
      minCost = currentOpDetails.cost;
      bestOpIndex = opRef;
    }
  }
  return { minCost, operationIndex: bestOpIndex };
}

function solveProblem() {
  const [numItems, numOperations] = readIntegerArray();

  const operationCatalog = new Array(numOperations + 1);
  const itemToOperationMap = {};

  for (let i = 0; i < numOperations; i++) {
    const operationInputDetails = readIntegerArray();
    const opCost = operationInputDetails[0];
    const numItemsUnlockedByOp = operationInputDetails[1];
    const itemsUnlockedByThisOp = readIntegerArray();

    const currentOperationIdentifier = i + 1;
    
    const opDetail = {
      cost: opCost,
      success: itemsUnlockedByThisOp
    };
    operationCatalog[currentOperationIdentifier] = opDetail;

    for (let j = 0; j < numItemsUnlockedByOp; j++) {
      const unlockedItemKey = itemsUnlockedByThisOp[j];
      if (!itemToOperationMap.hasOwnProperty(unlockedItemKey)) {
        itemToOperationMap[unlockedItemKey] = [];
      }
      itemToOperationMap[unlockedItemKey].push(currentOperationIdentifier);
    }
  }

  let totalCostAccumulator = 0;
  const processedItemsSet = new Set();

  for (let itemIdentifier = 1; itemIdentifier <= numItems; itemIdentifier++) {
    if (!processedItemsSet.has(itemIdentifier)) {
      const { minCost, operationIndex } = findBestOperationToUnlockItem(
        itemIdentifier,
        itemToOperationMap,
        operationCatalog
      );

      if (minCost === -1) {
        printOutput(-1);
        return;
      }

      totalCostAccumulator += minCost;

      const newlyProcessedItems = operationCatalog[operationIndex].success;
      for (const unlockedItem of newlyProcessedItems) {
        processedItemsSet.add(unlockedItem);
      }
    }
  }

  printOutput(totalCostAccumulator);
}
