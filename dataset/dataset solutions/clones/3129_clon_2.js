var InputProcessor = (function () {
  // Inner function to create a new input reader instance
  function createInputReader(inputString) {
    return new InputReader(inputString);
  }

  // Constructor for the InputReader object
  function InputReader(inputString) {
    this._sourceLines = inputString.trim().split("\n"); // Store input as an array of trimmed lines
    this._currentLineIndex = 0; // Initialize line pointer
  }

  // Prototype method to read a single value from the current line
  InputReader.prototype.readSingleValue = function (returnAsString) {
    let lineSource = this._sourceLines;
    let linePos = this._currentLineIndex;
    let resultValue;

    // If the current line is still a string, process it
    if (typeof lineSource[linePos] === "string") {
      lineSource[linePos] = lineSource[linePos].split(" ").reverse(); // Split by space and reverse for pop() efficiency
    }

    resultValue = lineSource[linePos].pop(); // Get the last element

    // If the current line is exhausted, advance to the next line
    if (!lineSource[linePos].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number
    return returnAsString ? resultValue : Number(resultValue);
  };

  // Prototype method to read an entire line as an array of values
  InputReader.prototype.readLineValues = function (returnAsString) {
    let lineValues = this._sourceLines[this._currentLineIndex++].split(" "); // Get line, split, and advance line pointer

    // Return as array of strings or convert all to numbers
    return returnAsString ? lineValues : lineValues.map(itemValue => Number(itemValue));
  };

  // Prototype method to read N lines as a matrix (array of arrays)
  InputReader.prototype.readMatrixValues = function (numLines, returnAsString) {
    let matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines)
      .map(itemValue => itemValue.split(" ")); // Slice N lines, split each into array

    // Return as string matrix or convert all elements to numbers
    return returnAsString ? matrixRows : matrixRows.map(row => row.map(itemValue => Number(itemValue)));
  };

  // Prototype method to read N lines as individual row values
  InputReader.prototype.readRowValues = function (numLines, returnAsString) {
    let rowValues = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines); // Slice N lines

    // Return as string array or convert all elements to numbers
    return returnAsString ? rowValues : rowValues.map(itemValue => Number(itemValue));
  };

  // Expose the factory function
  return createInputReader;
})();

// Obtain file system module and read standard input
var dataParser = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main processing function and output its result
console.log(processInputAndSolve());

// Main function encapsulating the problem's logic
function processInputAndSolve() {
  // Read initial parameters from input
  let totalBits = dataParser.readSingleValue();
  let initialValueA = dataParser.readSingleValue();
  let initialValueB = dataParser.readSingleValue();

  let setBitCount = 0; // Counter for set bits

  // Iterate through each bit position
  for (let bitIndex = 0; bitIndex < totalBits; bitIndex++) {
    let currentBitMask = 1 << bitIndex; // Generate bit mask for current position

    // Check if the current bit is set in initialValueA
    if (initialValueA & currentBitMask) {
      setBitCount++;
    }

    // Check if the current bit is set in initialValueB
    if (initialValueB & currentBitMask) {
      setBitCount++;
    }
  }

  // If the total count of set bits is even, no solution exists
  if (setBitCount % 2 === 0) {
    return "NO";
  }

  // Initialize an array to store the solution path
  let solutionPath = [];

  // Invoke the recursive backtracking function to find the path
  findPathRecursive(initialValueA, initialValueB, 0);

  // If a solution is found (function returns), output "YES" and the path
  console.log("YES");
  return solutionPath.join(" "); // Join path elements with spaces

  /**
   * Recursive function to explore possible bit manipulations to find a path from currentA to currentB.
   * @param {number} currentA - The current value of A.
   * @param {number} currentB - The current value of B.
   * @param {number} processedBitMask - A bitmask indicating which bit positions have already been processed or manipulated.
   */
  function findPathRecursive(currentA, currentB, processedBitMask) {
    // Base case: If currentA equals currentB, we've found a segment of the path
    if (currentA === currentB) {
      solutionPath.push(currentA); // Add the common value to the solution path
      return; // Terminate this recursive branch
    }

    // Calculate XOR difference to identify differing bits
    let xorDifference = currentA ^ currentB;
    let intermediateY = currentA; // Temporary value for the first recursive branch
    let intermediateZ = currentA; // Temporary value for the second recursive branch
    let firstBitFlagU = 1; // Flag to ensure only the first relevant bit is flipped for intermediateY
    let firstBitFlagV = 1; // Flag to ensure only the first relevant bit is flipped for intermediateZ

    // Iterate through all possible bit positions
    for (let bitPosition = 0; bitPosition < totalBits; bitPosition++) {
      let maskForBit = 1 << bitPosition; // Create a bitmask for the current position

      // Skip this bit if it has already been handled in a previous recursive step
      if (maskForBit & processedBitMask) {
        continue;
      }

      // Case 1: The current bit is the same in currentA and currentB (xorDifference has 0)
      if ((xorDifference & maskForBit) === 0) {
        // If this is the first such bit encountered, flip it in both intermediateY and intermediateZ
        if (firstBitFlagU) {
          firstBitFlagU = 0; // Clear the flag
          intermediateY ^= maskForBit; // Flip bit in intermediateY
          intermediateZ ^= maskForBit; // Flip bit in intermediateZ
        }
      }
      // Case 2: The current bit is different in currentA and currentB (xorDifference has 1)
      else {
        // If this is the first such bit encountered, flip it in intermediateZ and mark as processed
        if (firstBitFlagV) {
          firstBitFlagV = 0; // Clear the flag
          intermediateZ ^= maskForBit; // Flip bit in intermediateZ
          processedBitMask |= maskForBit; // Mark this bit as handled for subsequent calls
        }
      }
    }

    // Recursive call for the first subproblem (A to intermediateY)
    findPathRecursive(currentA, intermediateY, processedBitMask);

    // Recursive call for the second subproblem (intermediateZ to B)
    findPathRecursive(intermediateZ, currentB, processedBitMask);
  }
}