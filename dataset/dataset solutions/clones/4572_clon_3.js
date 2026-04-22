const inputSource = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputStreamProcessor;
const capturedLines = [];

inputSource.on('line', (currentLine) => {
  capturedLines.push(currentLine);
});

inputSource.on('close', () => {
  // Guard against empty input, although competitive programming usually guarantees it.
  if (capturedLines.length === 0) {
      logDebugMessage("Warning: No input lines were provided. Exiting.");
      return;
  }

  inputStreamProcessor = createInputHandler(capturedLines);
  
  const executionStart = Date.now();
  
  calculateOptimalSplit();
  
  const executionEnd = Date.now();
  const durationMillis = executionEnd - executionStart;
  logDebugMessage(`Execution time: ${durationMillis} ms`);
  
  const currentMemoryUsage = process.memoryUsage();
  const heapTotalKB = Math.round(currentMemoryUsage.heapTotal / 1024);
  logDebugMessage(`Heap memory used: ${heapTotalKB} KB`);
});

// The 'makeClone' function was not utilized in the main logic and has been removed.

// Renamed helper functions for input processing
function getNextInteger() { return convertInput(getRawNextElement(), 1); }
function getNextStringArray() { return convertInput(getRawNextElement(), 2); }
function getNextIntegerArray() { return convertInput(getRawNextElement(), 4); }
function getNextCharList() { return convertInput(getRawNextElement(), 6); }

function getRawNextElement() { return inputStreamProcessor.fetchNext(); }
function hasMoreInput() { return inputStreamProcessor.canProceed(); }

// Refactored the input handler as a factory function with explicit state management.
function createInputHandler(allInputLines) {
  let currentLineIndex = 0;
  const totalAvailableLines = allInputLines.length;

  return {
    canProceed: function() {
      // Added a type check for robustness, even if input is typically guaranteed.
      if (!Array.isArray(allInputLines)) {
          console.error("Input source is not a valid array of lines.");
          return false;
      }
      return (currentLineIndex < totalAvailableLines);
    },
    fetchNext: function() {
      if (this.canProceed()) {
        return allInputLines[currentLineIndex++];
      } else {
        // Changed error type and message for clarity.
        throw new Error("Input stream exhausted: No further elements available.");
      }
    }
  };
}

// Renamed and slightly altered output function.
function displayResult(finalOutput) {
  console.log(finalOutput);
}

// Renamed debug logging function and simplified its internal implementation.
function logDebugMessage(messageContent) {
  // Removed the 'util.inspect' dependency for a simpler debug output.
  console.info(`[APP_DEBUG] ${messageContent}`); 
}

// Renamed and refactored the conversion utility.
// Replaced switch with if/else if, added a default parameter value.
function convertInput(dataItem, conversionType = 0) {
  try {
    if (conversionType === 1) {
      return parseInt(dataItem, 10); // Explicitly specifying radix.
    } else if (conversionType === 2) {
      return dataItem.split(" ");
    } else if (conversionType === 4) {
      return dataItem.split(" ").map(Number);
    } else if (conversionType === 6) {
      return dataItem.split("");
    } else if (conversionType === 7) {
      return dataItem.split("").map(Number);
    } else if (conversionType === 8) {
      // Added array check as join expects an array.
      return Array.isArray(dataItem) ? dataItem.join(" ") : String(dataItem);
    } else if (conversionType === 9) {
      return Array.isArray(dataItem) ? dataItem.join("\n") : String(dataItem);
    } else if (conversionType === 0) {
      return Array.isArray(dataItem) ? dataItem.join("") : String(dataItem);
    } else {
      // Default return for unrecognized conversion types.
      return dataItem;
    }
  } catch (conversionError) {
    // Log the error but return original item, maintaining original behavior on error.
    logDebugMessage(`Error during conversion for item "${dataItem}" (type ${conversionType}): ${conversionError.message}`);
    return dataItem;
  }
}

// Main logic for the problem, heavily refactored.
function calculateOptimalSplit() {
  const initialDimensions = getNextIntegerArray();
  let currentRectHeight = initialDimensions[0];
  let currentRectWidth = initialDimensions[1];
  
  // Using a numeric constant for initial minimum difference.
  let overallMinimumDifference = Number.MAX_SAFE_INTEGER;

  // Encapsulating the core calculation logic into a reusable helper function.
  // This is a major Type III structural addition/refactoring.
  const determineMinDiffForOrientation = (heightAxis, widthAxis) => {
    let orientationMinDifference = Number.MAX_SAFE_INTEGER;

    // Loop through possible cut positions along the height axis.
    for (let cutPosition = 1; cutPosition <= heightAxis - 2; cutPosition++) {
      const segmentOneLength = cutPosition;
      const remainingDimension = heightAxis - cutPosition;

      const segmentTwoLength = Math.floor(remainingDimension / 2);
      const segmentThreeLength = Math.ceil(remainingDimension / 2);
      
      // Using spread operator for Math.max/min for conciseness.
      const allSegmentLengths = [segmentOneLength, segmentTwoLength, segmentThreeLength];
      const maxSegmentLength = Math.max(...allSegmentLengths);
      const minSegmentLength = Math.min(...allSegmentLengths);
      
      // Calculate difference for a "straight cut" along the width.
      const straightCutDiff = (maxSegmentLength - minSegmentLength) * widthAxis;
      orientationMinDifference = Math.min(orientationMinDifference, straightCutDiff);
      
      // Now consider a "mixed cut" scenario: one straight cut, then the remainder split.
      const splitRemainderWidthA = Math.floor(widthAxis / 2);
      const splitRemainderWidthB = widthAxis - splitRemainderWidthA;
      
      const areaPart1 = segmentOneLength * widthAxis;
      const areaPart2 = remainingDimension * splitRemainderWidthA;
      const areaPart3 = remainingDimension * splitRemainderWidthB;
      
      const allAreaParts = [areaPart1, areaPart2, areaPart3];
      const maxAreaPart = Math.max(...allAreaParts);
      const minAreaPart = Math.min(...allAreaParts);
      
      // Calculate difference for the mixed cut scenario.
      const mixedCutDiff = maxAreaPart - minAreaPart;
      orientationMinDifference = Math.min(orientationMinDifference, mixedCutDiff);
    }
    return orientationMinDifference;
  };

  // First evaluation pass with the original dimensions (H x W).
  overallMinimumDifference = Math.min(overallMinimumDifference, determineMinDiffForOrientation(currentRectHeight, currentRectWidth));
  
  // Swap dimensions to evaluate the second orientation (W x H).
  const temporaryDimensionHolder = currentRectHeight;
  currentRectHeight = currentRectWidth;
  currentRectWidth = temporaryDimensionHolder;
  
  // Second evaluation pass with the swapped dimensions.
  overallMinimumDifference = Math.min(overallMinimumDifference, determineMinDiffForOrientation(currentRectHeight, currentRectWidth));
  
  // Output the final computed minimum difference.
  displayResult(overallMinimumDifference);
}