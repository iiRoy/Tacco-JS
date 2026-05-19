var INPUT_PARSER = (function () {
  // Internal function to create a new parser instance
  function createParser(sourceText) {
    return new InputReader(sourceText);
  }

  // Constructor for the InputReader class
  function InputReader(sourceText) {
    this._lineData = sourceText.trim().split("\n"); // Store lines as an array
    this._currentLineIndex = 0; // Current line pointer
  }

  // Prototype method to read the next value from the current line
  InputReader.prototype.readNextValue = function (asString) {
    var currentLineArray = this._lineData;
    var lineIdx = this._currentLineIndex;
    var resultValue;

    // If the current line hasn't been split yet, split it and reverse for pop efficiency
    if (typeof currentLineArray[lineIdx] === "string") {
      currentLineArray[lineIdx] = currentLineArray[lineIdx].split(" ").reverse();
    }

    // Pop the last element (which was the first before reversing)
    resultValue = currentLineArray[lineIdx].pop();

    // If the current line is exhausted, move to the next line
    if (!currentLineArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or number based on the 'asString' flag
    return asString ? resultValue : +resultValue;
  };

  // Prototype method to read all values from the current line
  InputReader.prototype.readLineValues = function (asString) {
    var lineContent = this._lineData[this._currentLineIndex++];
    var splitContent = lineContent.split(" ");
    // Return as strings or numbers
    return asString ? splitContent : splitContent.map(item => +item);
  };

  // Prototype method to read a matrix of 'numRows' rows
  InputReader.prototype.readMatrix = function (numRows, asString) {
    var extractedData = this._lineData.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    var mappedData = extractedData.map(row => row.split(" "));
    // Return as strings or numbers
    return asString ? mappedData : mappedData.map(row => row.map(cell => +cell));
  };

  // Prototype method to read 'numLines' raw lines
  InputReader.prototype.readRawLines = function (numLines, asString) {
    var extractedData = this._lineData.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    // Return as strings or numbers
    return asString ? extractedData : extractedData.map(line => +line);
  };

  return createParser;
})();

// Initialize the input reader with content from stdin
var inputReaderInstance = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Function to create a multi-dimensional array (not used in this specific problem, but part of the original utility)
function createMultiDimArray(initialValue) {
  var args = arguments,
    argCount = args.length,
    arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
  while (--argCount) arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  return eval(arrayCreationString);
}

// Define the modulus value
var MODULUS_VALUE = 1000003;

// Function to perform multiplication with modulo operation
function multiplyAndModulo() {
  var operands = arguments,
    currentProduct = operands[0],
    idx = 1;
  while (idx < operands.length) {
    // Optimized multiplication for large numbers to prevent overflow before modulo
    currentProduct = ((currentProduct >> 16) * operands[idx] % MODULUS_VALUE * 65536 + (currentProduct & 65535) * operands[idx++]) % MODULUS_VALUE;
  }
  return currentProduct;
}

// Cache for factorial values
var factorialCache = [1, 1];

// Function to precompute factorials up to a given limit
function precomputeFactorials(limit) {
  for (var counter = 2; counter <= limit;) {
    factorialCache[counter] = multiplyAndModulo(factorialCache[counter - 1], counter++);
  }
}

// Function to calculate modular multiplicative inverse using extended Euclidean algorithm
function modularInverse(num) {
  var modVal = MODULUS_VALUE,
    x0 = 1,
    x1 = 0,
    temp;
  while (modVal) {
    temp = num / modVal | 0; // Integer division
    num -= temp * modVal;
    x0 -= temp * x1;
    temp = num;
    num = modVal;
    modVal = temp;
    temp = x0;
    x0 = x1;
    x1 = temp;
  }
  x0 %= MODULUS_VALUE;
  return x0 < 0 ? x0 + MODULUS_VALUE : x0;
}

// Function to calculate nPr modulo MODULUS_VALUE
function nPermutationModulo(totalItems, selectedItems) {
  // nPr = n! / (n-r)!
  // This is equivalent to n! * ( (n-r)! )^-1 mod MODULUS_VALUE
  return multiplyAndModulo(factorialCache[totalItems], modularInverse(factorialCache[(totalItems - selectedItems + MODULUS_VALUE) % MODULUS_VALUE]));
}

// Function to calculate (base^exponent) modulo MODULUS_VALUE using binary exponentiation
function powerModulo(base, exponent) {
  var result = 1;
  while (exponent) {
    if (exponent & 1) { // If exponent is odd
      result = multiplyAndModulo(base, result);
    }
    base = multiplyAndModulo(base, base); // Square the base
    exponent >>= 1; // Divide exponent by 2
  }
  return result;
}

// Execute the main logic and print the result
console.log(main());

// Main function containing the problem's core logic
function main() {
  var queryCount = inputReaderInstance.readNextValue(); // Read the number of queries
  var resultsArray = Array(queryCount).fill(0); // Initialize an array to store results

  precomputeFactorials(MODULUS_VALUE); // Precompute factorials up to MODULUS_VALUE

  // Process each query
  for (var queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    var currentQueryData = inputReaderInstance.readLineValues(),
      valX = currentQueryData[0],
      valD = currentQueryData[1],
      valN = currentQueryData[2];

    // Handle edge cases
    if (valN >= MODULUS_VALUE || valX === 0) {
      resultsArray[queryIndex] = 0; // If N is too large or X is 0, result is 0
      continue;
    }

    if (valD === 0) {
      // If D is 0, it's simply X^N mod MODULUS_VALUE
      resultsArray[queryIndex] = powerModulo(valX, valN);
    } else {
      // General case: (X * (D^-1)) * (X + D) * ... * (X + (N-1)D) mod MODULUS_VALUE
      // This can be rewritten as D^N * (X/D) * (X/D + 1) * ... * (X/D + N-1) mod MODULUS_VALUE
      // Which is D^N * P((X/D) + N - 1, N) mod MODULUS_VALUE
      // Let A = (X * D^-1) mod MODULUS_VALUE
      // Then it's D^N * P(A + N - 1, N) mod MODULUS_VALUE
      var intermediateA = ((MODULUS_VALUE - multiplyAndModulo(valX, modularInverse(valD))) % MODULUS_VALUE + MODULUS_VALUE) % MODULUS_VALUE;
      var permutationResult = nPermutationModulo(intermediateA, valN);
      var powerOfModMinusD = powerModulo(MODULUS_VALUE - valD, valN); // (MODULUS_VALUE - D)^N is equivalent to (-D)^N mod MODULUS_VALUE
      resultsArray[queryIndex] = multiplyAndModulo(permutationResult, powerOfModMinusD);
    }
  }
  // Join all results with newline characters
  return resultsArray.join("\n");
}
