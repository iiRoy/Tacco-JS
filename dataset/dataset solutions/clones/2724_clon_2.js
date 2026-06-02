var INPUT_PARSER=(function(){
  // This function serves as the factory for creating an InputReader instance.
  function createParser(sourceText){
    return new InputReader(sourceText);
  }

  // The InputReader constructor initializes the internal state.
  function InputReader(sourceText){
    this._sourceLines = sourceText.trim().split("\n"); // Split input into lines, remove leading/trailing whitespace.
    this._currentLineIndex = 0; // Keep track of the current line being processed.
  }

  // Reads a single item from the current line.
  // If 'asString' is true, returns the item as a string; otherwise, attempts to convert to a number.
  InputReader.prototype.readSingle=function(asString){
    var lineData = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var resultVal;

    // If the current line hasn't been split into individual items yet, do so.
    // Items are reversed so `pop()` can efficiently retrieve them from the "front" of the original line.
    if(typeof lineData[lineIdx]==="string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    resultVal = lineData[lineIdx].pop(); // Get the next item.

    // If the current line is exhausted, advance to the next line.
    if(!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or number based on the 'asString' flag.
    return asString ? resultVal : +resultVal;
  };

  // Reads an entire line as an array of items.
  // If 'asString' is true, returns items as strings; otherwise, attempts to convert to numbers.
  InputReader.prototype.readLine=function(asString){
    var lineItems = this._sourceLines[this._currentLineIndex++].split(" ");
    return asString ? lineItems : lineItems.map(numStr => +numStr);
  };

  // Reads 'numRows' lines as a 2D array (matrix).
  // If 'asString' is true, returns items as strings; otherwise, attempts to convert to numbers.
  InputReader.prototype.readMatrix=function(numRows, asString){
    var matrixData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                                      .map(line => line.split(" "));
    return asString ? matrixData : matrixData.map(row => row.map(item => +item));
  };

  // Reads 'numRows' lines as a 1D array.
  // If 'asString' is true, returns items as strings; otherwise, attempts to convert to numbers.
  InputReader.prototype.readRows=function(numRows, asString){
    var rowData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    return asString ? rowData : rowData.map(item => +item);
  };

  return createParser; // Return the factory function.
})();

// Create an instance of the input parser, reading from standard input.
var inputReaderInstance = INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

// Utility function to create multi-dimensional arrays.
// (Note: This function is present in the original but not used in the main logic,
//        it's cloned as per Type II rules.)
function createMultiDimArray(initialValue){
  var dimensions = arguments;
  var dimCount = dimensions.length;
  var arrayCreationString = "Array(dimensions["+ --dimCount +"]).fill(0).map(x=>{return "+initialValue+";})";
  while(--dimCount) {
    arrayCreationString = "Array(dimensions["+dimCount+"]).fill(0).map(x=>"+arrayCreationString+")";
  }
  return eval(arrayCreationString);
}

// Performs a binary search to find the lower bound index.
// Finds the first index 'i' in 'dataArray' such that dataArray[i] >= targetValue.
// 'startIndex' and 'endIndex' define the search range.
function findLowerBoundIndex(dataArray, startIndex, endIndex, targetValue){
  for(var midIndex; 1 < endIndex - startIndex;){
    midIndex = 0 | (startIndex + endIndex) / 2; // Calculate midpoint, using bitwise OR for floor.
    if (dataArray[midIndex] < targetValue) {
      startIndex = midIndex; // Target is in the upper half.
    } else {
      endIndex = midIndex; // Target is in the lower half or at midIndex.
    }
  }
  // After loop, startIndex and endIndex are adjacent. Check which one is the lower bound.
  return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}

// Execute the main processing logic.
processSequence();

// The primary function containing the algorithm.
function processSequence(){
  var totalElements = inputReaderInstance.readSingle(); // Read N
  var sequenceLength = inputReaderInstance.readSingle(); // Read K
  var inputSequence = inputReaderInstance.readLine(); // Read array A

  // Create a map to store indices for each unique element in the input sequence.
  // Key: element value, Value: array of indices where it appears.
  var elementIndicesMap = {};
  for(var idx = 0; idx < totalElements; idx++){
    var currentVal = inputSequence[idx];
    if(elementIndicesMap[currentVal]) {
      elementIndicesMap[currentVal].push(idx);
    } else {
      elementIndicesMap[currentVal] = [idx];
    }
  }

  var resultSequence = []; // Stores the final sequence of elements.

  // First pass: Identify elements that are not "skipped" by subsequent occurrences.
  for(var currentPos = 0; currentPos < totalElements; currentPos++){
    var currentElement = inputSequence[currentPos];
    // Find the index of the next occurrence of 'currentElement' that is strictly after 'currentPos'.
    var nextOccurrenceIdx = findLowerBoundIndex(elementIndicesMap[currentElement], 0, elementIndicesMap[currentElement].length, currentPos + 1);

    if(nextOccurrenceIdx !== elementIndicesMap[currentElement].length){
      // If a subsequent occurrence is found, skip to that position.
      currentPos = elementIndicesMap[currentElement][nextOccurrenceIdx];
    } else {
      // If no subsequent occurrence is found, add the current element to the result.
      resultSequence.push(currentElement);
    }
  }

  // Handle base cases for K=1 or an empty result sequence.
  if(sequenceLength === 1 || resultSequence.length === 0){
    if(resultSequence.length) {
      console.log(resultSequence.join(" "));
    }
    return;
  }

  // Initialize structures for the second phase of sequence generation.
  var seenElements = new Set(); // Tracks elements added to initialSequence.
  seenElements.add(resultSequence[0]);
  var initialSequence = [,resultSequence[0]]; // Stores the 'first' elements for K > 1. Note the leading comma to align indices.

  // Second pass: Generate the 'initialSequence' based on K.
  for(var idx = 1; idx < sequenceLength; idx++){
    var currentElement = initialSequence[idx]; // Get the element from the 'initialSequence'.
    // Find the first occurrence of 'currentElement' in the original inputSequence.
    var nextOccurrenceIdx = findLowerBoundIndex(elementIndicesMap[currentElement], 0, elementIndicesMap[currentElement].length, 0);

    resultSequence = []; // Reset result sequence for this iteration.
    var isFirstOccurrence = 0; // Flag to track if an element is the first in its 'ans' segment.

    // Iterate from the position after the found occurrence of 'currentElement'.
    for(var currentPos = elementIndicesMap[currentElement][nextOccurrenceIdx] + 1; currentPos < totalElements; currentPos++){
      var elementToCheck = inputSequence[currentPos];
      // Find the next occurrence of 'elementToCheck' after 'currentPos'.
      var nextIdx = findLowerBoundIndex(elementIndicesMap[elementToCheck], 0, elementIndicesMap[elementToCheck].length, currentPos + 1);

      if(nextIdx !== elementIndicesMap[elementToCheck].length){
        // If a subsequent occurrence is found, skip to that position.
        currentPos = elementIndicesMap[elementToCheck][nextIdx];
        isFirstOccurrence = 0; // Reset flag as we skipped.
      } else {
        // If no subsequent occurrence, add to current resultSequence.
        resultSequence.push(elementToCheck);
        if(isFirstOccurrence){
          // If this is the first element of a new segment and not yet seen, add to initialSequence.
          if(!seenElements.has(elementToCheck)){
            idx++; // Increment main loop counter.
            initialSequence.push(elementToCheck);
          } else {
            isFirstOccurrence = 0; // Reset flag if already seen.
          }
        }
        // If this is the very first element added to resultSequence in this inner loop,
        // mark it as seen and add to initialSequence.
        if(resultSequence.length === 1){
          seenElements.add(elementToCheck);
          initialSequence.push(elementToCheck);
          isFirstOccurrence = 1; // Set flag for subsequent elements.
        }
      }
    }
    if(resultSequence.length === 0) {
      break; // If no elements were added, break the outer loop.
    }
  }

  // Adjust the outer loop counter if the inner loop broke early.
  if(resultSequence.length === 0) {
    idx++;
  }

  // Calculate the remainder for the final sequence.
  var remainder = sequenceLength % idx;

  // Handle the case where remainder is 0.
  if(remainder === 0){
    if(resultSequence.length) {
      console.log(resultSequence.join(" "));
    }
    return;
  }

  var startPosition;
  // Determine the starting position for the final sequence generation.
  if(remainder === 1) {
    startPosition = 0;
  } else {
    var targetElement = initialSequence[remainder - 1];
    var firstTargetIdx = findLowerBoundIndex(elementIndicesMap[targetElement], 0, elementIndicesMap[targetElement].length, 0);
    startPosition = elementIndicesMap[targetElement][firstTargetIdx] + 1;
  }

  resultSequence = []; // Reset result sequence for the final pass.

  // Final pass: Generate the sequence starting from 'startPosition'.
  for(var currentPos = startPosition; currentPos < totalElements; currentPos++){
    var elementToProcess = inputSequence[currentPos];
    var nextElementIdx = findLowerBoundIndex(elementIndicesMap[elementToProcess], 0, elementIndicesMap[elementToProcess].length, currentPos + 1);

    if(nextElementIdx !== elementIndicesMap[elementToProcess].length){
      // If a subsequent occurrence is found, skip to that position.
      currentPos = elementIndicesMap[elementToProcess][nextElementIdx];
    } else {
      // If no subsequent occurrence, add to the final result sequence.
      resultSequence.push(elementToProcess);
    }
  }

  // Print the final result sequence if it's not empty.
  if(resultSequence.length) {
    console.log(resultSequence.join(" "));
  }
}
