const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let streamParser = null;
let capturedLines = [];

inputHandler.on('line', function(singleLine) {
  capturedLines.push(singleLine);
});

inputHandler.on('close', function() {
  streamParser = initializeStreamParser(capturedLines);
  
  debugLog("--- Application Execution Starting ---");
  const startTime = new Date();
  
  performCalculation();
  
  const finishTime = new Date();
  const elapsedTime = finishTime - startTime;
  
  debugLog("--- Application Execution Completed ---");
  debugLog(`Elapsed time: ${elapsedTime} ms`);
  
  const memoryStats = process.memoryUsage();
  debugLog(`Memory Usage (Heap): ${Math.round(memoryStats.heapUsed / 1024)} KB used / ${Math.round(memoryStats.heapTotal / 1024)} KB total`);
});

function retrieveInteger() { return dataConverter(getNextLine(), 1); }
function retrieveStringArray() { return dataConverter(getNextLine(), 2); }
function retrieveIntegerArray() { return dataConverter(getNextLine(), 4); }
function retrieveCharacterArray() { return dataConverter(getNextLine(), 6); }

function getNextLine() { return streamParser.pullNext(); }
function hasMoreLines() { return streamParser.checkAvailability(); }

function initializeStreamParser(rawInputData) {
  if (!Array.isArray(rawInputData)) {
    debugLog("Error: Input data for parser initialization is not an array. Proceeding with empty data.");
    rawInputData = [];
  }
  
  const parserInstance = {
    sourceData : rawInputData,
    currentPosition : 0,
    totalLines : rawInputData.length,
    
    checkAvailability : function() {
      return (this.currentPosition < this.totalLines);
    },
    
    pullNext : function() {
      if (!this.checkAvailability()) {
        debugLog("Attempted to read beyond available input lines. Returning null.");
        return null; // Changed from throwing a string error
      } else {
        const currentInputLine = this.sourceData[this.currentPosition];
        this.currentPosition++;
        return currentInputLine;
      }
    }
  };
  
  if (parserInstance.totalLines === 0) {
    debugLog("Parser initialized with no input lines.");
  }
  
  return parserInstance;
}

function printResult(messageContent) {
  console.log(messageContent);
}

function debugLog(messageContent) {
  const timestamp = new Date().toISOString();
  console.error(`[DEBUG ${timestamp}] ${messageContent}`);
}

// This object maps conversion type numbers to their respective functions.
// This is a Type III change from a switch statement for better extensibility and readability.
const conversionOperations = {
  1: (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      debugLog(`Warning: Failed to parse "${val}" as an integer. Returning original value.`);
      return val;
    }
    return num;
  },
  2: (val) => String(val).trim().split(" "),
  4: (val) => String(val).trim().split(" ").map(Number),
  6: (val) => String(val).split(""),
  7: (val) => String(val).split("").map(Number),
  8: (val) => Array.isArray(val) ? val.join(" ") : String(val),
  9: (val) => Array.isArray(val) ? val.join("\n") : String(val),
  0: (val) => Array.isArray(val) ? val.join("") : String(val),
};

function dataConverter(inputValue, conversionType) {
  try {
    const operation = conversionOperations[conversionType];
    if (operation) {
      return operation(inputValue);
    } else {
      debugLog(`Unknown conversion type '${conversionType}' requested. Returning input as-is.`);
      return inputValue;
    }
  } catch (conversionError) {
    debugLog(`Error during data conversion for type ${conversionType}: ${conversionError.message}. Input: "${inputValue}". Returning original input.`);
    return inputValue;
  }
}

// Main logic for the problem solution
function performCalculation() {
  const initialValue = retrieveInteger();
  
  // Type III: Added input validation guard clause.
  // Original code would loop infinitely for N=0 or throw error for non-numeric.
  if (initialValue === null || isNaN(initialValue) || initialValue <= 0) {
    debugLog(`Invalid or non-positive initial value detected: ${initialValue}. Halting calculation.`);
    printResult("Error: Invalid or unsuitable input provided.");
    return;
  }

  let iterationCount = 0;
  let currentSum = 0;

  // Type III: Introduced a named constant for the magic number 360 for clarity.
  const DEGREES_IN_FULL_CIRCLE = 360;
  
  // Type III: Added a safety maximum iteration count to prevent infinite loops
  // in unforeseen edge cases, though for positive N this loop should always converge.
  const MAX_PERMITTED_ITERATIONS = 1000000; 

  while (true) {
    currentSum += initialValue;
    iterationCount++;
    
    // Type III: Introduced an intermediate variable for the modulo operation result.
    const currentRemainder = currentSum % DEGREES_IN_FULL_CIRCLE;

    if (currentRemainder === 0) {
      printResult(iterationCount);
      return;
    }

    if (iterationCount > MAX_PERMITTED_ITERATIONS) {
      debugLog(`Calculation exceeded ${MAX_PERMITTED_ITERATIONS} iterations without finding a multiple of ${DEGREES_IN_FULL_CIRCLE}. Exiting.`);
      printResult("Calculation limit reached; result not found.");
      return;
    }
  }
}