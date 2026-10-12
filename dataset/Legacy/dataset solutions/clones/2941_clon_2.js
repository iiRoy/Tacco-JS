var INPUT_PARSER = (function () {
  // This function serves as the entry point for creating an input reader.
  function createInputReader(sourceString) {
    return new InputReader(sourceString);
  }

  // The InputReader class handles parsing lines and values from the input string.
  function InputReader(sourceString) {
    // Store the input content, splitting it into an array of lines.
    this._sourceLines = sourceString.trim().split("\n");
    // Keep track of the current line being processed.
    this._currentLineIndex = 0;
  }

  // Method to extract a single value from the current line.
  // It can return the value as a string or a number.
  InputReader.prototype.readNextValue = function (asString) {
    var lines = this._sourceLines;
    var currentIdx = this._currentLineIndex;
    var extractedValue;

    // If the current line is still a single string, split it into words.
    if (typeof lines[currentIdx] === "string") {
      lines[currentIdx] = lines[currentIdx].split(" ").reverse(); // Reverse for efficient `pop` operation.
    }

    // Get the last element (which was the first in the original order).
    extractedValue = lines[currentIdx].pop();

    // If the current line is now empty, move to the next line.
    if (!lines[currentIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value, converting to number if 'asString' is false.
    return asString ? extractedValue : +extractedValue;
  };

  // Method to read all space-separated values from the current line.
  InputReader.prototype.readLineValues = function (asString) {
    var lineContent = this._sourceLines[this._currentLineIndex++];
    var splitValues = lineContent.split(" ");
    // Map to numbers if not requested as strings.
    return asString ? splitValues : splitValues.map((item) => +item);
  };

  // Method to read a block of 'numRows' lines as a matrix.
  InputReader.prototype.readMatrix = function (numRows, asString) {
    var matrixRows = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numRows)
    );
    var parsedMatrix = matrixRows.map((line) => line.split(" "));
    // Convert all elements to numbers if not requested as strings.
    return asString
      ? parsedMatrix
      : parsedMatrix.map((row) => row.map((val) => +val));
  };

  // Method to read a block of 'numLines' lines without splitting them into values.
  InputReader.prototype.readRawLines = function (numLines, asString) {
    var rawLines = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );
    // Convert lines to numbers if not requested as strings.
    return asString ? rawLines : rawLines.map((line) => +line);
  };

  return createInputReader;
})();

// Instantiate the input parser with data read from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Dynamically creates a multi-dimensional array with a specified initial value.
function createMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  // Start building the array creation string from the innermost dimension.
  var arrayCreationString =
    "Array(dimensions[" +
    --dimCount +
    "]).fill(0).map(x=>{return " +
    initialValue +
    ";})";
  // Wrap with outer dimensions.
  while (--dimCount) {
    arrayCreationString =
      "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  // Use eval to execute the dynamically created array construction code.
  return eval(arrayCreationString);
}

// Constant for the modulo operation, commonly used in competitive programming.
var MODULUS_VAL = 1e9 + 7;

// Performs modular multiplication for an arbitrary number of arguments.
function modularMultiply() {
  var operands = arguments;
  var resultAccumulator = operands[0];
  var operandIndex = 1;
  while (operandIndex < operands.length) {
    // Optimized modular multiplication to prevent intermediate overflows.
    resultAccumulator =
      ((resultAccumulator >> 16) * operands[operandIndex] % MODULUS_VAL * 65536 +
        (resultAccumulator & 65535) * operands[operandIndex++]) %
      MODULUS_VAL;
  }
  return resultAccumulator;
}

// Cache for storing pre-calculated modular factorials.
var factorialCache = [1, 1];

// Calculates the modular factorial of a number, using memoization.
function getModularFactorial(numberVal) {
  for (var loopCounter = factorialCache.length; loopCounter <= numberVal; loopCounter++) {
    factorialCache[loopCounter] = modularMultiply(
      factorialCache[loopCounter - 1],
      loopCounter
    );
  }
  return factorialCache[numberVal];
}

// Computes nCr (n choose r) modulo MODULUS_VAL.
function calculateNcrMod(totalItems, chosenItems) {
  return modularMultiply(
    getModularFactorial(totalItems),
    modularInverse(getModularFactorial(chosenItems)),
    modularInverse(getModularFactorial(totalItems - chosenItems))
  );
}

// Calculates the modular multiplicative inverse of 'numA' modulo MODULUS_VAL
// using the Extended Euclidean Algorithm.
function modularInverse(numA) {
  var numB = MODULUS_VAL;
  var coeffU = 1,
    coeffV = 0,
    tempVar;
  while (numB) {
    tempVar = numA / numB | 0; // Integer division
    numA -= tempVar * numB;
    coeffU -= tempVar * coeffV;
    tempVar = numA;
    numA = numB;
    numB = tempVar;
    tempVar = coeffU;
    coeffU = coeffV;
    coeffV = tempVar;
  }
  coeffU %= MODULUS_VAL;
  // Ensure the result is positive.
  return coeffU < 0 ? coeffU + MODULUS_VAL : coeffU;
}

// Execute the primary calculation logic and output the final result.
console.log(executeCalculation());

// The main function encapsulating the problem's solution.
function executeCalculation() {
  // Read the three integer inputs.
  var rowsCount = inputData.readNextValue();
  var colsCount = inputData.readNextValue();
  var targetK = inputData.readNextValue();

  // Initialize a 2D array (grid) with dimensions rowsCount x colsCount, filled with zeros.
  var gridValues = createMultiDimArray(0, rowsCount, colsCount);

  // Populate the grid based on a specific formula.
  for (var colIterator = 0; colIterator < colsCount; colIterator++) {
    for (var rowIterator = 0; rowIterator < rowsCount; rowIterator++) {
      // Calculate value for current cell based on column and row positions.
      gridValues[rowIterator][colIterator] =
        (calculatePairSum(colIterator + 1) + calculatePairSum(colsCount - colIterator)) *
        rowsCount;
      gridValues[rowIterator][colIterator] +=
        (calculatePairSum(rowIterator + 1) + calculatePairSum(rowsCount - rowIterator)) *
        colsCount;
    }
  }

  // Sum all the values in the populated grid.
  var finalResult = 0;
  for (var colIterator = 0; colIterator < colsCount; colIterator++) {
    for (var rowIterator = 0; rowIterator < rowsCount; rowIterator++) {
      finalResult += gridValues[rowIterator][colIterator];
    }
  }

  // Apply modulo to the sum and perform the final calculation.
  finalResult %= MODULUS_VAL;
  return modularMultiply(
    finalResult,
    calculateNcrMod(rowsCount * colsCount - 2, targetK - 2),
    modularInverse(2)
  );
}

// A helper function to calculate the sum of numbers from 1 to 'inputNum - 1',
// which is equivalent to inputNum * (inputNum - 1) / 2.
function calculatePairSum(inputNum) {
  return inputNum * (inputNum - 1) / 2;
}
