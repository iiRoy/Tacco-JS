const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor; // Global object to manage input stream
const bufferedInputLines = []; // Stores all lines read from stdin

// Event listener for each line of input
inputReader.on('line', (currentLine) => {
  if (currentLine !== null && currentLine.length > 0) { // Add a small validation
    bufferedInputLines.push(currentLine.trim()); // Store trimmed input
  }
});

// Event listener for when input stream closes
inputReader.on('close', () => {
  dataProcessor = setupDataProcessor(bufferedInputLines); // Initialize input system
  console.warn("\n--- Program Execution Initiated ---"); // Diagnostic message
  const startTimeNs = process.hrtime.bigint(); // High-resolution timer start
  
  executeCoreLogic(); // Call the main function
  
  const endTimeNs = process.hrtime.bigint(); // High-resolution timer end
  const elapsedTimeMs = Number(endTimeNs - startTimeNs) / 1_000_000; // Convert nanoseconds to milliseconds
  
  reportDebugInfo(`Total Execution Time: ${elapsedTimeMs.toFixed(3)} ms`);
  reportDebugInfo(`System Memory Usage (Heap Total): ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
  console.warn("--- Program Execution Concluded ---"); // Diagnostic message
});

/**
 * Creates a deep copy of a given object using JSON serialization.
 * This function is included as a utility but might not be directly used in the main logic.
 * @param {object} sourceObject - The object to clone.
 * @returns {object} A new object with the same structure and values.
 */
function replicateStructure(sourceObject) {
  if (sourceObject === null || typeof sourceObject !== 'object' || Array.isArray(sourceObject)) {
    return sourceObject; // Primitive values, null, or arrays are returned directly for shallow copy in this context
  }
  try {
    return JSON.parse(JSON.stringify(sourceObject));
  } catch (e) {
    reportDebugInfo(`Warning: Failed to perform deep replication for object due to: ${e.message}`);
    return { ...sourceObject }; // Fallback to shallow copy
  }
}

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The parsed integer.
 */
function getNextNumericValue() {
  return performTypeConversion(pullNextItem(), 101); // Using new conversion codes
}

/**
 * Retrieves the next line as an array of strings, split by space.
 * @returns {string[]} An array of strings.
 */
function acquireTokenArray() {
  return performTypeConversion(pullNextItem(), 102);
}

/**
 * Retrieves the next line as an array of numbers, split by space.
 * @returns {number[]} An array of numbers.
 */
function acquireNumericTokenArray() {
  return performTypeConversion(pullNextItem(), 104);
}

/**
 * Retrieves the next line as an array of single characters.
 * @returns {string[]} An array of characters.
 */
function acquireCharacterSequence() {
  return performTypeConversion(pullNextItem(), 106);
}

/**
 * Advances the input cursor and returns the next item.
 * @returns {string} The next raw input string.
 * @throws {Error} If there is no more input.
 */
function pullNextItem() {
  return dataProcessor.retrieveNext();
}

/**
 * Checks if there are more items in the input stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function canProceed() {
  return dataProcessor.hasMoreData();
}

/**
 * Initializes the input processing system from an array of raw lines.
 * @param {string[]} rawInputLines - An array of strings from stdin.
 * @returns {object} An object with methods to access input.
 */
function setupDataProcessor(rawInputLines) {
  const filteredInput = rawInputLines.filter(line => typeof line === 'string' && line.length > 0); // Enhanced filtering
  if (filteredInput.length === 0) {
    reportDebugInfo("Warning: Input buffer is empty after filtering.");
  }
  return {
    sourceArray: filteredInput,
    currentPosition: 0,
    totalElements: filteredInput.length,

    /**
     * Checks if there are more data elements to process.
     * @returns {boolean} True if more data, false otherwise.
     */
    hasMoreData: function() {
      return (this.currentPosition < this.totalElements);
    },

    /**
     * Retrieves the next data element.
     * @returns {string} The next data element.
     * @throws {Error} If no more data is available.
     */
    retrieveNext: function() {
      if (!this.hasMoreData()) {
        throw new Error("InputOutOfBoundsException: Attempted to read beyond available input elements.");
      }
      return this.sourceArray[this.currentPosition++];
    }
  };
}

/**
 * Displays a message to standard output.
 * @param {any} content - The content to display.
 */
function emitOutput(content) {
  console.log(content);
}

/**
 * Logs diagnostic information to standard error.
 * @param {any} message - The message or object to log.
 */
function reportDebugInfo(message) {
  // Using console.warn for debug output, which typically goes to stderr.
  // Changed from util.inspect for simpler output.
  console.warn(`[DIAGNOSTIC]: ${String(message)}`);
}

/**
 * Performs various type conversions or array manipulations based on an operation code.
 * @param {any} inputItem - The item to convert.
 * @param {number} operationCode - Code specifying the conversion type.
 * @returns {any} The converted or processed item.
 */
function performTypeConversion(inputItem, operationCode) {
  if (inputItem === null || inputItem === undefined || (typeof inputItem === 'string' && inputItem.trim() === '')) {
    reportDebugInfo("Conversion attempt on invalid inputItem (null/undefined/empty string).");
    return inputItem;
  }

  try {
    switch (operationCode) {
      case 101: // Convert to integer
        const parsedNum = Number(inputItem);
        return Number.isInteger(parsedNum) ? parsedNum : Math.floor(parsedNum); // Ensure integer, floor if float
      case 102: // Split by space into string array
        return String(inputItem).split(" ");
      case 104: // Split by space into number array, handling potential NaNs
        return String(inputItem).split(" ").map(val => {
          const num = Number(val);
          return Number.isNaN(num) ? 0 : num; // Default to 0 if not a valid number
        });
      case 106: // Split by character into character array
        return String(inputItem).split("");
      case 108: // Join array with space
        return Array.isArray(inputItem) ? inputItem.join(" ") : String(inputItem);
      case 109: // Join array with newline
        return Array.isArray(inputItem) ? inputItem.join("\n") : String(inputItem);
      case 110: // Join array without separator
        return Array.isArray(inputItem) ? inputItem.join("") : String(inputItem);
      default: // Default: return item as is
        reportDebugInfo(`Unknown conversion operation code: ${operationCode}. Returning original item.`);
        return inputItem;
    }
  } catch (conversionError) {
    reportDebugInfo(`Conversion error for code ${operationCode} on item '${inputItem}': ${conversionError.message}`);
    return inputItem; // Return original item on error
  }
}

// End of input/utility section.
// --------------------------------------------------------------------------------------------------

/**
 * The primary execution logic of the program.
 * Determines if a given number is triangular and, if so, constructs a specific structure
 * representing sets where each number from 1 to N appears twice.
 */
function executeCoreLogic() {
  const targetValue = getNextNumericValue(); // Read the main input number

  if (targetValue <= 0) { // Guard clause for invalid input (must be positive)
    emitOutput("No");
    reportDebugInfo(`Input target value '${targetValue}' is not a positive integer. Cannot form triangular number.`);
    return;
  }

  let isTriangularNumber = false;
  let kFactor = 0; // Will store 'k' if targetValue is k*(k+1)/2

  // Mathematical approach to check if N is a triangular number:
  // N = k * (k + 1) / 2
  // 2N = k^2 + k
  // k^2 + k - 2N = 0
  // Using quadratic formula: k = (-1 +/- sqrt(1 - 4*1*(-2N))) / 2
  // k = (-1 +/- sqrt(1 + 8N)) / 2
  const discriminant = 1 + 8 * targetValue;
  const squareRootDiscriminant = Math.sqrt(discriminant);

  if (Number.isInteger(squareRootDiscriminant)) { // If sqrt is an integer, discriminant is a perfect square
    const potentialK = (-1 + squareRootDiscriminant) / 2;
    // k must be a positive integer
    if (Number.isInteger(potentialK) && potentialK > 0) { 
      isTriangularNumber = true;
      kFactor = potentialK;
    }
  }

  // If the number is not triangular, output "No" and terminate.
  if (!isTriangularNumber) {
    emitOutput("No");
    reportDebugInfo(`Input value ${targetValue} is not a valid triangular number.`);
    return;
  }

  emitOutput("Yes"); // If it is triangular, output "Yes".

  // Now, construct the specific output structure based on 'kFactor'.
  // This structure represents sets where each number from 1 to N appears exactly twice.
  const totalNumberOfSets = kFactor + 1;
  const expectedSetSize = kFactor; // Each set will contain 'kFactor' elements

  // Initialize a 2D array (list of lists) with default values (e.g., 0)
  const resultingStructure = Array.from({ length: totalNumberOfSets }, () => new Array(expectedSetSize).fill(0));

  let currentUniqueElement = 1; // Unique values to be placed into the structure

  // Populate the resulting structure using a specific pattern.
  // This nested loop logic ensures each `currentUniqueElement` is placed twice.
  for (let outerSetIndex = 0; outerSetIndex < expectedSetSize; ++outerSetIndex) {
    for (let innerSetIndex = outerSetIndex; innerSetIndex < expectedSetSize; ++innerSetIndex) {
      // Place the current unique value into two designated positions:
      // 1. In the `outerSetIndex` set, at the `innerSetIndex` slot.
      // 2. In the `innerSetIndex + 1` set, at the `outerSetIndex` slot.
      resultingStructure[outerSetIndex][innerSetIndex] = currentUniqueElement;
      resultingStructure[innerSetIndex + 1][outerSetIndex] = currentUniqueElement;
      currentUniqueElement++; // Increment to the next unique value
    }
  }

  // Add a small validation: check if all elements were used and placed correctly
  if (currentUniqueElement - 1 !== targetValue) {
    reportDebugInfo(`Error: Mismatch in expected element count. Expected ${targetValue}, got ${currentUniqueElement - 1}.`);
    // This is an internal consistency check, not directly affecting output format
  }

  reportDebugInfo("Generated internal list structure:");
  reportDebugInfo(JSON.stringify(resultingStructure)); // Log the intermediate structure for debugging

  emitOutput(totalNumberOfSets); // Output the total number of sets (k+1)

  // Format each set for final output: prepend the set size (kFactor) and join elements with spaces.
  const formattedOutputLines = resultingStructure.map(currentSetArray => {
    // Create a new array for each line to avoid modifying the original `resultingStructure` directly
    const lineContent = [expectedSetSize, ...currentSetArray];
    return performTypeConversion(lineContent, 108); // Join elements with spaces
  });

  // Output all formatted lines, joined by newlines, as the final result.
  emitOutput(performTypeConversion(formattedOutputLines, 109));
}