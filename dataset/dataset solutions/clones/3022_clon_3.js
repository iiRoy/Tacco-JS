const DataStreamParser = (function() {
  // Factory function to create a new parser instance
  // This function is the public interface to the parsing utility.
  function createParserInstance(sourceText) {
    // Basic validation: ensure the input source is a string.
    if (typeof sourceText !== 'string') {
      console.error("Input source for DataStreamParser must be a string.");
      return new StreamProcessor(""); // Return a safe, empty processor
    }
    return new StreamProcessor(sourceText);
  }

  // Core class for processing input lines and tokens.
  // Manages the buffer of lines and the current position.
  function StreamProcessor(rawText) {
    // Trim the raw text and split it into individual lines.
    this._linesBuffer = rawText.trim().split('\n');
    // Initialize the current line index to the beginning of the buffer.
    this._currentLineIndex = 0;
    // Buffer for tokens of the current line, allowing token-by-token reading.
    this._currentLineTokens = [];
  }

  // Method to read a single numerical value or a string token from the input stream.
  // If the current line's token buffer is empty, it advances to the next line.
  StreamProcessor.prototype.nextElement = function(returnAsString = false) {
    // Continuously try to populate the current line's token buffer until a token is available
    // or the end of the input stream is reached.
    while (this._currentLineTokens.length === 0) {
      if (this._currentLineIndex >= this._linesBuffer.length) {
        // If no more lines, log a warning and return undefined to indicate end of stream.
        console.warn("DataStreamParser: Attempted to read beyond end of input stream. Returning undefined.");
        return undefined;
      }
      // Split the next line into tokens using space as a delimiter.
      const lineText = this._linesBuffer[this._currentLineIndex];
      this._currentLineTokens = lineText.split(' ');
      this._currentLineIndex++; // Move to the next line in the buffer.
    }

    // Extract the first token from the buffer.
    const token = this._currentLineTokens.shift();
    // Return the token as a string or convert it to a number based on the flag.
    return returnAsString ? token : Number(token);
  };

  // Method to read an entire line as an array of values.
  // Clears any partially read tokens from the previous line before reading a new one.
  StreamProcessor.prototype.readLine = function(asStringArray = false) {
    if (this._currentLineIndex >= this._linesBuffer.length) {
      console.warn("DataStreamParser: Attempted to read line beyond end of input stream. Returning empty array.");
      return [];
    }
    // Clear any pending tokens from previous partial reads to ensure a fresh line read.
    this._currentLineTokens = [];

    // Get the current line content and immediately advance the line index.
    const currentLineContent = this._linesBuffer[this._currentLineIndex++];
    const tokens = currentLineContent.split(' ');

    // Add a guard for empty lines or lines with only whitespace.
    if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === '')) {
      return [];
    }
    // Return tokens as strings or numbers.
    return asStringArray ? tokens : tokens.map(val => Number(val));
  };

  // Method to read multiple lines, treating each as an array of values (matrix-like structure).
  StreamProcessor.prototype.readMultiLineMatrix = function(rowsCount, keepOriginalStrings = false) {
    if (rowsCount <= 0) {
      console.warn("DataStreamParser: Invalid rowsCount for readMultiLineMatrix. Returning empty array.");
      return [];
    }
    const startIdx = this._currentLineIndex;
    const endIdx = startIdx + rowsCount;

    // Check if there are enough lines available.
    if (endIdx > this._linesBuffer.length) {
      console.error(`DataStreamParser: Not enough lines available to read ${rowsCount} rows. Only ${this._linesBuffer.length - startIdx} available.`);
      rowsCount = this._linesBuffer.length - startIdx; // Adjust count to available lines.
    }

    // Extract the raw lines using slice.
    const rawLines = this._linesBuffer.slice(startIdx, endIdx);
    this._currentLineIndex = endIdx; // Update the current line index.
    this._currentLineTokens = []; // Clear current tokens as lines have been skipped.

    // Use a traditional for loop for processing, demonstrating a Type III change from `map`.
    const resultMatrix = [];
    for (let i = 0; i < rawLines.length; i++) {
      const lineTokens = rawLines[i].split(' ');
      resultMatrix.push(keepOriginalStrings ? lineTokens : lineTokens.map(str => Number(str)));
    }
    return resultMatrix;
  };

  // Method to read multiple lines, where each line contains a single scalar value.
  StreamProcessor.prototype.readScalarList = function(numberOfItems, preserveStrings = false) {
    if (numberOfItems <= 0) {
      console.warn("DataStreamParser: Invalid numberOfItems for readScalarList. Returning empty array.");
      return [];
    }
    const startIndex = this._currentLineIndex;
    let endIndex = startIndex + numberOfItems;

    // Check for out-of-bounds access and adjust if necessary.
    if (endIndex > this._linesBuffer.length) {
      console.warn(`DataStreamParser: Requested ${numberOfItems} items, but only ${this._linesBuffer.length - startIndex} lines remaining. Adjusting.`);
      endIndex = this._linesBuffer.length;
      numberOfItems = endIndex - startIndex;
    }

    const extractedLines = this._linesBuffer.slice(startIndex, endIndex);
    this._currentLineIndex = endIndex; // Update the line index.
    this._currentLineTokens = []; // Clear any pending tokens.

    // Use a while loop instead of `map` for Type III transformation.
    let idx = 0;
    const processedValues = [];
    while (idx < extractedLines.length) {
      const value = extractedLines[idx].trim(); // Trim each line value before processing.
      processedValues.push(preserveStrings ? value : Number(value));
      idx++;
    }
    return processedValues;
  };

  return createParserInstance;
})();

