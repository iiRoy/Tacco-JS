var InputParserFactory=(function(){
  // This function acts as a factory, providing a robust way to create an input reader.
  // It ensures the input is valid before proceeding to create the parsing instance.
  function createInputReader(rawInputString){
    if (typeof rawInputString !== 'string') {
      // Log an error for invalid input type and return a safe, empty reader.
      console.error("InputParserFactory received non-string input. Returning an empty reader.");
      return new InputReader("");
    }
    return new InputReader(rawInputString);
  }

  // The InputReader class manages the internal state and methods for parsing input lines.
  function InputReader(initialStringContent){
    // Store lines of input. Trim whitespace from start/end, split by newline,
    // and filter out any empty lines that might result from trailing newlines.
    this.lineBuffer = initialStringContent.trim().split("\n").filter(lineContent => lineContent.length > 0);
    // currentLineIndex keeps track of the line currently being processed.
    this.currentLineIndex = 0;
    // currentLineTokenCache stores the individual tokens (words) of the current line,
    // reversed to allow efficient extraction using `pop()`.
    this.currentLineTokenCache = [];
  }

  // Extend the InputReader prototype with various parsing methods.
  Object.assign(InputReader.prototype, {
    /**
     * Reads and returns a single atomic value (token) from the input.
     * It processes the current line's tokens, extracting one at a time.
     * If the current line is exhausted, it automatically advances to the next.
     * @param {boolean} [returnAsString=false] If true, returns the value as a string; otherwise, attempts conversion to a number.
     * @returns {string|number|undefined} The parsed value, or undefined if no more input tokens.
     */
    readAtomicValue: function(returnAsString){
      const cachedLines = this.lineBuffer;
      let linePosition = this.currentLineIndex;
      let extractedToken;

      // Check if there are any lines left to process.
      if (linePosition >= cachedLines.length) {
        return undefined; // No more input lines.
      }

      // If the token cache for the current line is empty, it means we need to populate it.
      // This occurs when starting a new line or when the previous line's tokens were all consumed.
      if (this.currentLineTokenCache.length === 0) {
        const currentLineContent = cachedLines[linePosition];
        if (typeof currentLineContent === "string") {
          // Split the line by spaces and reverse the array. Reversing allows using `pop()`
          // to get elements from the logical "left" (start of the line) efficiently.
          this.currentLineTokenCache = currentLineContent.split(" ").reverse();
        } else {
          // This scenario indicates an unexpected non-string entry in the lineBuffer.
          // Advance the line index to skip it and try again, or return undefined.
          this.currentLineIndex++;
          return undefined;
        }
      }

      // Extract the next token from the cache.
      extractedToken = this.currentLineTokenCache.pop();

      // If the cache is now empty after popping, it means all tokens on the current line
      // have been processed. Advance to the next line.
      if (!this.currentLineTokenCache.length) {
        this.currentLineIndex++;
      }

      // Return the token, converting to a number if `returnAsString` is false.
      return returnAsString ? extractedToken : Number(extractedToken);
    },

    /**
     * Reads an entire line of input and returns its tokens as an array.
     * The line index is advanced after reading.
     * @param {boolean} [returnAsString=false] If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>|undefined} An array of parsed values, or undefined if no more lines.
     */
    readLineTokens: function(returnAsString){
      const availableLines = this.lineBuffer;
      if (this.currentLineIndex >= availableLines.length) {
        return undefined; // No more lines available.
      }

      // Get the current line's string content and then advance the line index.
      const lineContentString = availableLines[this.currentLineIndex++];
      // Clear the atomic token cache as we are now processing a whole new line.
      this.currentLineTokenCache = [];

      const tokens = lineContentString.split(" ");
      return returnAsString ? tokens : tokens.map(token => Number(token));
    },

    /**
     * Reads a specified number of lines, interpreting each as a row in a matrix (2D array).
     * @param {number} numberOfRows The count of rows to read for the matrix.
     * @param {boolean} [returnAsString=false] If true, returns a matrix of strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    readMatrixData: function(numberOfRows, returnAsString){
      const collectedRows = [];
      // Basic input validation for numberOfRows.
      if (numberOfRows <= 0 || !Number.isInteger(numberOfRows)) {
          console.warn(`readMatrixData called with invalid number of rows: ${numberOfRows}. Returning empty array.`);
          return [];
      }

      // Loop to read each row individually using `readLineTokens`.
      for (let rowCounter = 0; rowCounter < numberOfRows; rowCounter++) {
        const rowData = this.readLineTokens(returnAsString);
        if (rowData !== undefined) {
          collectedRows.push(rowData);
        } else {
          // If input runs out before reading all expected rows.
          console.warn(`Attempted to read ${numberOfRows} matrix rows, but only found ${rowCounter} valid rows.`);
          break;
        }
      }
      return collectedRows;
    },

    /**
     * Reads a specified number of lines, interpreting each line as a single value in a vector (1D array).
     * @param {number} vectorLength The number of elements (lines) to read for the vector.
     * @param {boolean} [returnAsString=false] If true, returns a vector of strings; otherwise, numbers.
     * @returns {Array<string|number>} A 1D array representing the vector.
     */
    readVectorData: function(vectorLength, returnAsString){
      const collectedElements = [];
      if (vectorLength <= 0 || !Number.isInteger(vectorLength)) {
          console.warn(`readVectorData called with invalid vector length: ${vectorLength}. Returning empty array.`);
          return [];
      }

      // Loop to read each line as a single element.
      for (let elementCounter = 0; elementCounter < vectorLength; elementCounter++) {
        // Direct access and increment for each line, assuming each line is a single value.
        const lineContent = this.lineBuffer[this.currentLineIndex++];
        if (lineContent !== undefined) {
          collectedElements.push(returnAsString ? lineContent : Number(lineContent));
        } else {
           // If input runs out prematurely.
           console.warn(`Attempted to read ${vectorLength} vector elements, but only found ${elementCounter} valid elements.`);
           break;
        }
      }
      return collectedElements;
    }
  });

  return createInputReader; // Return the factory function.
})();

