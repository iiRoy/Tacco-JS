var INPUT_PARSER = (function () {
  // This function acts as a factory for creating an InputReader instance.
  function createParser(inputString) {
    return new InputReader(inputString);
  }

  // The main class responsible for parsing input lines.
  function InputReader(rawInput) {
    // Store the input string, split into lines and trimmed.
    this._sourceLines = rawInput.trim().split("\n");
    // Keep track of the current line being processed.
    this._currentLineIndex = 0;
  }

  // Method to read a single value from the current line.
  // If the line is not yet split, it splits it by space and reverses for easy popping.
  // 'asString' flag determines if the result should be a string or a number.
  InputReader.prototype.readSingleValue = function (asString) {
    var linesArray = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var resultValue;

    // If the current line hasn't been processed into an array of tokens, do it now.
    if (typeof linesArray[lineIdx] === "string") {
      linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
    }

    // Pop the last element (which is the first due to reverse).
    resultValue = linesArray[lineIdx].pop();

    // If the current line is exhausted, advance to the next line.
    if (!linesArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number.
    return asString ? resultValue : +resultValue;
  };

  // Method to read an entire line and split it into values.
  // 'asString' flag determines if the elements should be strings or numbers.
  InputReader.prototype.readLineValues = function (asString) {
    var lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return as strings or map to numbers.
    return asString ? lineTokens : lineTokens.map((element) => +element);
  };

  // Method to read multiple lines as a 2D array (matrix).
  // 'numLines' specifies how many lines to read.
  // 'asString' flag determines if the elements should be strings or numbers.
  InputReader.prototype.readMatrix = function (numLines, asString) {
    var matrixRows = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numLines))
      .map((row) => row.split(" "));
    // Return as strings or map all elements to numbers.
    return asString
      ? matrixRows
      : matrixRows.map((row) => row.map((element) => +element));
  };

  // Method to read multiple raw lines without splitting them.
  // 'numLines' specifies how many lines to read.
  // 'asString' flag determines if the elements should be strings or numbers.
  InputReader.prototype.readRawLines = function (numLines, asString) {
    var rawLines = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );
    // Return as strings or map to numbers.
    return asString ? rawLines : rawLines.map((element) => +element);
  };

  return createParser;
})();

// Initialize the input parser with content from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main problem-solving logic and print the result.
console.log(solveProblem());

// The primary function containing the solution logic.
function solveProblem() {
  // Read the total number of bits (n).
  var totalBits = inputData.readSingleValue();
  // Read the first number (a).
  var firstNumber = inputData.readSingleValue();
  // Read the second number (b).
  var secondNumber = inputData.readSingleValue();

  // Calculate the total count of set bits in both numbers.
  var bitCount = 0;
  for (var bitPosition = 0; bitPosition < totalBits; bitPosition++) {
    var currentBitMask = 1 << bitPosition;
    if (firstNumber & currentBitMask) bitCount++;
    if (secondNumber & currentBitMask) bitCount++;
  }

  // If the total count of set bits is odd, a Gray code path is not possible.
  if (bitCount % 2 === 0) return "NO";

  // Initialize an array to store the Gray code sequence.
  // The length of the sequence is 2^n.
  var resultArray = Array(1 << totalBits);

  // Start the recursive generation of the Gray code path.
  // Parameters: currentA, targetB, fixedBitsMask, startIndex.
  generateGrayCodePath(firstNumber, secondNumber, 0, 0);

  // If the path was successfully generated, print "YES" and the sequence.
  console.log("YES");
  return resultArray.join(" ");

  // Recursive helper function to generate the Gray code path.
  function generateGrayCodePath(currentA, targetB, fixedBitsMask, startIndex) {
    // Base case: If currentA equals targetB, we've found a path segment.
    if (currentA === targetB) {
      resultArray[startIndex] = currentA;
      return;
    }

    // Calculate XOR of currentA and targetB to find differing bits.
    var xorResult = currentA ^ targetB;
    // Temporary variables for constructing intermediate numbers.
    var tempA = currentA;
    var tempB = currentA;
    // Flags to ensure only one bit is flipped for each path.
    var firstToggleFlag = 1;
    var secondToggleFlag = 1;
    // Counter for bits that are fixed (part of fixedBitsMask).
    var fixedBitCount = 0;

    // Iterate through each bit position.
    for (var loopIndex = 0; loopIndex < totalBits; loopIndex++) {
      var bitToCheck = 1 << loopIndex;

      // If this bit is part of the fixedBitsMask, increment fixedBitCount and continue.
      if (bitToCheck & fixedBitsMask) {
        fixedBitCount++;
        continue;
      }

      // If the bit is the same in currentA and targetB (not in xorResult).
      if ((xorResult & bitToCheck) === 0) {
        // If firstToggleFlag is set, flip this bit in tempA and tempB.
        // This creates a path where this bit is flipped.
        if (firstToggleFlag) {
          firstToggleFlag = 0;
          tempA ^= bitToCheck;
          tempB ^= bitToCheck;
        }
      } else {
        // If the bit is different in currentA and targetB (in xorResult).
        // If secondToggleFlag is set, flip this bit in tempB and add it to fixedBitsMask.
        // This creates a path where this bit is fixed to the value of targetB.
        if (secondToggleFlag) {
          secondToggleFlag = 0;
          tempB ^= bitToCheck;
          fixedBitsMask |= bitToCheck;
        }
      }
    }

    // Recursively call for the first half of the path.
    // The path goes from currentA to tempA.
    generateGrayCodePath(currentA, tempA, fixedBitsMask, startIndex);
    // Recursively call for the second half of the path.
    // The path goes from tempB to targetB.
    // The starting index for this half is shifted by 2^(n - fixedBitCount - 1).
    generateGrayCodePath(
      tempB,
      targetB,
      fixedBitsMask,
      startIndex + (1 << (totalBits - fixedBitCount - 1))
    );
  }
}
