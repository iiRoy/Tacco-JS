const { createInterface } = require('readline');
const util = require('util');

let inputProcessor;
const inputBuffer = [];
let dataStreamFacade;

const lineReaderInterface = createInterface({
  input: process.stdin,
  output: process.stdout
});

lineReaderInterface.on('line', (currentLineText) => {
  inputBuffer.push(currentLineText);
});

lineReaderInterface.on('close', () => {
  dataStreamFacade = initializeInputParser(inputBuffer);
  console.error('\nStarting execution of the main algorithm...\n');

  const startTime = Date.now();
  executeSolution();
  const endTime = Date.now() - startTime;

  printDiagnostic(`Execution Time: ${endTime} ms`);
  printDiagnostic(`Memory Usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Creates a deep copy of a given JavaScript object.
 * This is useful for preventing unintended side effects when modifying objects.
 * @param {object} sourceObject - The object to be cloned.
 * @returns {object} A new, independent copy of the source object.
 */
function replicateData(sourceObject) {
  try {
    return JSON.parse(JSON.stringify(sourceObject));
  } catch (error) {
    console.warn("Warning: Failed to deep clone object. Returning original. Error:", error.message);
    return sourceObject;
  }
}

/**
 * Retrieves the next integer value from the input stream.
 * @returns {number} The parsed integer.
 */
function getNextInteger() {
  return parseInputToken(fetchNextToken(), 1);
}

/**
 * Retrieves the next array of strings from the input stream, split by space.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() {
  return parseInputToken(fetchNextToken(), 2);
}

/**
 * Retrieves the next array of integers from the input stream, split by space.
 * @returns {number[]} An array of integers.
 */
function getNextIntegerArray() {
  return parseInputToken(fetchNextToken(), 4);
}

/**
 * Retrieves the next array of characters from the input stream.
 * @returns {string[]} An array of characters.
 */
function getNextCharArray() {
  return parseInputToken(fetchNextToken(), 6);
}

/**
 * Fetches the next raw token (line) from the input stream.
 * @returns {string} The next available input line.
 */
function fetchNextToken() {
  if (!dataStreamFacade) {
    throw new Error("Input stream facade not initialized.");
  }
  return dataStreamFacade.next();
}

/**
 * Checks if there are more tokens (lines) available in the input stream.
 * @returns {boolean} True if more tokens are available, false otherwise.
 */
function hasMoreTokens() {
  if (!dataStreamFacade) {
    return false;
  }
  return dataStreamFacade.hasNext();
}

/**
 * Initializes and returns an object to manage input lines as a stream of tokens.
 * @param {string[]} linesCollection - An array of input strings.
 * @returns {object} An object with methods to navigate the input stream.
 */
function initializeInputParser(linesCollection) {
  let currentPosition = 0;
  const totalLines = linesCollection.length;

  return {
    sourceLines: linesCollection,
    currentPosition: currentPosition,
    totalLines: totalLines,

    /**
     * Checks if there are more lines to read in the input stream.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    hasNext: function() {
      return (this.currentPosition < this.totalLines);
    },

    /**
     * Retrieves the next line from the input stream and advances the pointer.
     * @returns {string} The next line.
     * @throws {Error} If attempting to read beyond the end of the input.
     */
    next: function() {
      if (this.hasNext()) {
        return this.sourceLines[this.currentPosition++];
      } else {
        throw new Error("EndOfInputStreamException: No more input lines available.");
      }
    }
  };
}

/**
 * Displays a message to the standard output.
 * @param {*} content - The content to be displayed.
 */
function displayResult(content) {
  console.log(content);
}

/**
 * Logs debug information to the standard error stream.
 * @param {*} message - The message or data structure to log.
 */
function printDiagnostic(message) {
  console.error(`DEBUG: ${util.inspect(message, { showHidden: false, depth: null, colors: true })}`);
}

/**
 * Converts an input string based on a specified conversion type.
 * @param {string|string[]} inputItem - The item to convert.
 * @param {number} conversionType - Specifies the conversion logic.
 *   1: Parse as integer.
 *   2: Split string by space into an array of strings.
 *   4: Split string by space and map to numbers.
 *   6: Split string into an array of characters.
 *   7: Split string into characters and map to numbers.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements with no separator.
 *   Default: Return input as is.
 * @returns {*} The converted value.
 */
function parseInputToken(inputItem, conversionType) {
  if (inputItem === null || inputItem === undefined) {
    printDiagnostic(`Warning: Attempted to convert null/undefined input with type ${conversionType}. Returning original.`);
    return inputItem;
  }

  try {
    switch (conversionType) {
      case 1:
        const parsedInt = parseInt(inputItem, 10);
        if (isNaN(parsedInt)) {
          printDiagnostic(`Warning: Could not parse "${inputItem}" as integer. Returning original.`);
          return inputItem;
        }
        return parsedInt;
      case 2:
        return String(inputItem).split(" ");
      case 4:
        return String(inputItem).split(" ").map(Number);
      case 6:
        return String(inputItem).split("");
      case 7:
        return String(inputItem).split("").map(Number);
      case 8:
        if (Array.isArray(inputItem)) return inputItem.join(" ");
        printDiagnostic(`Warning: Conversion type 8 (join space) expects an array, got ${typeof inputItem}.`);
        return inputItem;
      case 9:
        if (Array.isArray(inputItem)) return inputItem.join("\n");
        printDiagnostic(`Warning: Conversion type 9 (join newline) expects an array, got ${typeof inputItem}.`);
        return inputItem;
      case 0:
        if (Array.isArray(inputItem)) return inputItem.join("");
        printDiagnostic(`Warning: Conversion type 0 (join no separator) expects an array, got ${typeof inputItem}.`);
        return inputItem;
      default:
        printDiagnostic(`Info: Unknown conversion type ${conversionType}. Returning input as is.`);
        return inputItem;
    }
  } catch (error) {
    printDiagnostic(`Error during input conversion (type ${conversionType}): ${error.message}. Returning original input.`);
    return inputItem;
  }
}

/**
 * The main function implementing the core algorithm logic.
 * This function solves a problem related to unlocking elements with minimum cost.
 */
function executeSolution() {
  // Read the initial problem parameters: total elements (N) and number of operations (M)
  const problemParameters = getNextIntegerArray();
  const totalElements = problemParameters[0];
  const numOperations = problemParameters[1];

  // Validate initial parameters
  if (totalElements <= 0 || numOperations < 0) {
    displayResult(-1);
    printDiagnostic(`Invalid initial parameters: N=${totalElements}, M=${numOperations}. Exiting.`);
    return;
  }

  // Stores details for each operation, indexed by (original) operation ID + 1
  const procedureCatalog = new Array(numOperations + 1);

  // Maps each element (item) to a list of operations that can unlock it.
  const itemDependencyMap = new Map();

  // Populate the procedure catalog and the dependency map
  for (let opIdx = 0; opIdx < numOperations; opIdx++) {
    const currentOperationData = getNextIntegerArray();
    const operationCost = currentOperationData[0];
    const numAffectedItems = currentOperationData[1];
    const affectedItems = getNextIntegerArray();

    // Basic validation for the operation data
    if (affectedItems.length !== numAffectedItems) {
      printDiagnostic(`Warning: Operation ${opIdx + 1} declared ${numAffectedItems} items but provided ${affectedItems.length}. Proceeding with provided.`);
    }

    // Store operation details
    procedureCatalog[opIdx + 1] = {
      procCost: operationCost,
      unlockedItems: affectedItems
    };

    // Update the dependency map: for each item, list which operations can unlock it
    for (const unlockedItem of affectedItems) {
      if (!itemDependencyMap.has(unlockedItem)) {
        itemDependencyMap.set(unlockedItem, []);
      }
      itemDependencyMap.get(unlockedItem).push(opIdx + 1);
    }
  }

  let totalMinimumCost = 0;
  const activatedElements = new Set();

  // Iterate through each element from 1 to N to ensure all are activated
  for (let elementId = 1; elementId <= totalElements; elementId++) {
    // If the current element has already been activated by a previous operation, skip it
    if (activatedElements.has(elementId)) {
      continue;
    }

    // Find all procedures that can unlock the current `elementId`
    const relevantProcedures = itemDependencyMap.get(elementId);

    // If no procedure can unlock this element, it's impossible to complete
    if (!relevantProcedures || relevantProcedures.length === 0) {
      displayResult(-1);
      printDiagnostic(`Error: Element ${elementId} cannot be unlocked by any known procedure. Exiting.`);
      return;
    }

    // Find the cheapest procedure among the relevant ones
    let currentMinCost = Number.MAX_SAFE_INTEGER;
    let selectedProcedureIndex = -1;

    for (const procId of relevantProcedures) {
      if (procId > 0 && procId <= numOperations && procedureCatalog[procId]) {
        const procedure = procedureCatalog[procId];
        if (procedure.procCost < currentMinCost) {
          currentMinCost = procedure.procCost;
          selectedProcedureIndex = procId;
        }
      } else {
        printDiagnostic(`Warning: Invalid procedure ID ${procId} found for element ${elementId} in dependency map.`);
      }
    }

    if (selectedProcedureIndex === -1 || currentMinCost === Number.MAX_SAFE_INTEGER) {
      displayResult(-1);
      printDiagnostic(`Error: Failed to select a valid procedure for element ${elementId}. Exiting.`);
      return;
    }

    totalMinimumCost += currentMinCost;

    const chosenProcedure = procedureCatalog[selectedProcedureIndex];
    if (chosenProcedure && chosenProcedure.unlockedItems) {
      for (const unlockedElement of chosenProcedure.unlockedItems) {
        activatedElements.add(unlockedElement);
      }
    } else {
      printDiagnostic(`Warning: Selected procedure ${selectedProcedureIndex} has no unlocked items or is invalid.`);
    }

    // Optimization: if all elements are already activated, we can stop early.
    if (activatedElements.size >= totalElements) {
        printDiagnostic(`All ${totalElements} elements activated. Early exit from main loop.`);
        break;
    }
  }

  // Final check: ensure all required elements (1 to N) are actually activated
  let allElementsCovered = true;
  for (let i = 1; i <= totalElements; i++) {
      if (!activatedElements.has(i)) {
          allElementsCovered = false;
          break;
      }
  }

  if (!allElementsCovered) {
      displayResult(-1);
      printDiagnostic(`Final Check Failed: Not all ${totalElements} elements were activated. Some are missing.`);
  } else {
      displayResult(totalMinimumCost);
  }
}