// Initialize the input processing system. This part is environment-dependent.
// For Node.js, it reads from standard input using the 'fs' module.
const dataInputProcessor = InputParserFactory(require("fs").readFileSync("/dev/stdin","utf8"));

/**
 * Creates a multi-dimensional array dynamically, initialized with a specified value or expression.
 * This function uses 'eval' for its dynamic array creation, which offers flexibility but
 * should be used with caution in contexts where input strings are untrusted.
 * @param {*} initialValueExpression The value or expression to populate array elements with.
 * @param {...number} dimensions A variable number of arguments specifying the size of each dimension.
 * @returns {Array} The newly created and initialized multi-dimensional array.
 */
function createMultiDimArray(initialValueExpression, ...dimensions){
  const numberOfDimensions = dimensions.length;
  if (numberOfDimensions === 0) {
    console.warn("createMultiDimArray called without any dimensions. Returning an empty array.");
    return [];
  }

  // Build the array creation string using template literals for clarity.
  // The process starts from the innermost dimension and builds outwards.
  // Example for dimensions [d1, d2, d3]:
  // `Array(d3).fill(null).map(() => (initialValueExpression))`
  // then `Array(d2).fill(null).map(() => (Array(d3).fill(null).map(() => (initialValueExpression))))`
  // and so on. `fill(null)` is used as a placeholder before mapping.
  let arrayConstructionCode = `Array(dimensions[${numberOfDimensions - 1}]).fill(null).map(() => (${initialValueExpression}))`;

  // Iterate backwards through dimensions to nest the array creation calls.
  for (let dimIndex = numberOfDimensions - 2; dimIndex >= 0; dimIndex--) {
    arrayConstructionCode = `Array(dimensions[${dimIndex}]).fill(null).map(() => (${arrayConstructionCode}))`;
  }

  // Execute the constructed code string.
  try {
    return eval(arrayConstructionCode);
  } catch (executionError) {
    console.error(`Failed to create multi-dimensional array: ${executionError.message}`);
    return []; // Return an empty array in case of an error during evaluation.
  }
}

// The primary execution function of the program.
// It orchestrates input parsing, data transformation, and binary search to find an optimal value.
console.log(performMainComputation());

/**
 * Encapsulates the core computational logic.
 * Reads problem parameters, processes item data, sorts items,
 * and performs a binary search to determine a specific threshold.
 * @returns {number} The calculated optimal threshold value.
 */
