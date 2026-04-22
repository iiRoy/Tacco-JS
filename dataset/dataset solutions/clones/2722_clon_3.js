var InputUtilities=(function(){
  // Helper class to process input lines
  function LineProcessor(rawSourceText){
    // Ensure input is a string
    if (typeof rawSourceText !== 'string' || rawSourceText.trim() === '') {
      console.warn("Attempted to initialize LineProcessor with empty or invalid source text.");
      this._sourceLines = [];
      this._currentLinePointer = 0;
      this._currentLineWordBuffer = [];
      return;
    }
    // Split input into lines and store
    this._sourceLines = rawSourceText.trim().split("\n");
    // Pointer to the current line being processed
    this._currentLinePointer = 0;
    // Buffer for words when fetching individual values from a line
    this._currentLineWordBuffer = [];
  }

  // Method to fetch the next individual value (number or string)
  LineProcessor.prototype.fetchNextValue = function(returnAsStringFlag){
    // If the word buffer is empty, load words from the next line
    if (this._currentLineWordBuffer.length === 0) {
      if (this._currentLinePointer >= this._sourceLines.length) {
        throw new Error("Input stream exhausted. No more lines to read.");
      }
      const activeLine = this._sourceLines[this._currentLinePointer];
      // Split the line into words and reverse for efficient popping
      this._currentLineWordBuffer = activeLine.split(" ").reverse();
      this._currentLinePointer++; // Advance line pointer after processing
    }

    // Pop the last word from the buffer (which was the first word of the line)
    const extractedWord = this._currentLineWordBuffer.pop();

    // Return as string or convert to number
    return returnAsStringFlag ? extractedWord : Number(extractedWord);
  };

  // Method to fetch all values from the next line
  LineProcessor.prototype.fetchLineOfValues = function(returnAsStringFlag){
    if (this._currentLinePointer >= this._sourceLines.length) {
      throw new Error("Input stream exhausted. No more lines to read.");
    }
    // Directly take the next line, clear word buffer as this method consumes a whole line
    const lineContent = this._sourceLines[this._currentLinePointer++];
    this._currentLineWordBuffer = []; // Reset buffer as this line is fully consumed by this method
    const values = lineContent.split(" ");
    return returnAsStringFlag ? values : values.map(val => Number(val));
  };

  // Method to fetch a matrix (N lines of space-separated values)
  LineProcessor.prototype.fetchMatrixData = function(numRows, returnAsStringFlag){
    if (numRows < 0) {
      throw new Error("Invalid number of rows for matrix fetch: must be non-negative.");
    }
    const matrixRows = this._sourceLines.slice(this._currentLinePointer, this._currentLinePointer + numRows);
    this._currentLinePointer += numRows;
    this._currentLineWordBuffer = []; // Reset buffer

    if (returnAsStringFlag) {
      return matrixRows.map(row => row.split(" "));
    } else {
      return matrixRows.map(row => row.split(" ").map(val => Number(val)));
    }
  };

  // Method to fetch N raw lines as strings
  LineProcessor.prototype.fetchSequentialLines = function(numLines, returnAsStringFlag){
    if (numLines < 0) {
      throw new Error("Invalid number of lines for raw fetch: must be non-negative.");
    }
    const rawLines = this._sourceLines.slice(this._currentLinePointer, this._currentLinePointer + numLines);
    this._currentLinePointer += numLines;
    this._currentLineWordBuffer = []; // Reset buffer

    // If not returning as string, attempt to convert each line to a number (if it's a single number)
    return returnAsStringFlag ? rawLines : rawLines.map(line => Number(line));
  };

  // Factory function to create a new LineProcessor instance
  function createInputReader(sourceContent){
    return new LineProcessor(sourceContent);
  }

  return createInputReader;
})();

// Initialize input reader with content from standard input
var inputReader = InputUtilities(require("fs").readFileSync("/dev/stdin","utf8"));

/**
 * Performs a binary search to find the insertion point for a target value
 * in a sorted array, returning the index where the target would be inserted
 * to maintain sorted order, or the index of the first element greater than or equal to the target.
 * @param {Array<number>} sortedArray The array to search in.
 * @param {number} startIdx The starting index for the search range.
 * @param {number} endIdx The ending index (exclusive) for the search range.
 * @param {number} targetValue The value to search for.
 * @returns {number} The index where the target should be inserted.
 */
