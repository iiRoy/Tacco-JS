function DataStreamHandler(sourceTextContent) {
  // Input validation for the source text
  if (typeof sourceTextContent !== 'string' || sourceTextContent.trim().length === 0) {
    // Initialize with an empty array if input is invalid or empty
    this.sourceLines = [];
    this.readPointer = 0;
    this.processedLineCache = new Map(); // Cache for lines processed by extractNextItem
    // console.warn("Warning: DataStreamHandler initialized with empty or invalid source content.");
    return;
  }

  // Type II: Renamed _s to sourceLines, _y to readPointer
  // Type III: Use a more robust regex for splitting lines (\r?\n for Windows/Unix compatibility)
  this.sourceLines = sourceTextContent.split(/\r?\n/);
  this.readPointer = 0;

  // Type III: Introduce a cache to handle the mutable nature of the original 'a' method's line processing.
  // The original method modifies s[y] in place, so subsequent calls on the same line see the modified version.
  this.processedLineCache = new Map(); // Stores array of tokens for a given line index
}

// Type II: Renamed prototype methods
DataStreamHandler.prototype = {
  // Type II: Renamed 'a' to 'extractNextItem', 'f' to 'convertToNumber'
  // Type III: Added more explicit checks, intermediate variables, and robust parsing
  extractNextItem: function(convertToNumber) {
    const currentLineIdx = this.readPointer;
    let lineTokens;

    // Type III: Check if the line has already been processed and cached for single item extraction
    if (this.processedLineCache.has(currentLineIdx)) {
      lineTokens = this.processedLineCache.get(currentLineIdx);
    } else {
      // Type III: Guard against reading beyond the available lines
      if (currentLineIdx >= this.sourceLines.length) {
        // Return a default value for end of stream
        return convertToNumber ? null : undefined;
      }

      const rawLineSegment = this.sourceLines[currentLineIdx];
      // Type III: Handle empty or whitespace-only lines
      if (!rawLineSegment || rawLineSegment.trim().length === 0) {
        this.readPointer++; // Advance past empty line
        return convertToNumber ? null : undefined;
      }

      // Type III: Split by one or more whitespace characters, filter out empty strings
      lineTokens = rawLineSegment.split(/\s+/).filter(Boolean);
      lineTokens.reverse(); // Mimics the original 'a' method's behavior of reversing the line
      this.processedLineCache.set(currentLineIdx, lineTokens); // Cache the processed tokens
    }

    let itemValue = null;
    if (lineTokens.length > 0) {
      itemValue = lineTokens.pop(); // Extract the last token (which was originally the first after reverse)
    }

    // Type III: If the current line is exhausted, advance the read pointer and clear its cache entry
    if (lineTokens.length === 0) {
      this.readPointer++;
      this.processedLineCache.delete(currentLineIdx); // Clean up cache for exhausted line
    }

    // Type III: Explicit conversion using Number() and null for invalid numbers
    if (convertToNumber) {
      const numericVal = Number(itemValue);
      return isNaN(numericVal) ? null : numericVal;
    } else {
      return itemValue;
    }
  },

  // Type II: Renamed 'l' to 'retrieveLineTokens', 'f' to 'asRawStrings'
  // Type III: Added intermediate variables, explicit checks, and robust parsing
  retrieveLineTokens: function(asRawStrings) {
    const targetLineIndex = this.readPointer;
    this.readPointer++; // Always advance the line pointer after reading a full line
    this.processedLineCache.delete(targetLineIndex); // Clear cache for this line, as it's fully consumed

    // Type III: Guard against reading beyond available lines
    if (targetLineIndex >= this.sourceLines.length) {
      return []; // Return an empty array if end of stream reached
    }

    const currentLineContent = this.sourceLines[targetLineIndex];
    // Type III: Handle empty or whitespace-only lines
    if (!currentLineContent || currentLineContent.trim().length === 0) {
      return [];
    }

    const rawSegments = currentLineContent.split(/\s+/).filter(Boolean);

    if (asRawStrings) {
      return rawSegments;
    } else {
      // Type III: Map to numbers, filtering out any values that don't convert correctly
      return rawSegments.map(strVal => {
        const num = Number(strVal);
        return isNaN(num) ? null : num; // Return null for non-numeric strings
      }).filter(val => val !== null); // Filter out the nulls
    }
  },

  // Type II: Renamed 'm' to 'getMultiLineData', 'n' to 'linesToReadCount', 'f' to 'keepStringValues'
  // Type III: Changed loop structure, used push, added validation
  getMultiLineData: function(linesToReadCount, keepStringValues) {
    // Type III: Input validation for linesToReadCount
    if (typeof linesToReadCount !== 'number' || linesToReadCount <= 0) {
      // console.warn("Invalid number of lines requested for getMultiLineData. Returning empty array.");
      return [];
    }

    const collectedMatrix = [];
    let currentLinesRead = 0; // Type III: Explicit counter for loop
    const maxLinesAvailable = this.sourceLines.length;

    while (currentLinesRead < linesToReadCount) {
      const lineToProcessIndex = this.readPointer;

      // Type III: Guard against reading beyond the available content
      if (lineToProcessIndex >= maxLinesAvailable) {
        // console.warn(`Prematurely reached end of stream while reading block. Read ${currentLinesRead} of ${linesToReadCount} lines.`);
        break; // Stop if no more lines are available
      }

      this.readPointer++; // Advance the main read pointer
      this.processedLineCache.delete(lineToProcessIndex); // Clear cache for this line

      const lineData = this.sourceLines[lineToProcessIndex];
      let processedSegmentsForLine;

      // Type III: Handle empty or whitespace-only lines
      if (!lineData || lineData.trim().length === 0) {
        processedSegmentsForLine = [];
      } else {
        const initialSegments = lineData.split(/\s+/).filter(Boolean);
        if (keepStringValues) {
          processedSegmentsForLine = initialSegments;
        } else {
          processedSegmentsForLine = initialSegments.map(strVal => {
            const num = Number(strVal);
            return isNaN(num) ? null : num;
          }).filter(val => val !== null);
        }
      }
      collectedMatrix.push(processedSegmentsForLine); // Type III: Use push instead of direct index assignment
      currentLinesRead++;
    }
    return collectedMatrix;
  },
};