// Initialize the input parser instance by reading from standard input.
const problemInput = DataStreamParser(require("fs").readFileSync("/dev/stdin", "utf8"));


// Helper function to create multi-dimensional arrays initialized with a specific value.
// This function replaces the original `xArray` using a recursive approach instead of `eval`.
function createMultiDimArray(initialVal, ...dimensions) {
  // Guard clause for no dimensions provided.
  if (!dimensions || dimensions.length === 0) {
    console.error("createMultiDimArray: No dimensions provided. Returning empty array.");
    return [];
  }

  // Filter out any non-positive dimensions, as they would result in empty arrays.
  const validDimensions = dimensions.filter(dim => dim > 0);
  if (validDimensions.length === 0) {
    console.warn("createMultiDimArray: All provided dimensions were non-positive. Returning empty array.");
    return [];
  }

  // Inner recursive function to build the array structure.
  const constructArray = (currentDimIndex) => {
    if (currentDimIndex === validDimensions.length - 1) {
      // Base case: If it's the last dimension, create a 1D array filled with the initial value.
      return new Array(validDimensions[currentDimIndex]).fill(initialVal);
    } else {
      // Recursive step: Create an array, and fill it with arrays returned by the next recursive call.
      const outerArray = [];
      const currentSize = validDimensions[currentDimIndex];
      for (let i = 0; i < currentSize; i++) {
        outerArray.push(constructArray(currentDimIndex + 1));
      }
      return outerArray;
    }
  };

  // Start the recursive construction from the first dimension.
  return constructArray(0);
}

// Constant for modular arithmetic operations.
const PRIME_MODULUS = 998244353;

// Helper function for modular addition.
// Takes multiple numbers and returns their sum modulo PRIME_MODULUS.
function modularAdd(...numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    // Add number and take modulo.
    sum = (sum + numbers[i]) % PRIME_MODULUS;
    // Ensure the result is non-negative, as JS modulo can return negative for negative inputs.
    if (sum < 0) {
      sum += PRIME_MODULUS;
    }
  }
  return sum;
}

// Helper function for modular multiplication.
// Takes multiple factors and returns their product modulo PRIME_MODULUS.
// Uses BigInt to prevent potential overflow for intermediate products before taking modulo.
function modularMultiply(...factors) {
  let product = 1n; // Start with BigInt 1
  // Guard clause for no factors, returning 0 as convention for an empty product.
  if (factors.length === 0) return 0;

  for (let i = 0; i < factors.length; i++) {
    // Convert current factor to BigInt for multiplication.
    product = (product * BigInt(factors[i])) % BigInt(PRIME_MODULUS);
  }
  // Convert the BigInt result back to a Number.
  return Number(product);
}

