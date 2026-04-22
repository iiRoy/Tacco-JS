"use strict";

// This class is designed to extract numerical data from a multi-line string input.
function DataExtractor(inputContent, valueConverter) {
  // Store input as an array of lines, splitting by newline characters.
  this.parsedLines = inputContent.split("\n");
  // Initialize current segment (token) index within the active line.
  this.currentSegmentIdx = 0;
  // Initialize current line index.
  this.activeLineIdx = 0;
  // Store the function used to convert string segments to numbers (e.g., parseInt).
  this.segmentConverter = valueConverter || parseInt;
}

// Prototype method to retrieve the next single numerical value from the input stream.
DataExtractor.prototype.fetchNextValue = function() {
  // Get the current line's text.
  let activeLineTxt = this.parsedLines[this.activeLineIdx];
  // If no more lines, return undefined.
  if (!activeLineTxt)
    return;

  // Trim whitespace from the line and split it into individual segments (tokens).
  let lineSegments = activeLineTxt.trim().split(" ");
  // Get the segment at the current segment index.
  let segmentContent = lineSegments[this.currentSegmentIdx];
  // Advance the segment index.
  this.currentSegmentIdx++;

  // If all segments on the current line have been processed,
  // reset segment index and advance to the next line.
  if (lineSegments.length === this.currentSegmentIdx) {
    this.currentSegmentIdx = 0;
    this.activeLineIdx++;
  }
  // Convert the extracted segment content to a number using the specified converter.
  return this.segmentConverter(segmentContent, 10);
};

// Prototype method to retrieve all numerical values from the current line as an array.
DataExtractor.prototype.fetchLineValues = function() {
  // Fetch the raw string of the current line.
  let lineDataString = this.parsedLines[this.activeLineIdx];
  // If the line is empty or doesn't exist, return.
  if (!lineDataString)
    return;

  // Reset the segment index for the new line being processed.
  this.currentSegmentIdx = 0;
  // Advance to the next line after processing the current one.
  this.activeLineIdx++;
  // Split the line into segments, convert each to a number, and return the array.
  return lineDataString.split(" ").map(val => this.segmentConverter(val, 10));
};


// The primary function to execute the problem's logic.
function runSolution(problemDataSource) {
  // Instantiate a data extractor to process the input.
  const dataStreamer = new DataExtractor(problemDataSource);

  // Read the first two numerical values: total number of elements and target sum.
  const numberOfElements = dataStreamer.fetchNextValue();
  const targetSum = dataStreamer.fetchNextValue();
  
  // Initialize an array to store subsequent elements.
  const elementSet = [];
  // Populate the elementSet array by reading numberOfElements values.
  for (let loopIndex = 0; loopIndex < numberOfElements; loopIndex++) {
    elementSet.push(dataStreamer.fetchNextValue());
  }

  // Sort the elements in ascending order, crucial for the recursive calculation.
  elementSet.sort((firstVal, secondVal) => firstVal - secondVal);

  // Pre-calculate factorials up to numberOfElements, modulo 1000000007.
  // This is used for base cases in the recursive function.
  const factCache = [1, 1];
  for (let loopIndex = 2; loopIndex <= numberOfElements; loopIndex++) {
    factCache[loopIndex] = (factCache[loopIndex - 1] * loopIndex) % 1000000007;
  }

  // Check a specific condition for the first element.
  // If the smallest element is 1, the result is always 0.
  if (elementSet[0] === 1) {
    console.log(0);
  } else {
    // Otherwise, compute the result using the recursive helper function.
    console.log(computeModuloSum(targetSum, numberOfElements));
  }

  // Recursive helper function to compute the sum based on current remainder and remaining elements.
  function computeModuloSum(currentRemainderValue, elementsRemaining) {
    // Base case: If the current remainder is less than the smallest element in the set,
    // we can't subtract any more elements from the set.
    // In this scenario, the result is the current remainder multiplied by the factorial
    // of the remaining elements, indicating permutations of the remaining elements.
    if (currentRemainderValue < elementSet[0]) {
      return (currentRemainderValue * factCache[elementsRemaining]) % 1000000007;
    }

    // Find the index of the first element in elementSet that is greater than or equal to currentRemainderValue.
    // All elements before this index are smaller than currentRemainderValue.
    let searchPosition = 0;
    while (elementSet[searchPosition] < currentRemainderValue) {
      searchPosition++;
    }

    // Initialize an accumulator for the partial sum.
    let partialSum = 0;
    // Iterate through elements in elementSet that are smaller than currentRemainderValue.
    for (let elementIterator = 0; elementIterator < searchPosition; elementIterator++) {
      // Recursively call computeModuloSum with the new remainder (currentRemainderValue % elementSet[elementIterator])
      // and one fewer element remaining.
      partialSum += computeModuloSum(currentRemainderValue % elementSet[elementIterator], elementsRemaining - 1);
      // Apply modulo operation at each step to prevent overflow.
      partialSum %= 1000000007;
    }
    // Return the final partial sum, ensuring it's within the modulo range.
    return partialSum % 1000000007;
  }
}

// Read input from stdin and pass it to the main solution function.
runSolution(require("fs").readFileSync("/dev/stdin", "utf8"));