// Type III: Break down file reading into steps, use a constant for stdin path, add error handling
const STANDARD_INPUT_PATH = "/dev/stdin";
let fileContentBuffer = '';
try {
  fileContentBuffer = require("fs").readFileSync(STANDARD_INPUT_PATH, "utf8");
} catch (fileError) {
  console.error(`Error reading from standard input (${STANDARD_INPUT_PATH}): ${fileError.message}`);
  // In a production environment, you might exit or provide fallback data
  fileContentBuffer = ''; // Ensure it's an empty string for DataStreamHandler to handle
}

// Type II: Renamed 'o' to 'inputProcessor'
const inputProcessor = new DataStreamHandler(fileContentBuffer);

// Type III: Moved median calculation to a top-level helper function for better modularity
function calculateMedianOfSortedNumericArray(numericArray) {
  // Type III: Guard clause for empty or invalid input array
  if (!Array.isArray(numericArray) || numericArray.length === 0) {
    // console.warn("Attempted to calculate median for an empty or invalid array.");
    return null;
  }

  // Type III: Create a shallow copy and sort it to avoid modifying the original array reference.
  // The original `middle` function sorted its input array directly.
  const sortedCopy = [...numericArray].sort((valA, valB) => valA - valB);

  // Type III: Use Math.floor for the middle index, which correctly handles both odd and even lengths
  // for the purpose of finding the "middle element" (e.g., lower of two for even length).
  const medianIndex = Math.floor(sortedCopy.length / 2);
  return sortedCopy[medianIndex];
}

// Type II: Renamed 'main' to 'executeProcessingWorkflow'
function executeProcessingWorkflow() {
  // Type II: Renamed 'n' to 'totalItemsCount'
  // Type III: Added checks for successful parsing
  const totalItemsCount = inputProcessor.extractNextItem(true);
  if (totalItemsCount === null || typeof totalItemsCount !== 'number' || isNaN(totalItemsCount)) {
    console.error("Failed to read the initial count of elements. Exiting workflow.");
    return null;
  }

  // Type II: Renamed 'a' to 'initialNumericSequence'
  const initialNumericSequence = inputProcessor.retrieveLineTokens(false);
  if (!initialNumericSequence || initialNumericSequence.length === 0) {
    console.error("Failed to read the initial numeric sequence. Exiting workflow.");
    return null;
  }

  // Type II: Renamed 'b' to 'derivedPairwiseMaxes'
  const derivedPairwiseMaxes = [];

  // Type III: Rewritten base case with a helper and explicit return
  if (totalItemsCount <= 2) {
    // Type III: Added a local helper function for finding max in array
    const findMaxInArray = (arr) => {
      if (arr.length === 0) return null;
      let currentMaximum = arr[0];
      for (let k = 1; k < arr.length; k++) {
        if (arr[k] > currentMaximum) {
          currentMaximum = arr[k];
        }
      }
      return currentMaximum;
    };
    return findMaxInArray(initialNumericSequence);
  }

  // Type III: Changed loop variable, added intermediate variables for clarity
  for (let currentElementIndex = 0; currentElementIndex < initialNumericSequence.length - 1; currentElementIndex++) {
    const firstVal = initialNumericSequence[currentElementIndex];
    const secondVal = initialNumericSequence[currentElementIndex + 1];
    // Type III: Explicitly using Math.max
    derivedPairwiseMaxes.push(Math.max(firstVal, secondVal));
  }

  // Type III: Changed array concatenation method using spread syntax for immutability
  const finalCombinedSequence = [...initialNumericSequence, ...derivedPairwiseMaxes];

  // Type III: Call the top-level helper function for median calculation
  return calculateMedianOfSortedNumericArray(finalCombinedSequence);
}

// Type III: Wrap the main execution in a try-catch block for robust error handling
try {
  const finalComputationResult = executeProcessingWorkflow();
  if (finalComputationResult !== null) {
    console.log(finalComputationResult);
  } else {
    console.error("Program completed, but no valid result was obtained.");
  }
} catch (executionError) {
  console.error("An unexpected error occurred during program execution:", executionError.message);
  // console.error(executionError.stack); // Uncomment for detailed stack trace in debug scenarios
}