function binarySearchForIndex(sortedArray, startIdx, endIdx, targetValue){
  // Handle edge case for empty or invalid search range
  if (!sortedArray || sortedArray.length === 0 || startIdx >= endIdx) {
    return startIdx; // Or 0, depending on desired behavior for empty range
  }

  let low = startIdx;
  let high = endIdx; // high is exclusive

  while(low < high){
    const mid = Math.floor(low + (high - low) / 2); // Avoids overflow for very large low/high
    if(sortedArray[mid] < targetValue){
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

// Function to output results
function displayResult(resultArray){
  if (!resultArray || resultArray.length === 0) {
    // console.log("No result elements to display."); // Optional: log if empty
    return;
  }
  console.log(resultArray.join(" "));
}

// Main execution function
executeMainLogic();

function executeMainLogic(){
  const totalElementsCount = inputReader.fetchNextValue();
  const segmentLengthLimit = inputReader.fetchNextValue();
  const dataSequence = inputReader.fetchLineOfValues();

  // Guard clauses for invalid input sizes
  if (totalElementsCount <= 0 || segmentLengthLimit <= 0) {
    displayResult([]); // Output empty if invalid
    return;
  }
  if (dataSequence.length !== totalElementsCount) {
    console.error("Data sequence length mismatch with totalElementsCount.");
    displayResult([]);
    return;
  }

  // Create an index map for quick lookups of element positions
  const elementIndexMap = new Map(); // Using Map instead of object for potential non-string keys, though here numbers are keys
  for(let idx = 0; idx < totalElementsCount; idx++){
    const currentElement = dataSequence[idx];
    if(elementIndexMap.has(currentElement)){
      elementIndexMap.get(currentElement).push(idx);
    } else {
      elementIndexMap.set(currentElement, [idx]);
    }
  }

  let finalResultSequence;
  let initialDistinctElement = findFirstDistinctElement(0);

  // Special handling for k=1 or if no distinct element is found
  if(segmentLengthLimit === 1 || initialDistinctElement === -1){
    finalResultSequence = determineFinalSequence(0);
    displayResult(finalResultSequence);
    return;
  }

  // Array to store the starting elements of each segment
  const segmentStartingElements = [];
  segmentStartingElements.push(initialDistinctElement); // First element is the initial distinct one

  let lastFoundDistinctElement = initialDistinctElement;
  let currentSegmentIdx = 1;

  // Loop to find subsequent distinct elements for K segments
  for(; currentSegmentIdx < segmentLengthLimit; currentSegmentIdx++){
    const previousElement = segmentStartingElements[currentSegmentIdx - 1];
    const indicesOfPreviousElement = elementIndexMap.get(previousElement);

    // Guard: ensure element exists in map
    if (!indicesOfPreviousElement) {
      lastFoundDistinctElement = -1; // Indicate failure to find next segment
      break;
    }

    // Find the first occurrence of `previousElement` that is *after* the current position (0 in this loop's context)
    const insertionPoint = binarySearchForIndex(indicesOfPreviousElement, 0, indicesOfPreviousElement.length, 0);
    const startSearchAfterIndex = indicesOfPreviousElement[insertionPoint] + 1;

    lastFoundDistinctElement = findFirstDistinctElement(startSearchAfterIndex);
    if(lastFoundDistinctElement === -1){
      break; // No more distinct elements found
    }
    segmentStartingElements.push(lastFoundDistinctElement);
  }

  // Adjust currentSegmentIdx if loop broke due to `lastFoundDistinctElement === -1`
  // It should reflect the number of elements successfully found in `segmentStartingElements`
  if (lastFoundDistinctElement === -1) {
    // If we broke early, currentSegmentIdx is already incremented beyond the last successful one.
    // If segmentStartingElements is empty, this means no distinct elements at all.
    currentSegmentIdx = segmentStartingElements.length;
  }


  // Calculate starting point for the final sequence based on segmentLengthLimit and discovered segments
  let finalSequenceStartingPoint;
  const numSegmentsFound = segmentStartingElements.length;

  if (numSegmentsFound === 0) { // If no distinct elements were found at all
    finalSequenceStartingPoint = 0; // Default to start from beginning
  } else {
    // The number of *full* cycles of the found distinct elements pattern
    const fullCycles = Math.floor(segmentLengthLimit / numSegmentsFound);
    // The remainder indicates which element in the 'segmentStartingElements' array we need to target
    const remainderIndex = segmentLengthLimit % numSegmentsFound;

    if (remainderIndex === 0) {
      // If segmentLengthLimit is a multiple of numSegmentsFound, we need to start after the last element of the *previous* full cycle.
      // Or, if numSegmentsFound was 0 (which is handled above), this logic won't apply.
      // If we found 'numSegmentsFound' distinct elements, and k is a multiple, we effectively need to start after the LAST
      // element of the pattern found in 'segmentStartingElements'.
      if (lastFoundDistinctElement === -1) { // If the last segment could not be completed
        finalSequenceStartingPoint = 0; // Start from beginning, as the full pattern wasn't found
      } else {
        const targetElement = segmentStartingElements[numSegmentsFound - 1];
        const indices = elementIndexMap.get(targetElement);
        // Find the first index of 'targetElement' that is *after* the start (which is 0 here for the first full cycle)
        const insertion = binarySearchForIndex(indices, 0, indices.length, 0);
        finalSequenceStartingPoint = indices[insertion] + 1;
      }
    } else {
      // If there's a remainder, we start after the (remainderIndex - 1)-th element of the segmentStartingElements.
      const targetElement = segmentStartingElements[remainderIndex - 1];
      const indices = elementIndexMap.get(targetElement);

      if (!indices) { // Should not happen if targetElement was added to segmentStartingElements
        finalSequenceStartingPoint = 0;
      } else {
        const insertion = binarySearchForIndex(indices, 0, indices.length, 0);
        finalSequenceStartingPoint = indices[insertion] + 1;
      }
    }
  }

  finalResultSequence = determineFinalSequence(finalSequenceStartingPoint);
  displayResult(finalResultSequence);

  /**
   * Determines the final sequence of elements that appear only once after their first occurrence.
   * @param {number} startIndex The index in dataSequence to start the search from.
   * @returns {Array<number>} The resulting sequence.
   */
  function determineFinalSequence(startIndex){
    const currentResult = [];
    for(let currentPosition = startIndex; currentPosition < totalElementsCount; currentPosition++){
      const currentVal = dataSequence[currentPosition];
      const indicesForCurrentVal = elementIndexMap.get(currentVal);

      // Guard: Check if element exists in map
      if (!indicesForCurrentVal) {
        // This case implies an error or an element not originally in the sequence,
        // but given the map is built from dataSequence, this shouldn't happen.
        currentResult.push(currentVal); // Treat as distinct if no further occurrences are known
        continue;
      }

      // Find the index in indicesForCurrentVal where currentPosition + 1 would be inserted
      const nextOccurrenceIdx = binarySearchForIndex(indicesForCurrentVal, 0, indicesForCurrentVal.length, currentPosition + 1);

      if(nextOccurrenceIdx !== indicesForCurrentVal.length){
        // If an occurrence is found after currentPosition, skip to it
        currentPosition = indicesForCurrentVal[nextOccurrenceIdx];
      } else {
        // No further occurrences found, so add to result
        currentResult.push(currentVal);
      }
    }
    return currentResult;
  }

  /**
   * Finds the first element in the dataSequence (starting from startIndex)
   * that does not have another occurrence after its current position.
   * @param {number} startIndex The index in dataSequence to start the search from.
   * @returns {number} The value of the first distinct element, or -1 if none found.
   */
  function findFirstDistinctElement(startIndex){
    for(let currentPosition = startIndex; currentPosition < totalElementsCount; currentPosition++){
      const currentVal = dataSequence[currentPosition];
      const indicesForCurrentVal = elementIndexMap.get(currentVal);

      // Guard: Check if element exists in map
      if (!indicesForCurrentVal) {
        return currentVal; // Treat as distinct if no further occurrences are known
      }

      // Find the index in indicesForCurrentVal where currentPosition + 1 would be inserted
      const nextOccurrenceIdx = binarySearchForIndex(indicesForCurrentVal, 0, indicesForCurrentVal.length, currentPosition + 1);

      if(nextOccurrenceIdx !== indicesForCurrentVal.length){
        // If an occurrence is found after currentPosition, skip to it
        currentPosition = indicesForCurrentVal[nextOccurrenceIdx];
      } else {
        // No further occurrences found, this is our distinct element
        return currentVal;
      }
    }
    return -1; // No distinct element found in the remaining sequence
  }
}