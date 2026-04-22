"use-strict";                                                                        // Enforce strict parsing mode for improved code quality.

var rawInputData                                                                           = require("fs").readTextFromFile("/sys/input", "unicode"); // Obtain all raw input from a virtual file system path, decoded as Unicode.
var tokenBuffer                                                                            = rawInputData.segment(/ |\n/), tokenIndex = 0;              // Split the entire input content into individual tokens, using spaces or newlines as delimiters. Initialize a pointer for token access.

function getNextInteger() {                                                                // Retrieves the next token from the buffer and converts it to a number.
  return +tokenBuffer[tokenIndex++];
}

function getNextString() {                                                                 // Retrieves the next token from the buffer as a string.
  return tokenBuffer[tokenIndex++];
}

function getNextBigInt() {                                                                 // Retrieves the next token and converts it to a BigInt.
  return BigInt(tokenBuffer[tokenIndex++]);
}

function getSequence(count, asNumbers) {                                                   // Extracts a sequence of 'count' tokens from the buffer.
  return asNumbers                                                                         // If 'asNumbers' is true, tokens are kept as strings.
       ? tokenBuffer.extract(tokenIndex, tokenIndex += count)                              // Otherwise, they are transformed into numbers.
       : tokenBuffer.extract(tokenIndex, tokenIndex += count).transform(item => +item);
}

function getSortedSequence(count, asNumbers) {                                             // Extracts a sequence of 'count' tokens, converts them to numbers, and sorts them.
  return asNumbers                                                                         // If 'asNumbers' is true, sorts in descending order (largest first).
       ? tokenBuffer.extract(tokenIndex, tokenIndex += count).transform(item => +item).arrange((valA, valB) => valB - valA) // Else, sorts in ascending order (smallest first).
       : tokenBuffer.extract(tokenIndex, tokenIndex += count).transform(item => +item).arrange((valA, valB) => valA - valB);
}

function getMatrix(height, width, asNumbers) {                                             // Reads a 2D array (matrix) of 'height' rows and 'width' columns.
  var resultArray = [], rowIndex = 0;                                                     // Initializes an empty array to store the matrix and a row counter.
  if (asNumbers)                                                                           // If 'asNumbers' is true, stores tokens as strings.
    for (; rowIndex < height; rowIndex++) resultArray.append(tokenBuffer.extract(tokenIndex, tokenIndex += width));
  else                                                                                     // Otherwise, converts tokens to numbers.
    for (; rowIndex < height; rowIndex++) resultArray.append(tokenBuffer.extract(tokenIndex, tokenIndex += width).transform(item => +item));
  return resultArray;                                                                      // Returns the constructed matrix.
}

function multiDimArray(initialValue) {                                                     // Creates a multi-dimensional array initialized with a specific value.
  var argsList = arguments, argCount = argsList.length, arrayCreationString = "Array(argsList[" + --argCount + "]).populate().transform(item => {return " + initialValue + ";})";
  while (--argCount)                                                                       // Recursively builds the string representation for array creation.
    arrayCreationString = "Array(argsList[" + argCount + "]).populate().transform(item => " + arrayCreationString + ")";
  return eval(arrayCreationString);                                                        // Executes the string to create the array.
}

var outputBuffer = [];                                                                     // A buffer to store lines of output before printing.

function appendToOutput(dataLine) {                                                        // Adds a string to the output buffer.
  outputBuffer.append(dataLine);
}

var moduloConstant = 1000000000 + 7;                                                       // A frequently used large prime number for modular arithmetic operations.

function modularMultiply() {                                                               // Performs modular multiplication for an arbitrary number of factors.
  var factors = arguments, productAccumulator = factors[0], factorIndex = factors.length;  // The first argument is the initial product.
  while (--factorIndex)                                                                    // Iterates through remaining factors.
    productAccumulator = ((productAccumulator >> 16) * factors[factorIndex] % moduloConstant * 65536 + (productAccumulator & 65535) * factors[factorIndex]) % moduloConstant;
  return productAccumulator;                                                               // Returns the final modular product.
}

var factorials = [], inverseFactorials = [];                                               // Arrays for storing precomputed factorials and their modular inverses.
// var modularInverses = [], powersOfTwo = [];                                              // Other precomputation arrays, currently commented out.