function performMainComputation(){
  // Read the initial problem parameters from the input stream.
  const numberOfItems = dataInputProcessor.readAtomicValue(); // Corresponds to 'n'
  const maximumCapacity = dataInputProcessor.readAtomicValue(); // Corresponds to 'x'

  // Read the detailed data for each item. This forms a 2D array.
  // Each inner array represents an item with specific properties.
  const itemPropertyMatrix = dataInputProcessor.readMatrixData(numberOfItems); // Corresponds to 'b'

  let accumulatedDirectContribution = 0; // Corresponds to 's'

  // --- Initial Item Processing Loop ---
  // Iterate through each item to calculate and store additional derived properties.
  // Using `forEach` for a clear iteration over the matrix rows.
  itemPropertyMatrix.forEach((currentItemRow) => {
    // Extract base properties for improved readability.
    const baseVal = currentItemRow[0];
    const firstMultiplier = currentItemRow[1];
    const secondMultiplier = currentItemRow[2];

    // Calculate the 'direct contribution' (original 't').
    const currentDirectContribution = baseVal * firstMultiplier;
    // Calculate the 'indirect contribution' (original 'a').
    const currentIndirectContribution = (maximumCapacity - baseVal) * secondMultiplier;

    // Add the direct contribution to the overall accumulator.
    accumulatedDirectContribution += currentDirectContribution;

    // Augment the item's row with the newly calculated values.
    // The original code used `push(a,t,a+t)`.
    // After this, indices will be:
    // currentItemRow[3] = currentIndirectContribution
    // currentItemRow[4] = currentDirectContribution
    // currentItemRow[5] = currentIndirectContribution + currentDirectContribution (combined)
    currentItemRow.push(currentIndirectContribution, currentDirectContribution, currentIndirectContribution + currentDirectContribution);
  });

  // Sort the items based on their 'combined contribution' (index 5) in descending order.
  // This sorting is crucial for the greedy approach within the binary search.
  itemPropertyMatrix.sort((itemOne, itemTwo) => itemTwo[5] - itemOne[5]);

  // --- Binary Search Initialization ---
  // `feasibleUpperThreshold` represents the highest value known to be achievable.
  // `infeasibleLowerThreshold` represents the lowest value known to be unachievable.
  let feasibleUpperThreshold = numberOfItems * maximumCapacity; // Corresponds to 'ok'
  let infeasibleLowerThreshold = -1; // Corresponds to 'ng'

  // Perform a binary search to find the minimum feasible threshold.
  while (feasibleUpperThreshold - infeasibleLowerThreshold > 1) {
    // Calculate the midpoint. Using bitwise right shift for efficient integer division.
    const currentMidpointGuess = (feasibleUpperThreshold + infeasibleLowerThreshold) >>> 1; // Corresponds to 'm'

    let currentRemainingSum = accumulatedDirectContribution; // Corresponds to 'u'
    let currentCapacityToDistribute = currentMidpointGuess; // Corresponds to 'k'

    // --- Helper for Item Reduction Calculation ---
    // This function encapsulates the logic for how much value an item contributes
    // given a certain amount of capacity. This was the core of the complex `else` block.
    const determineItemReduction = (itemData, availableCapacity) => {
      // If the available capacity is less than the item's base value (itemData[0]).
      if (availableCapacity < itemData[0]) {
        // Reduction is proportional to the available capacity and the first multiplier (itemData[1]).
        return itemData[1] * availableCapacity;
      } else {
        // If capacity is sufficient, reduction is the item's direct contribution (itemData[4])
        // plus an additional reduction based on excess capacity and the second multiplier (itemData[2]).
        return itemData[4] + (availableCapacity - itemData[0]) * itemData[2];
      }
    };

    // --- Iteration for Capacity Distribution ---
    // Loop through the sorted items. The loop continues as long as there are items left,
    // capacity to distribute, and the sum can still be reduced.
    for (let itemIdx = 0;
         itemIdx < numberOfItems && currentCapacityToDistribute > 0 && currentRemainingSum > 0;
         itemIdx++)
    {
      const currentItem = itemPropertyMatrix[itemIdx];

      // Check if we can apply a full 'maximumCapacity' chunk to the current item/process.
      if (maximumCapacity <= currentCapacityToDistribute) {
        currentRemainingSum -= currentItem[5]; // Subtract the item's combined contribution.
        currentCapacityToDistribute -= maximumCapacity; // Reduce the capacity by a full chunk.
      } else {
        // If remaining capacity is less than 'maximumCapacity', we apply it partially.
        // This is where the complex nested logic of the original code was simplified.
        // The original inner loop with `v = u` was effectively processing the current item
        // with the remaining `k` and then resetting `v` for a potential next item if `k` wasn't zero.
        // Here, we apply the remaining `currentCapacityToDistribute` to the current item
        // and then set `currentCapacityToDistribute` to zero, meaning it's fully utilized.
        const reductionValue = determineItemReduction(currentItem, currentCapacityToDistribute);
        currentRemainingSum -= reductionValue;
        currentCapacityToDistribute = 0; // All remaining capacity is consumed by this item.
      }
    }

    // Update the binary search bounds based on the outcome of this `currentMidpointGuess`.
    if (currentRemainingSum > 0) {
      // If the sum is still positive, this `currentMidpointGuess` was too low (infeasible).
      infeasibleLowerThreshold = currentMidpointGuess;
    } else {
      // If the sum is zero or negative, this `currentMidpointGuess` is feasible.
      // We try for an even smaller value in the next iteration.
      feasibleUpperThreshold = currentMidpointGuess;
    }
  }

  // After the binary search, `feasibleUpperThreshold` will hold the smallest feasible value.
  return feasibleUpperThreshold;
}