// Helper function for modular exponentiation (baseValue^exponentValue % PRIME_MODULUS).
// Implements exponentiation by squaring for efficiency.
function modularPower(baseValue, exponentValue) {
  let result = 1;
  let currentBase = baseValue;

  // Guard for negative exponent, which is usually not handled directly in modular exponentiation
  // without modular multiplicative inverse.
  if (exponentValue < 0) {
    console.warn("modularPower: Negative exponent not supported directly. Returning 0.");
    return 0;
  }

  // Ensure base is within the modulus range (0 to PRIME_MODULUS-1).
  currentBase %= PRIME_MODULUS;
  if (currentBase < 0) currentBase += PRIME_MODULUS;

  // Binary exponentiation loop.
  while (exponentValue > 0) {
    // If exponentValue is odd, multiply result by currentBase.
    if (exponentValue % 2 === 1) {
      result = modularMultiply(result, currentBase);
    }
    // Square the currentBase and halve the exponentValue.
    currentBase = modularMultiply(currentBase, currentBase);
    exponentValue = Math.floor(exponentValue / 2);
  }
  return result;
}

// Main function to execute the problem's logic.
function computeSolution() {
  // Read the number of elements (N) from the input.
  const numberOfElements = problemInput.nextElement();

  // Read the array of numbers, sort them in ascending order.
  const dataArray = problemInput.readScalarList(numberOfElements).sort((valA, valB) => valA - valB);

  // Calculate the total sum of elements in the array.
  // Using a traditional for loop instead of `reduce` for a Type III structural change.
  let aggregateSum = 0;
  for (let idx = 0; idx < dataArray.length; idx++) {
    aggregateSum += dataArray[idx];
  }

  // Initialize the dynamic programming table for subset sums.
  // `currentDPState[j]` will store the number of ways to form sum `j`.
  // Initially, sum 0 can be formed in 1 way (by choosing no elements).
  let currentDPState = [1];

  // Build the DP table for subset sums.
  // This DP calculates the number of ways to partition elements into three groups
  // (e.g., Left, Right, Middle) such that two groups sum to `j` and one group sums to `j + currentElementValue`.
  for (let elementIndex = 0; elementIndex < numberOfElements; elementIndex++) {
    const currentElementValue = dataArray[elementIndex];
    // Calculate the maximum possible sum for the next DP state.
    const nextDPStateLength = currentDPState.length + currentElementValue;

    // Create the next DP state array, initialized with zeros.
    const nextDPState = createMultiDimArray(0, nextDPStateLength);

    // Iterate through the current DP states to compute the next states.
    for (let currentSum = 0; currentSum < currentDPState.length; currentSum++) {
      // Optimization: Skip if the current sum cannot be formed.
      if (currentDPState[currentSum] === 0) continue;

      // Logic for partitioning into three groups (L, M, R):
      // 1. `currentElementValue` goes to the 'Middle' group OR 'Left' group:
      //    The sum `currentSum` can still be formed. Each way `currentDPState[currentSum]` contributes
      //    twice to `nextDPState[currentSum]` (once for Middle, once for Left).
      nextDPState[currentSum] = modularAdd(nextDPState[currentSum], modularMultiply(currentDPState[currentSum], 2));

      // 2. `currentElementValue` goes to the 'Right' group:
      //    The sum `currentSum + currentElementValue` can be formed. Each way `currentDPState[currentSum]`
      //    contributes once to `nextDPState[currentSum + currentElementValue]`.
      // Ensure bounds are checked before accessing `nextDPState` for the new sum.
      if (currentSum + currentElementValue < nextDPStateLength) {
        nextDPState[currentSum + currentElementValue] = modularAdd(nextDPState[currentSum + currentElementValue], currentDPState[currentSum]);
      } else {
        // This warning indicates a potential issue in calculating `nextDPStateLength` or array access.
        console.warn(`computeSolution: DP state array out of bounds at sum ${currentSum + currentElementValue}.`);
      }
    }
    // Update the current DP state for the next iteration.
    currentDPState = nextDPState;
  }

  // Initialize the final answer with 3^N (total ways to assign each element to one of three categories).
  let finalAnswer = modularPower(3, numberOfElements);

  // Conditional calculation based on the total sum's parity.
  if (aggregateSum % 2 === 0) {
    const targetHalfSum = aggregateSum / 2;
    // Add the contribution from the special case where total sum is even.
    finalAnswer = modularAdd(finalAnswer, calculateSubsetSumContribution(dataArray, numberOfElements, targetHalfSum));
  }

  // Calculate the threshold sum: ceil(aggregateSum / 2).
  // Using Math.ceil for clarity, replacing the bit shift operator.
  const thresholdSum = Math.ceil(aggregateSum / 2);

  // Subtract contributions from sums greater than or equal to the threshold sum.
  // This part adjusts the count based on the problem's specific combinatorial requirements.
  for (let sumIdx = thresholdSum; sumIdx < currentDPState.length; sumIdx++) {
    // Subtract `currentDPState[sumIdx] * 3` from the answer.
    // Using `modularAdd` with a negative multiplied value to handle subtraction modulo `PRIME_MODULUS`.
    finalAnswer = modularAdd(finalAnswer, modularMultiply(currentDPState[sumIdx], -3));
  }

  // Ensure the final answer is positive and within the modulus range.
  // This handles cases where `finalAnswer` might be negative due to subtractions.
  return (finalAnswer + PRIME_MODULUS) % PRIME_MODULUS;
}

