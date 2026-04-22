let inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataIterator;
let collectedRawLines = [];

// Custom logger for debug output
const debugLogger = (message) => {
  // Using a simpler debug output without util.inspect
  console.error(`[DBG]: ${message}`);
};

// Custom output printer
const printFinalResult = (value) => {
  console.log(value);
};

// Function to safely parse and transform input values
// Mode 1: Integer
// Mode 2: Space-separated string array
// Mode 3: Space-separated integer array
// Mode 4: Character array
// Mode 5: Character array of integers
// Mode 6: Join array with space
// Mode 7: Join array with newline
// Mode 8: Join array without separator
const processInputConversion = (inputVal, conversionMode) => {
  if (inputVal === null || typeof inputVal === 'undefined') {
    debugLogger("Warning: Input value is null or undefined for conversion.");
    return null;
  }
  try {
    switch (conversionMode) {
      case 1: // Integer
        const parsedInt = Number.parseInt(inputVal, 10);
        if (Number.isNaN(parsedInt)) {
          debugLogger(`Failed to parse "${inputVal}" as integer.`);
          return null; // Or throw an error, depending on desired robustness
        }
        return parsedInt;
      case 2: // Space-separated string array
        return String(inputVal).trim().split(/\s+/);
      case 3: // Space-separated integer array
        return String(inputVal).trim().split(/\s+/).map(numStr => {
          const num = Number.parseInt(numStr, 10);
          if (Number.isNaN(num)) {
            debugLogger(`Failed to parse "${numStr}" as integer in array.`);
            return null; // Filter out later or handle
          }
          return num;
        }).filter(n => n !== null);
      case 4: // Character array
        return String(inputVal).split('');
      case 5: // Character array of integers
        return String(inputVal).split('').map(char => {
          const num = Number.parseInt(char, 10);
          if (Number.isNaN(num)) {
            debugLogger(`Failed to parse "${char}" as integer in char array.`);
            return null;
          }
          return num;
        }).filter(n => n !== null);
      case 6: // Join array with space
        return Array.isArray(inputVal) ? inputVal.join(' ') : String(inputVal);
      case 7: // Join array with newline
        return Array.isArray(inputVal) ? inputVal.join('\n') : String(inputVal);
      case 8: // Join array without separator
        return Array.isArray(inputVal) ? inputVal.join('') : String(inputVal);
      default:
        debugLogger(`Unknown conversion mode: ${conversionMode}. Returning original input.`);
        return inputVal;
    }
  } catch (e) {
    debugLogger(`Error during input conversion for "${inputVal}" (mode ${conversionMode}): ${e.message}`);
    return inputVal; // Return original in case of error
  }
};

// Renamed and refactored input acquisition functions
const fetchNextInteger = () => processInputConversion(dataIterator.obtainNext(), 1);
const fetchNextStringList = () => processInputConversion(dataIterator.obtainNext(), 2);
const fetchNextIntegerList = () => processInputConversion(dataIterator.obtainNext(), 3);
const fetchNextCharList = () => processInputConversion(dataIterator.obtainNext(), 4);

// Function to get the next item from the iterator
const getNextDataEntry = () => dataIterator.obtainNext();
// Function to check if more items are available
const hasMoreDataEntries = () => dataIterator.canProceed();

// Custom iterator for processed input lines
const createInputDataIterator = (inputLines) => {
  let currentPosition = 0;
  const totalItems = inputLines.length;

  // Added a guard clause for empty input
  if (totalItems === 0) {
    debugLogger("Warning: No input lines provided to iterator.");
  }

  return {
    sourceData: inputLines,
    currentPosition: currentPosition,
    totalItems: totalItems,

    canProceed: function() {
      return this.currentPosition < this.totalItems;
    },

    obtainNext: function() {
      if (!this.canProceed()) {
        debugLogger("Error: Attempted to read past end of input. Returning null.");
        return null; // Instead of throwing, return null for robustness
      }
      const currentDataItem = this.sourceData[this.currentPosition];
      this.currentPosition++;
      return currentDataItem;
    }
  };
};

inputHandler.on('line', (lineContent) => {
  collectedRawLines.push(lineContent);
});

