var INPUT_PARSER=(function(){
  // This function serves as the public interface for creating an input reader.
  function createParser(rawInputContent){
    return new InputReader(rawInputContent);
  }

  // The core class responsible for managing and parsing input lines.
  function InputReader(initialData){
    // Store the input as an array of lines, after trimming any outer whitespace.
    this._sourceLines = initialData.trim().split("\n");
    // Keep track of the current line being processed.
    this._currentLineIndex = 0;
  }

  // Method to extract a single token (word) from the current line.
  InputReader.prototype.readToken = function(returnAsString){
    var lineSegments = this._sourceLines;
    var currentLineNum = this._currentLineIndex;
    var extractedToken;

    // If the current line is still a raw string, split it into tokens.
    // We reverse it so `pop()` is efficient for reading from left to right.
    if(typeof lineSegments[currentLineNum] === "string") {
      lineSegments[currentLineNum] = lineSegments[currentLineNum].split(" ").reverse();
    }

    // Get the next token from the current line.
    extractedToken = lineSegments[currentLineNum].pop();

    // If the current line is now empty, advance to the next line.
    if(!lineSegments[currentLineNum].length) {
      this._currentLineIndex++;
    }

    // Return the token, converting to a number unless `returnAsString` is true.
    return returnAsString ? extractedToken : +extractedToken;
  };

  // Method to read an entire line of space-separated tokens.
  InputReader.prototype.readLine = function(returnAsString){
    // Fetch the current line, split it, and then increment the line counter.
    var tokensOnLine = this._sourceLines[this._currentLineIndex++].split(" ");
    // Convert tokens to numbers if not requested as strings.
    return returnAsString ? tokensOnLine : tokensOnLine.map(item => +item);
  };

  // Method to read a specified number of lines as a 2D array (matrix).
  InputReader.prototype.readMatrix = function(numLines, returnAsString){
    // Extract the relevant lines and split each into an array of strings.
    var matrixData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines).map(item => item.split(" "));
    // If not returning as strings, convert all elements to numbers.
    return returnAsString ? matrixData : matrixData.map(row => row.map(item => +item));
  };

  // Method to read a specified number of lines as a 1D array.
  InputReader.prototype.readLines = function(numLines, returnAsString){
    // Extract the relevant lines.
    var lineArray = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    // If not returning as strings, convert all elements to numbers.
    return returnAsString ? lineArray : lineArray.map(item => +item);
  };

  return createParser;
})();

// Initialize the input reader by reading the entire content of stdin.
var inputReaderInstance = INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

// Execute the primary logic of the program and output its result.
console.log(processMainLogic());

/**
 * The main function encapsulating the problem's solution.
 * It reads input, performs bitwise operations, and constructs a path.
 * @returns {string} "NO" if no solution, or "YES" followed by the path.
 */
function processMainLogic(){
  // Read the number of bits (N).
  var bitLength = inputReaderInstance.readToken();
  // Read the first integer (A).
  var firstValue = inputReaderInstance.readToken();
  // Read the second integer (B).
  var secondValue = inputReaderInstance.readToken();

  // Count the total number of set bits across both numbers within the N-bit range.
  var totalSetBitsCount = 0;
  for(var bitIndex = 0; bitIndex < bitLength; bitIndex++){
    var currentBitMask = 1 << bitIndex; // Generate mask for current bit position.
    if(firstValue & currentBitMask) totalSetBitsCount++; // Check if bit is set in A.
    if(secondValue & currentBitMask) totalSetBitsCount++; // Check if bit is set in B.
  }

  // If the total count of set bits is even, a solution is not possible.
  if(totalSetBitsCount % 2 === 0) return "NO";

  // Array to store the sequence of numbers forming the path.
  var pathSequence = [];
  // Initiate the recursive function to find the path.
  findPathRecursively(firstValue, secondValue, 0);

  // If a path was found, print "YES" and the joined path.
  console.log("YES");
  return pathSequence.join(" ");

  /**
   * Recursive function to determine the path from a starting number to a target number
   * by applying specific bitwise transformations.
   * @param {number} currentStart - The current starting number in the segment.
   * @param {number} currentTarget - The current target number in the segment.
   * @param {number} fixedBitsMask - A mask indicating bits that should not be changed.
   */
  function findPathRecursively(currentStart, currentTarget, fixedBitsMask){
    // Base case: If the start and target numbers are identical, add to path and return.
    if(currentStart === currentTarget){
      pathSequence.push(currentStart);
      return;
    }

    // Calculate the XOR difference to identify differing bits.
    var bitDifference = currentStart ^ currentTarget;
    var intermediateA = currentStart;
    var intermediateB = currentStart;
    var operationFlag1 = 1; // Flag for the first type of transformation.
    var operationFlag2 = 1; // Flag for the second type of transformation.

    // Iterate through each bit position from 0 to bitLength-1.
    for(var bitPosition = 0; bitPosition < bitLength; bitPosition++){
      var bitIdentifier = 1 << bitPosition; // Mask for the current bit.

      // Skip this bit if it's part of the `fixedBitsMask`.
      if(bitIdentifier & fixedBitsMask) continue;

      // Case 1: If the current bit is the same in `currentStart` and `currentTarget`.
      if((bitDifference & bitIdentifier) === 0){
        // If `operationFlag1` is active, apply the transformation.
        if(operationFlag1){
          operationFlag1 = 0; // Deactivate flag after use.
          intermediateA ^= bitIdentifier; // Flip this bit in `intermediateA`.
          intermediateB ^= bitIdentifier; // Flip this bit in `intermediateB`.
        }
      } else {
        // Case 2: If the current bit is different in `currentStart` and `currentTarget`.
        // If `operationFlag2` is active, apply the transformation.
        if(operationFlag2){
          operationFlag2 = 0; // Deactivate flag after use.
          intermediateB ^= bitIdentifier; // Flip this bit in `intermediateB`.
          fixedBitsMask |= bitIdentifier; // Mark this bit as fixed for subsequent calls.
        }
      }
    }

    // Recursively find the path for the first segment.
    findPathRecursively(currentStart, intermediateA, fixedBitsMask);
    // Recursively find the path for the second segment.
    findPathRecursively(intermediateB, currentTarget, fixedBitsMask);
  }
}
