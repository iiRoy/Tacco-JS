const DATA_PARSER = (function() {
  // Factory function to create a new input processor instance
  function createProcessor(inputString) {
    return new InputDataProcessor(inputString);
  }

  // Class to handle parsing of input data line by line or element by element
  function InputDataProcessor(rawData) {
    // Store lines after trimming and splitting by newline
    this._sourceLines = rawData.trim().split("\n");
    // Initialize current line index
    this._currentLineIndex = 0;
  }

  // Prototype method to extract a single value from the current line
  InputDataProcessor.prototype.getSingleValue = function(returnAsString) {
    let linesArray = this._sourceLines;
    let lineCursor = this._currentLineIndex;
    let extractedValue;

    // If the current line hasn't been split into parts yet, do so and reverse for easy popping
    if (typeof linesArray[lineCursor] === "string") {
      linesArray[lineCursor] = linesArray[lineCursor].split(" ").reverse();
    }

    // Pop the last element (which was the first before reversing)
    extractedValue = linesArray[lineCursor].pop();

    // If the current line is now empty, advance to the next line
    if (!linesArray[lineCursor].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number
    return returnAsString ? extractedValue : +extractedValue;
  };

  // Prototype method to retrieve all values from the current line as an array
  InputDataProcessor.prototype.getLineValues = function(keepStrings) {
    // Split the current line by spaces and advance the line index
    let lineParts = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return as strings or map to numbers
    return keepStrings ? lineParts : lineParts.map(val => +val);
  };

  // Prototype method to retrieve a matrix (2D array) of values
  InputDataProcessor.prototype.getMultiDimensionalArray = function(numRows, returnStrings) {
    // Slice 'numRows' lines, split each into parts, and advance line index
    let matrixRows = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map(row => row.split(" "));

    // Return as strings or map all elements to numbers
    return returnStrings ? matrixRows : matrixRows.map(row => row.map(element => +element));
  };

  // Prototype method to retrieve a block of raw lines
  InputDataProcessor.prototype.getRawLines = function(count, asIs) {
    // Slice 'count' lines and advance line index
    let selectedRows = this._sourceLines.slice(this._currentLineIndex, (this._currentLineIndex += count));
    // Return as strings or map each element to a number (if it's a single value per line)
    return asIs ? selectedRows : selectedRows.map(numericRow => +numericRow);
  };

  return createProcessor; // The factory function is the public interface
})();

// Helper function to create a matrix filled with zeros
function allocateZeroMatrix(height, width) {
  return Array(height).fill(0).map(rowPlaceholder => Array(width).fill(0));
}

// Instantiate the data parser with input from standard input
const inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));
// Define a modulo constant for calculations
const primeModulo = 1e9 + 7;

// Output the result of the main computation
console.log(calculateSequenceCombinations());

// Main function to perform the sequence combination calculation
function calculateSequenceCombinations() {
  const totalElements = inputReader.getSingleValue();
  const firstSequence = inputReader.getSingleValue(1); // Get as string
  const secondSequence = inputReader.getSingleValue(1); // Get as string

  // Initialize result, last pattern type, and current index
  let possibleCombinations = 3; // Initial combinations for the first element
  let lastMatchStatus = 0; // 0 for same, 1 for different
  let currentPosition = 1; // Start checking from the second element

  // Check the first pair of characters
  if (firstSequence[0] !== secondSequence[0]) {
    possibleCombinations = 6; // If different, 6 ways for first pair
    lastMatchStatus = 1; // Mark as different
    currentPosition = 2; // Advance index by 2
  }

  // Iterate through the rest of the sequences
  for (; currentPosition < totalElements; currentPosition++) {
    if (firstSequence[currentPosition] === secondSequence[currentPosition]) {
      // Current characters are the same
      if (!lastMatchStatus) {
        // If previous was also same (S-S pattern)
        possibleCombinations *= 2;
      }
      lastMatchStatus = 0; // Update status to 'same'
    } else {
      // Current characters are different
      currentPosition++; // Consume the next character as well (D-D pattern)
      if (lastMatchStatus) {
        // If previous was also different (D-D pattern)
        possibleCombinations *= 3;
      } else {
        // If previous was same (S-D pattern)
        possibleCombinations *= 2;
      }
      lastMatchStatus = 1; // Update status to 'different'
    }
    // Apply modulo to keep the number within bounds
    possibleCombinations %= primeModulo;
  }

  return possibleCombinations;
}