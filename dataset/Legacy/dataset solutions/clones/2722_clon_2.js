var INPUT_PARSER=(function(){
  // This function acts as a factory for creating an input reader instance.
  function createParser(sourceString){
    return new InputReader(sourceString);
  }

  // The InputReader class handles parsing input strings line by line.
  function InputReader(rawInputString){
    // Store input lines, splitting by newline and trimming whitespace from each line.
    this._lines = rawInputString.trim().split("\n");
    // Initialize the current line index.
    this._currentLineIndex = 0;
  }

  // Prototype method to read a single item from the current line.
  // Items are assumed to be space-separated and read from right to left.
  InputReader.prototype.readNextItem = function(returnAsString){
    var allLines = this._lines;
    var currentLineIdx = this._currentLineIndex;
    var extractedValue;

    // If the current line hasn't been processed into an array of items yet, do so.
    if(typeof allLines[currentLineIdx] === "string") {
      allLines[currentLineIdx] = allLines[currentLineIdx].split(" ").reverse();
    }

    // Pop the last item (which is the first in the original order due to reverse).
    extractedValue = allLines[currentLineIdx].pop();

    // If the current line is exhausted, advance to the next line.
    if(!allLines[currentLineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value, either as a string or parsed as a number.
    return returnAsString ? extractedValue : +extractedValue;
  };

  // Prototype method to read an entire line as an array of items.
  InputReader.prototype.readLine = function(returnAsStrings){
    var lineContent = this._lines[this._currentLineIndex++].split(" ");
    // Return as strings or parse all items as numbers.
    return returnAsStrings ? lineContent : lineContent.map(item => +item);
  };

  // Prototype method to read a matrix (multiple lines, each split by space).
  InputReader.prototype.readMatrix = function(numberOfRows, returnAsStrings){
    var matrixRows = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numberOfRows)
                                 .map(row => row.split(" "));
    // Return as strings or parse all items in the matrix as numbers.
    return returnAsStrings ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  // Prototype method to read multiple lines as an array of numbers.
  InputReader.prototype.readLinesAsNumbers = function(numberOfLines, returnAsStrings){
    var numberLines = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numberOfLines);
    // Return as strings or parse all lines as numbers.
    return returnAsStrings ? numberLines : numberLines.map(line => +line);
  };

  return createParser;
})();

// Create an input reader instance by reading from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

// Utility function to create multi-dimensional arrays.
// This function is defined but not used in the main logic.
function createMultiDimArray(initialValue){
  var args = arguments,
      argCount = args.length,
      resultString = "Array(args["+ --argCount +"]).fill(0).map(x=>{return "+initialValue+";})";
  while(--argCount) {
    resultString = "Array(args["+argCount+"]).fill(0).map(x=>"+resultString+")";
  }
  return eval(resultString);
}

// Implements a binary search to find the lower bound of a value in a sorted array.
// d: data array, a: start index, b: end index, e: target value.
function findLowerBound(dataArray, startIndex, endIndex, targetValue){
  for(var midIndex; 1 < endIndex - startIndex;) {
    midIndex = 0 | (startIndex + endIndex) / 2; // Calculate middle index
    if(dataArray[midIndex] < targetValue) {
      startIndex = midIndex; // Target is in the upper half
    } else {
      endIndex = midIndex; // Target is in the lower half or at midIndex
    }
  }
  // After loop, startIndex and endIndex are adjacent. Check which one is the lower bound.
  return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}

// Execute the main program logic.
executeProgram();

function executeProgram(){
  // Read the total number of elements.
  var totalElements = inputData.readNextItem();
  // Read the target count for the chain.
  var targetCount = inputData.readNextItem();
  // Read the input sequence of numbers.
  var inputSequence = inputData.readLine();

  // Create a map to store indices for each unique element.
  // Key: element value, Value: array of indices where it appears.
  var elementIndicesMap = {};
  for(var idx = 0; idx < totalElements; idx++){
    var currentElement = inputSequence[idx];
    if(elementIndicesMap[currentElement]) {
      elementIndicesMap[currentElement].push(idx);
    } else {
      elementIndicesMap[currentElement] = [idx];
    }
  }

  var finalResult; // This will store the final sequence of unique elements.

  // Find the first unique element starting from index 0.
  var firstUniqueElement = findFirstUnique(0);

  // Handle base cases or scenarios where no unique element is found.
  if(targetCount === 1 || firstUniqueElement === -1){
    displayResult(findUniqueSequence(0));
    return;
  }

  // Initialize a chain of unique elements. The first element is a placeholder, then the actual first unique.
  var uniqueElementsChain = [, firstUniqueElement];

  // Build the chain of unique elements up to 'targetCount' or until no more unique elements are found.
  for(var idx = 1; idx < targetCount; idx++){
    var currentChainElement = uniqueElementsChain[idx];
    // Find the index of the currentChainElement in its occurrences list, starting from 0.
    var searchIndex = findLowerBound(elementIndicesMap[currentChainElement], 0, elementIndicesMap[currentChainElement].length, 0);
    // Find the next unique element starting from the position after the currentChainElement's occurrence.
    var nextUniqueElement = findFirstUnique(elementIndicesMap[currentChainElement][searchIndex] + 1);
    if(nextUniqueElement === -1) {
      break; // No more unique elements can be found to extend the chain.
    }
    uniqueElementsChain.push(nextUniqueElement);
  }

  // If the loop broke because no more unique elements were found, increment idx to reflect the full count of attempts.
  if(nextUniqueElement === -1) {
    idx++;
  }

  // Calculate the remainder for cyclic processing.
  var remainder = targetCount % idx;

  // Handle the case where the chain completed a full cycle and no more unique elements were found.
  if(remainder === 0){
    if(nextUniqueElement === -1) {
      return; // No solution if the chain broke and remainder is 0.
    }
    // Get the last element in the completed chain.
    var lastChainElement = uniqueElementsChain[idx-1];
    // Find its occurrence index.
    var searchIndex = findLowerBound(elementIndicesMap[lastChainElement], 0, elementIndicesMap[lastChainElement].length, 0);
    // Find the unique sequence starting from the position after this last element.
    displayResult(findUniqueSequence(elementIndicesMap[lastChainElement][searchIndex] + 1));
    return;
  }

  // Determine the starting position for the final unique sequence based on the remainder.
  if(remainder === 1) {
    var startIndex = 0; // If remainder is 1, start from the beginning.
  } else {
    // Otherwise, use the element at (remainder - 1) in the chain.
    var chainElementForStart = uniqueElementsChain[remainder - 1];
    // Find its occurrence index.
    var searchIndex = findLowerBound(elementIndicesMap[chainElementForStart], 0, elementIndicesMap[chainElementForStart].length, 0);
    // The actual start index for the sequence is after this occurrence.
    startIndex = elementIndicesMap[chainElementForStart][searchIndex] + 1;
  }
  // Display the final unique sequence.
  displayResult(findUniqueSequence(startIndex));

  // Inner function: Finds a sequence of unique elements starting from a given index.
  function findUniqueSequence(startPos){
    finalResult = []; // Reset the result array.
    for(var currentPos = startPos; currentPos < totalElements; currentPos++){
      var currentVal = inputSequence[currentPos];
      // Find the next occurrence of currentVal after currentPos.
      var nextOccurrenceIndex = findLowerBound(elementIndicesMap[currentVal], 0, elementIndicesMap[currentVal].length, currentPos + 1);
      if(nextOccurrenceIndex !== elementIndicesMap[currentVal].length){
        // If currentVal appears again later, skip to its next occurrence.
        currentPos = elementIndicesMap[currentVal][nextOccurrenceIndex];
      } else {
        // If currentVal does not appear again, it's unique in the remaining sequence.
        finalResult.push(currentVal);
      }
    }
    return finalResult;
  }

  // Inner function: Finds the first unique element starting from a given index.
  function findFirstUnique(startPos){
    for(var currentPos = startPos; currentPos < totalElements; currentPos++){
      var currentVal = inputSequence[currentPos];
      // Find the next occurrence of currentVal after currentPos.
      var nextOccurrenceIndex = findLowerBound(elementIndicesMap[currentVal], 0, elementIndicesMap[currentVal].length, currentPos + 1);
      if(nextOccurrenceIndex !== elementIndicesMap[currentVal].length){
        // If currentVal appears again later, skip to its next occurrence.
        currentPos = elementIndicesMap[currentVal][nextOccurrenceIndex];
      } else {
        // If currentVal does not appear again, it's the first unique element.
        return currentVal;
      }
    }
    return -1; // No unique element found in the remaining sequence.
  }
}

// Utility function to print an array to console, space-separated.
function displayResult(resultArray){
  if(resultArray.length) {
    console.log(resultArray.join(" "));
  }
}