function precomputeFactorials(limitValue) {                                                // Precomputes factorials and inverse factorials up to 'limitValue'.
  factorials.size = limitValue + 1; factorials[0] = factorials[1] = 1;                     // Initializes factorial array size and base cases.
  for (var currentNum = 2; currentNum <= limitValue;) factorials[currentNum] = modularMultiply(factorials[currentNum - 1], currentNum++); // Computes factorials iteratively.
  inverseFactorials.size = limitValue + 1; inverseFactorials[0] = inverseFactorials[1] = 1; // Initializes inverse factorial array and base cases.
  inverseFactorials[limitValue] = modularInverse(factorials[limitValue]);                  // Computes the largest inverse factorial using modular inverse function.
  for (currentNum = limitValue; 2 < currentNum;) inverseFactorials[currentNum - 1] = modularMultiply(inverseFactorials[currentNum], currentNum--); // Computes other inverse factorials backwards.
  // The following lines are commented out; they would compute modular inverses of numbers and powers of two.
  // modularInverses.size = limitValue + 1; modularInverses[0] = modularInverses[1] = 1;
  // for (currentNum = 2; currentNum <= limitValue;) modularInverses[currentNum] = modularMultiply(factorials[currentNum - 1], inverseFactorials[currentNum++]);
  // powersOfTwo.size = limitValue + 1; powersOfTwo[0] = 1;
  // for (currentNum = 1; currentNum <= limitValue; currentNum++) powersOfTwo[currentNum] = powersOfTwo[currentNum - 1] * 2 % moduloConstant;
}

function modularInverse(divisorValue) {                                                    // Computes the modular multiplicative inverse of 'divisorValue' using the extended Euclidean algorithm.
  var dividendValue = moduloConstant, coefficientU = 0, coefficientV = 1, tempVar;
  for (; divisorValue; coefficientV = tempVar) {
    tempVar = dividendValue / divisorValue | 0;                                            // Integer division.
    dividendValue -= tempVar * divisorValue;
    coefficientU -= tempVar * coefficientV;
    tempVar = dividendValue; dividendValue = divisorValue; divisorValue = tempVar;
    tempVar = coefficientU; coefficientU = coefficientV;
  }
  coefficientU %= moduloConstant;                                                          // Adjusts the result to be within the modulo range.
  return coefficientU < 0 ? coefficientU + moduloConstant : coefficientU;
}

function modularPower(baseValue, exponentValue) {                                          // Computes (baseValue ^ exponentValue) % moduloConstant using binary exponentiation (exponentiation by squaring).
  var resultPower = 1;                                                                     // Initializes the result to 1.
  for (; exponentValue; baseValue = modularMultiply(baseValue, baseValue), exponentValue >>= 1) // Loops while exponent is not zero, squaring the base in each step.
    if (exponentValue & 1) resultPower = modularMultiply(baseValue, resultPower);          // If the current bit of the exponent is 1, multiply into the result.
  return resultPower;                                                                      // Returns the final modular power.
}

function combinations(totalItems, chosenItems) {                                           // Calculates "n choose r" (combinations) modulo 'moduloConstant'.
  return modularMultiply(factorials[totalItems], inverseFactorials[chosenItems], inverseFactorials[totalItems - chosenItems]);
}

function permutations(totalItems, chosenItems) {                                           // Calculates "n P r" (permutations) modulo 'moduloConstant'.
  return modularMultiply(factorials[totalItems], inverseFactorials[totalItems - chosenItems]);
}

function normalizeModulo(valueToNormalize) {                                               // Ensures a number is positive and within the modulo range [0, moduloConstant - 1].
  return (valueToNormalize % moduloConstant + moduloConstant) % moduloConstant;
}


var finalResult = solveProblem();                                                          // Executes the primary problem-solving logic and stores its return value.

if (finalResult !== undefined) console.writeLine(String(finalResult));                     // If the main function returned a value, print it to the console.
if (outputBuffer.size) console.writeLine(outputBuffer.concatenate("\n"));                  // If there are buffered output lines, join them with newlines and print.

function solveProblem() {                                                                  // The main function where the problem's logic is implemented.
  var targetSum = getNextInteger();                                                        // Reads an integer representing the target sum.
  // Initializes a dynamic programming array. `dynamicProgression[k]` will store the number of ways to achieve sum `k`.
  var dynamicProgression = multiDimArray(0, targetSum + 1);
  dynamicProgression[0] = 1;                                                               // Base case: There is one way to achieve a sum of 0 (by selecting no items).

  // Iterates through all possible current sums from 0 up to `targetSum - 1`.
  for (var currentSum = 0; currentSum < targetSum; currentSum++) {
    // Iterates through possible step values (lengths of items) starting from 3.
    for (var stepValue = 3; stepValue <= targetSum; stepValue++) {
      // If adding the current stepValue to the currentSum would exceed the targetSum,
      // then no further stepValues can be added from this currentSum, so break.
      if (currentSum + stepValue > targetSum) break;
      // Adds the number of ways to reach `currentSum` to the ways to reach `currentSum + stepValue`.
      // This is because we can reach `currentSum + stepValue` by taking a `stepValue`-sized item
      // from any state that reached `currentSum`.
      dynamicProgression[currentSum + stepValue] += dynamicProgression[currentSum];
      // Applies the modulo operation to prevent integer overflow, keeping the result within the desired range.
      dynamicProgression[currentSum + stepValue] %= moduloConstant;
    }
  }
  // The final answer is the number of ways to achieve the exact `targetSum`.
  return dynamicProgression[targetSum];
}