inputHandler.on('close', () => {
  debugLogger("--- Processing started ---");
  const startTime = performance.now(); // Using performance.now for higher resolution timing

  // Initialize data iterator
  dataIterator = createInputDataIterator(collectedRawLines);

  // Added a guard clause for no input
  if (!dataIterator.canProceed()) {
    debugLogger("No input data available. Exiting.");
    printFinalResult(0); // Or handle as an error
    return;
  }

  executeMainAlgorithm();

  const endTime = performance.now();
  const elapsedTime = endTime - startTime;
  debugLogger("--- Processing finished ---");
  debugLogger(`Execution time: ${elapsedTime.toFixed(3)} ms`);
});

// The core algorithm function, heavily refactored
function executeMainAlgorithm() {
  const sequenceLength = fetchNextInteger();

  // Basic input validation
  if (sequenceLength === null || sequenceLength <= 0) {
    debugLogger(`Invalid sequence length: ${sequenceLength}. Must be a positive integer.`);
    printFinalResult(0);
    return;
  }

  // Read the initial numbers into an array
  let initialNumbers = [];
  for (let k = 0; k < sequenceLength; k++) {
    const num = fetchNextInteger();
    if (num === null) {
      debugLogger(`Failed to read integer at index ${k}. Aborting.`);
      printFinalResult(0);
      return;
    }
    initialNumbers.push(num);
  }

  // Ensure the array is sorted
  initialNumbers.sort((valA, valB) => valA - valB);

  // This will store the reordered sequence
  let reorderedSequence = [];
  // Initialize the reordered sequence with the smallest element
  // Using splice for a different array manipulation method
  reorderedSequence.push(initialNumbers.splice(0, 1)[0]);

  // Variables to track the running sum of differences
  let accumulatedDifference = 0;

  // Continue processing as long as there are numbers left to add
  while (initialNumbers.length > 0) {
    const firstInQueue = reorderedSequence[0];
    const lastInQueue = reorderedSequence[reorderedSequence.length - 1];
    const firstAvailable = initialNumbers[0];
    const lastAvailable = initialNumbers[initialNumbers.length - 1];

    // Calculate potential differences for all 4 scenarios
    // Option 1: Add firstAvailable to front (next to firstInQueue)
    const diff1 = Math.abs(firstAvailable - firstInQueue);
    // Option 2: Add firstAvailable to back (next to lastInQueue)
    const diff2 = Math.abs(firstAvailable - lastInQueue);
    // Option 3: Add lastAvailable to front (next to firstInQueue)
    const diff3 = Math.abs(lastAvailable - firstInQueue);
    // Option 4: Add lastAvailable to back (next to lastInQueue)
    const diff4 = Math.abs(lastAvailable - lastInQueue);

    // Determine the best move to maximize the *current* difference
    // This logic is simplified and rewritten from the original's nested if-else
    // by comparing all four options directly.
    let bestOption = { diff: -1, source: null, target: null }; // source: 'front' or 'back' of initialNumbers, target: 'front' or 'back' of reorderedSequence

    if (diff1 > bestOption.diff) {
      bestOption = { diff: diff1, source: 'front', target: 'front' };
    }
    if (diff2 > bestOption.diff) {
      bestOption = { diff: diff2, source: 'front', target: 'back' };
    }
    if (diff3 > bestOption.diff) {
      bestOption = { diff: diff3, source: 'back', target: 'front' };
    }
    if (diff4 > bestOption.diff) {
      bestOption = { diff: diff4, source: 'back', target: 'back' };
    }
    // Handle ties: if multiple options have the same max difference, the original code's
    // implicit tie-breaking (order of if statements) is hard to replicate exactly.
    // For Type III, we can choose a consistent tie-breaking rule, e.g., prefer
    // front of initialNumbers, then front of reorderedSequence.
    // The previous `if` statements naturally implement a 'last one wins' tie-breaker.

    if (bestOption.source === 'front') {
      const elementToAdd = initialNumbers.shift();
      if (bestOption.target === 'front') {
        reorderedSequence.unshift(elementToAdd);
      } else { // bestOption.target === 'back'
        reorderedSequence.push(elementToAdd);
      }
    } else { // bestOption.source === 'back'
      const elementToAdd = initialNumbers.pop();
      if (bestOption.target === 'front') {
        reorderedSequence.unshift(elementToAdd);
      } else { // bestOption.target === 'back'
        reorderedSequence.push(elementToAdd);
      }
    }
  }

  // Calculate the total absolute difference between adjacent elements
  for (let j = 1; j < sequenceLength; j++) {
    accumulatedDifference += Math.abs(reorderedSequence[j - 1] - reorderedSequence[j]);
  }

  printFinalResult(accumulatedDifference);
}