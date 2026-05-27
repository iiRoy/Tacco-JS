class InputLineProcessor {
  constructor(sourceLines) {
    this.sourceLines = sourceLines;
    this.currentPosition = 0;
  }

  hasMoreData() {
    return this.currentPosition < this.sourceLines.length;
  }

  retrieveNextLine() {
    if (!this.hasMoreData()) {
      throw new Error("InputBoundaryException: No more lines available.");
    }
    return this.sourceLines[this.currentPosition++];
  }
}

let globalInputProcessor;
let collectedInputBuffer = [];

require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', function(inputLine) {
  collectedInputBuffer.push(inputLine);
}).on('close', function() {
  globalInputProcessor = new InputLineProcessor(collectedInputBuffer);
  console.error("\n");
  const executionStart = process.hrtime.bigint();
  mainProgramLogic();
  const executionEnd = process.hrtime.bigint();
  const durationMilliseconds = Number(executionEnd - executionStart) / 1_000_000;

  logDiagnostic("execution time : " + durationMilliseconds.toFixed(3) + "ms");
  logDiagnostic("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function getNextInteger() { return convertInput(globalInputProcessor.retrieveNextLine(), 1); }
function getNextStringArray() { return convertInput(globalInputProcessor.retrieveNextLine(), 2); }
function getNextIntegerArray() { return convertInput(globalInputProcessor.retrieveNextLine(), 4); }
function getNextCharacterArray() { return convertInput(globalInputProcessor.retrieveNextLine(), 6); }
function getNextLine() { return globalInputProcessor.retrieveNextLine(); }
function hasMoreLines() { return globalInputProcessor.hasMoreData(); }

function outputResult(content) { console.log(content); }
function logDiagnostic(message) { console.error("debug_info:" + require("util").inspect(message, false, null)); }

function convertInput(dataItem, conversionMode) {
  try {
    switch (conversionMode) {
      case 1: return parseInt(dataItem, 10);
      case 2: return dataItem.split(" ");
      case 4: return dataItem.split(" ").map(Number);
      case 6: return dataItem.split("");
      case 7: return dataItem.split("").map(Number);
      case 8: return dataItem.join(" ");
      case 9: return dataItem.join("\n");
      case 0: return dataItem.join("");
      default: return dataItem;
    }
  } catch (err) {
    return dataItem;
  }
}

// Recursive function to determine the state of an item
// `itemIndex` is 0-based
// `totalCount` is N
// `desiredParities` is the input `list`
// `memoizedStates` stores computed results to avoid re-calculation
function determineItemState(itemIndex, totalCount, desiredParities, memoizedStates) {
  // If the state for this index has already been computed, return it
  if (memoizedStates[itemIndex] !== undefined) {
    return memoizedStates[itemIndex];
  }

  const currentFactor = itemIndex + 1; // 1-based factor for multiples
  let accumulatedParityFromMultiples = 0;

  // Iterate through multiples of `currentFactor` that are *after* `itemIndex`
  // i.e., `k = (j * currentFactor) - 1`, where `k > itemIndex`
  // This implies `j * currentFactor > itemIndex + 1`, so `j` starts from 2.
  for (let j = 2; j * currentFactor <= totalCount; j++) {
    const multipleItemIndex = (j * currentFactor) - 1;
    // Recursively determine the state for this multiple index
    // Memoization ensures this is computed only once
    accumulatedParityFromMultiples ^= determineItemState(multipleItemIndex, totalCount, desiredParities, memoizedStates);
  }

  // The state for `itemIndex` is chosen such that:
  // (state_at_itemIndex + accumulatedParityFromMultiples) % 2 == desiredParities[itemIndex] % 2
  // Using XOR for parity: state_at_itemIndex = (desiredParities[itemIndex] & 1) ^ accumulatedParityFromMultiples
  const finalStateForCurrent = (desiredParities[itemIndex] & 1) ^ accumulatedParityFromMultiples;
  memoizedStates[itemIndex] = finalStateForCurrent;
  return finalStateForCurrent;
}

function mainProgramLogic() {
  const totalElements = getNextInteger(); // N
  const inputParityTargets = getNextIntegerArray(); // list

  // Array to store the computed states (0 or 1) for each element
  // Initialized with `undefined` to indicate uncomputed states for memoization
  const computedElementStates = new Array(totalElements).fill(undefined);

  // Trigger the recursive computation for all elements, starting from the last one
  // The memoization within `determineItemState` handles dependencies efficiently
  for (let i = totalElements - 1; i >= 0; i--) {
    determineItemState(i, totalElements, inputParityTargets, computedElementStates);
  }

  const selectedIndices = [];
  for (let i = 0; i < totalElements; i++) {
    if (computedElementStates[i] === 1) {
      selectedIndices.push(i + 1); // Output 1-based index
    }
  }

  outputResult(selectedIndices.length);
  if (selectedIndices.length > 0) {
    outputResult(convertInput(selectedIndices, 8));
  }
}