// Helper function for a specific subset sum calculation, used when the total sum is even.
// This DP calculates the number of ways to form sum `requiredSum` by choosing elements for a single subset.
function calculateSubsetSumContribution(inputData, countItems, requiredSum) {
  // Basic validation for `requiredSum`.
  if (requiredSum < 0) {
    console.warn(`calculateSubsetSumContribution: Required sum ${requiredSum} is negative. Returning 0.`);
    return 0;
  }

  // Initialize DP table. `dpTable[j]` stores the number of ways to form sum `j`.
  let dpTable = [1]; // Sum 0 can be formed in 1 way (empty subset).

  // Build the DP table.
  for (let itemIdx = 0; itemIdx < countItems; itemIdx++) {
    const itemValue = inputData[itemIdx];
    // Calculate the maximum possible sum for the next DP table.
    const nextTableLength = dpTable.length + itemValue;
    const nextDpTable = createMultiDimArray(0, nextTableLength);

    // Iterate through current DP states.
    for (let currentSum = 0; currentSum < dpTable.length; currentSum++) {
      // Optimization: Skip if the current sum cannot be formed.
      if (dpTable[currentSum] === 0) continue;

      // Option 1: Don't include the current item in the subset.
      // The sum `currentSum` remains unchanged.
      nextDpTable[currentSum] = modularAdd(nextDpTable[currentSum], dpTable[currentSum]);

      // Option 2: Include the current item in the subset.
      // The sum becomes `currentSum + itemValue`.
      // Ensure bounds are checked.
      if (currentSum + itemValue < nextTableLength) {
        nextDpTable[currentSum + itemValue] = modularAdd(nextDpTable[currentSum + itemValue], dpTable[currentSum]);
      } else {
        console.warn(`calculateSubsetSumContribution: DP table out of bounds at sum ${currentSum + itemValue}.`);
      }
    }
    // Update the current DP table.
    dpTable = nextDpTable;
  }

  // Check if `requiredSum` is within the bounds of the final DP table.
  if (requiredSum >= dpTable.length) {
    console.warn(`calculateSubsetSumContribution: Required sum ${requiredSum} is out of bounds for DP table. Returning 0.`);
    return 0;
  }
  // Return the count for the `requiredSum`, multiplied by 3 as per problem logic.
  return modularMultiply(dpTable[requiredSum], 3);
}

// Output the result of the main computation.
console.log(computeSolution());