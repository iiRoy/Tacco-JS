const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputDataStore; // Holds the custom iterator for processing input lines
const bufferedLines = []; // Accumulates all lines read from standard input

// Event handler for each line of input received
inputProcessor.on('line', (currentLine) => {
  bufferedLines.push(currentLine);
});

// Event handler when the input stream concludes
inputProcessor.on('close', () => {
  inputDataStore = initializeInputSystem(bufferedLines);
  
  // Validate if the input system was successfully set up before proceeding
  if (!inputDataStore || !inputDataStore.hasMoreLines()) {
      logDebugInfo("Input processing system failed to initialize or received no data.");
      return; // Exit if no valid input to process
  }
  
  const startTime = performance.now(); // Record start time for performance measurement
  executeSolution(); // Invoke the primary problem-solving logic
  const endTime = performance.now(); // Record end time
  
  logDebugInfo(`Solution execution time: ${(endTime - startTime).toFixed(3)} milliseconds`);
  logDebugInfo(`Memory footprint (Heap Total): ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Retrieves and parses the next line from input as an integer.
 * @returns {number} The parsed integer.
 */
function retrieveNextInteger() {
    return transformInput(fetchNextLine(), 1);
}

/**
 * Retrieves and parses the next line from input as an array of strings, split by space.
 * @returns {string[]} An array of strings.
 */
function retrieveStringArray() {
    return transformInput(fetchNextLine(), 2);
}

/**
 * Retrieves and parses the next line from input as an array of integers, split by space.
 * @returns {number[]} An array of numbers.
 */
function retrieveIntegerArray() {
    return transformInput(fetchNextLine(), 4);
}

/**
 * Retrieves and parses the next line from input as an array of characters.
 * @returns {string[]} An array of characters.
 */
function retrieveCharArray() {
    return transformInput(fetchNextLine(), 6);
}

/**
 * Fetches the next raw line from the input data store.
 * @returns {string} The next available input line.
 */
function fetchNextLine() {
    return inputDataStore.fetchNextLine();
}

/**
 * Checks if there are more lines remaining in the input data store.
 * @returns {boolean} True if more lines are available, false otherwise.
 */
function hasMoreLines() {
    return inputDataStore.hasMoreLines();
}

/**
 * Creates and returns an object that acts as an iterator for the provided lines of input.
 * This allows sequential access to input lines and checks for availability.
 * @param {string[]} lines - An array of raw string lines obtained from input.
 * @returns {object} An iterator-like object with `hasMoreLines` and `fetchNextLine` methods.
 */
function initializeInputSystem(lines) {
  // Basic validation for the input array
  if (!Array.isArray(lines) || lines.length === 0) {
      console.warn("Input stream appears empty or malformed during initialization.");
      // Return a robust empty iterator to prevent runtime errors
      return {
          sourceLines: [],
          currentIdx: 0,
          totalLines: 0,
          hasMoreLines: () => false,
          fetchNextLine: () => { throw new Error("No input lines available."); }
      };
  }

  const inputLineIterator = {
    sourceLines: lines,
    currentIdx: 0, // Current position in the lines array
    totalLines: lines.length, // Total number of lines available
    
    /**
     * Determines if there are additional lines to be read.
     * @returns {boolean} `true` if more lines exist, `false` otherwise.
     */
    hasMoreLines: function() {
      return this.currentIdx < this.totalLines;
    },
    
    /**
     * Retrieves the next line from the buffered input and advances the pointer.
     * @returns {string} The next line of input.
     * @throws {Error} If an attempt is made to read beyond the end of the input.
     */
    fetchNextLine: function() {
      if (!this.hasMoreLines()) {
        throw new Error("InputBoundaryError: Attempted to read past the end of available input.");
      }
      const lineToReturn = this.sourceLines[this.currentIdx];
      this.currentIdx++; // Move to the next line
      return lineToReturn;
    }
  };
  return inputLineIterator;
}

/**
 * Prints the given data to standard output, typically followed by a newline.
 * @param {*} data - The data to be displayed.
 */
function printResult(data) {
    console.log(data);
}

/**
 * Logs debugging information to the standard error stream.
 * It serializes objects to JSON for readability.
 * @param {*} message - The information to log. Can be a string or an object.
 */
function logDebugInfo(message) {
    if (typeof message === 'string') {
        console.error(`[DEBUG]: ${message}`);
    } else {
        // Use JSON.stringify for structured output of objects
        console.error(`[DEBUG]: ${JSON.stringify(message, null, 2)}`);
    }
}

/**
 * Transforms the input data according to a specified conversion type.
 * This function handles various parsing and formatting requirements.
 * @param {*} inputData - The data to be converted, typically a string or an array.
 * @param {number} conversionType - A numeric code dictating the conversion logic:
 *   1: Converts input string to an integer.
 *   2: Splits input string by spaces into an array of strings.
 *   4: Splits input string by spaces and converts each part to a number.
 *   6: Splits input string into an array of individual characters.
 *   7: Splits input string into characters and converts each to a number.
 *   8: Joins an array of elements into a single string, separated by spaces.
 *   9: Joins an array of elements into a single string, separated by newlines.
 *   0: Joins an array of elements into a single string, with no separator.
 * @returns {*} The converted data, or the original data if conversion fails or type is unknown.
 */
function transformInput(inputData, conversionType) {
    try {
        const dataAsString = String(inputData); // Ensure string conversion for splitting
        switch (conversionType) {
            case 1:
                const parsedValue = parseInt(dataAsString, 10);
                if (isNaN(parsedValue)) {
                    console.warn(`Warning: Failed to parse "${dataAsString}" as an integer.`);
                    return inputData; // Return original if not a valid number
                }
                return parsedValue;
            case 2:
                return dataAsString.split(" ");
            case 4:
                // Filter out empty strings before mapping to Number to avoid NaN in array
                return dataAsString.split(" ").filter(s => s !== '').map(Number);
            case 6:
                return dataAsString.split("");
            case 7:
                return dataAsString.split("").filter(s => s !== '').map(Number);
            case 8:
                // Ensure inputData is an array before attempting to join
                return Array.isArray(inputData) ? inputData.join(" ") : dataAsString;
            case 9:
                return Array.isArray(inputData) ? inputData.join("\n") : dataAsString;
            case 0:
                return Array.isArray(inputData) ? inputData.join("") : dataAsString;
            default:
                console.warn(`Unknown conversion type specified: ${conversionType}. Returning original input.`);
                return inputData;
        }
    } catch (error) {
        console.error(`Error encountered during input transformation (type ${conversionType}): ${error.message}`);
        return inputData; // Return original data to prevent program crash
    }
}

// The core algorithm implementation for the problem.
// This function determines which "switches" (represented by 1-based indices)
// must be "activated" to satisfy a set of parity conditions.
function executeSolution() {
    const problemSize = retrieveNextInteger(); // Read N: The total number of elements/boxes.
    
    // Guard clause: Handle cases where problem size is non-positive.
    if (problemSize <= 0) {
        printResult(0); // No elements means no switches to activate.
        return; // Terminate early.
    }

    const targetParities = retrieveIntegerArray(); // Read the target parity for each box.
    
    // Additional input validation: Ensure the target parities array matches the problem size.
    if (targetParities.length !== problemSize) {
        logDebugInfo(`Input array length mismatch: Expected ${problemSize} elements, but received ${targetParities.length}.`);
        // In a real-world scenario, one might throw an error or adjust `problemSize`.
        // For competitive programming, often assume valid input, but this adds robustness.
        // For now, we'll truncate or pad `targetParities` to match `problemSize`.
        if (targetParities.length > problemSize) {
            targetParities.length = problemSize; // Truncate if too long
        } else {
            // Pad with zeros or a default value if too short.
            // Assuming 0 as a neutral parity.
            while (targetParities.length < problemSize) {
                targetParities.push(0); 
            }
        }
    }

    // Initialize an array to store the state of each "switch" (0: off, 1: on).
    // The index `i` in `switchStates` corresponds to box `i+1`.
    const switchStates = Array.from({ length: problemSize }, () => 0);

    // Iterate backwards from the last potential switch (N-1) down to the first (0).
    // This reverse iteration order is crucial for correctly applying the logic
    // where the state of switch `i` depends on the states of its multiples (j*i),
    // which have already been determined in previous iterations.
    for (let currentSwitchIndex = problemSize - 1; currentSwitchIndex >= 0; --currentSwitchIndex) {
        // Calculate the 1-based "box number" associated with the current switch index.
        const associatedBoxNumber = currentSwitchIndex + 1;

        // Calculate the accumulated parity effect from all switches that are multiples
        // of the `associatedBoxNumber` and are currently 'on'.
        let accumulatedEffectParity = 0;

        // Iterate through all multiples of `associatedBoxNumber` up to `problemSize`.
        for (let multiplier = 1; (multiplier * associatedBoxNumber) <= problemSize; ++multiplier) {
            // Determine the 0-based index of the affected switch.
            const affectedSwitchArrayIndex = (multiplier * associatedBoxNumber) - 1;
            accumulatedEffectParity += switchStates[affectedSwitchArrayIndex];
        }

        // Compare the parity of the `accumulatedEffectParity` with the `targetParities`
        // for the `currentSwitchIndex`.
        // If they do not match, it implies that the `currentSwitchIndex` switch
        // must be "on" (set to 1) to correct the overall parity for this box.
        if ((accumulatedEffectParity % 2) !== (targetParities[currentSwitchIndex] % 2)) {
            switchStates[currentSwitchIndex] = 1; // Mark this switch as 'on'.
        }
    }

    // Collect the 1-based indices of all switches that were determined to be 'on'.
    const activatedSwitches = [];
    for (let idx = 0; idx < problemSize; ++idx) {
        if (switchStates[idx] === 1) {
            activatedSwitches.push(idx + 1); // Add the 1-based index to the result list.
        }
    }

    // Output the total count of activated switches.
    printResult(activatedSwitches.length);

    // If there are any activated switches, print their 1-based indices,
    // formatted as a space-separated string.
    if (activatedSwitches.length > 0) {
        printResult(transformInput(activatedSwitches, 8));
    }
}