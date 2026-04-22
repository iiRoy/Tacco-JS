const INPUT_PROCESSOR = (function() {
  // Inner function to create a new data stream instance
  function createDataStream(inputStringContent) {
    return new InputDataStream(inputStringContent);
  }

  // Constructor for the InputDataStream class
  function InputDataStream(content) {
    // Stores all lines of the input content, trimmed and split by newline
    this.textualLines = content.trim().split('\n');
    // Pointer to the current line being processed
    this.lineIndex = 0;
  }

  // Method to extract a single value from the current line
  InputDataStream.prototype.extractNextValue = function(returnAsString) {
    const currentLineParts = this.textualLines;
    const currentLineNumber = this.lineIndex;
    let fetchedValue;

    // If the current line hasn't been split into words yet, do so
    if (typeof currentLineParts[currentLineNumber] === 'string') {
      currentLineParts[currentLineNumber] = currentLineParts[currentLineNumber].split(' ').reverse();
    }

    // Pop the last element (which is the first when reversed)
    fetchedValue = currentLineParts[currentLineNumber].pop();

    // If the line is now empty, advance to the next line
    if (!currentLineParts[currentLineNumber].length) {
      this.lineIndex++;
    }

    // Return as string or convert to number
    return returnAsString ? fetchedValue : +fetchedValue;
  };

  // Method to extract an entire line as an array of values
  InputDataStream.prototype.extractFullLine = function(returnAsStrings) {
    // Get the current line and advance the pointer
    const lineElements = this.textualLines[this.lineIndex++].split(' ');
    // Return as strings or convert all elements to numbers
    return returnAsStrings ? lineElements : lineElements.map(val => +val);
  };

  // Method to extract a matrix (2D array) of values
  InputDataStream.prototype.extractMatrix = function(numRows, returnAsStrings) {
    const matrixRows = this.textualLines.slice(this.lineIndex, (this.lineIndex += numRows));
    const processedMatrix = matrixRows.map(rowContent => rowContent.split(' '));
    // Return as strings or convert all elements in the matrix to numbers
    return returnAsStrings ? processedMatrix : processedMatrix.map(row => row.map(val => +val));
  };

  // Method to extract multiple lines as a 1D array of values
  InputDataStream.prototype.extractMultipleLines = function(linesCount, returnAsStrings) {
    const extractedLines = this.textualLines.slice(this.lineIndex, (this.lineIndex += linesCount));
    // Return as strings or convert all lines to numbers
    return returnAsStrings ? extractedLines : extractedLines.map(lineValue => +lineValue);
  };

  // The IIFE returns the factory function to create a data stream
  return createDataStream;
})();

// Create an instance of the input reader using data from standard input
const programInputReader = INPUT_PROCESSOR(require('node:fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Generates a multi-dimensional array with a specified initial value.
 * The dimensions are passed as subsequent arguments after the initial value.
 * e.g., createNDArray(0, 3, 4) creates a 3x4 array filled with 0s.
 * @param {*} defaultValue The value to fill the array with.
 * @param {...number} dimensions The sizes of each dimension.
 * @returns {Array} The generated multi-dimensional array.
 */
function createNDArray(defaultValue) {
  const allDimensions = arguments;
  let currentDimensionIdx = allDimensions.length;
  // Start building the array creation string from the innermost dimension
  let arrayConstructionCode = `Array(allDimensions[${--currentDimensionIdx}]).fill(0).map((item) => { return ${defaultValue}; })`;
  
  // Wrap the inner array creation with outer dimensions
  while (--currentDimensionIdx) {
    arrayConstructionCode = `Array(allDimensions[${currentDimensionIdx}]).fill(0).map((item) => ${arrayConstructionCode})`;
  }
  // Evaluate the generated string to create the array
  return eval(arrayConstructionCode);
}

const INFINITE_VALUE = 1_000_000_000; // A large number representing infinity for cost calculations

// Output the result of the main problem-solving function
console.log(solveMainProblem());

/**
 * The primary function containing the problem's logic.
 * This typically solves a minimum cost path or subset sum type problem using dynamic programming.
 * @returns {number} The minimum cost to achieve the target state, or -1 if impossible.
 */
function solveMainProblem() {
  // Read the number of items required and the number of available options
  const targetItemsCount = programInputReader.extractNextValue();
  const totalOptionsCount = programInputReader.extractNextValue();

  // Arrays to store the cost of each option and the bitmask of items it covers
  const optionCostList = Array(totalOptionsCount);
  const optionCoverageMasks = Array(totalOptionsCount);

  // Loop through each option to read its details
  for (let currentOptionIdx = 0; currentOptionIdx < totalOptionsCount; currentOptionIdx++) {
    // Store the cost of the current option
    optionCostList[currentOptionIdx] = programInputReader.extractNextValue();
    // Read how many items this option covers
    const coveredItemsInOption = programInputReader.extractNextValue();
    let computedCoverageMask = 0; // Initialize bitmask for this option

    // Loop through each item covered by the current option
    for (let itemLoopIdx = 0; itemLoopIdx < coveredItemsInOption; itemLoopIdx++) {
      const itemIdentifierValue = programInputReader.extractNextValue();
      // Set the corresponding bit in the mask
      computedCoverageMask += (1 << (itemIdentifierValue - 1));
    }
    // Store the final coverage mask for this option
    optionCoverageMasks[currentOptionIdx] = computedCoverageMask;
  }

  // Initialize a DP table to store the minimum cost to reach each state (combination of covered items)
  // The size is 2^targetItemsCount, as each item can either be covered or not.
  const minimumTotalCosts = createNDArray(INFINITE_VALUE, 1 << targetItemsCount);
  
  // Base case: the cost to cover no items (state 0) is 0
  minimumTotalCosts[0] = 0;

  // Iterate through all possible item coverage states
  for (let currentCoverageState = 0; currentCoverageState < (1 << targetItemsCount); currentCoverageState++) {
    // If the current state is unreachable (cost is still infinite), skip it
    if (minimumTotalCosts[currentCoverageState] === INFINITE_VALUE) {
      continue;
    }

    // For each reachable state, try applying every available option
    for (let currentOptionApplicationIdx = 0; currentOptionApplicationIdx < totalOptionsCount; currentOptionApplicationIdx++) {
      // Calculate the new state after applying the current option
      // The bitwise OR operation combines the current state with the option's coverage mask
      const resultingCoverageState = currentCoverageState | optionCoverageMasks[currentOptionApplicationIdx];
      
      // If applying this option leads to a cheaper path to the resulting state, update the DP table
      if (minimumTotalCosts[currentCoverageState] + optionCostList[currentOptionApplicationIdx] < minimumTotalCosts[resultingCoverageState]) {
        minimumTotalCosts[resultingCoverageState] = minimumTotalCosts[currentCoverageState] + optionCostList[currentOptionApplicationIdx];
      }
    }
  }

  // The target state is where all items are covered, represented by a mask of all ones.
  const finalDesiredState = (1 << targetItemsCount) - 1;
  
  // Return the minimum cost for the final state.
  // If it's still INFINITE_VALUE, it means the target state is unreachable, so return -1.
  return minimumTotalCosts[finalDesiredState] === INFINITE_VALUE ? -1 : minimumTotalCosts[finalDesiredState];
}