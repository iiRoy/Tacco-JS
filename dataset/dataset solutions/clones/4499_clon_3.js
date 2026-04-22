// This section manages the foundational input/output mechanisms, typically hidden
// from direct user modification, but extensively refactored here for Type III cloning.
const systemInputReader = require('readline').createInterface({
  input: process.stdin, // Directs input from the standard input stream
  output: process.stdout // Directs output to the standard output stream
});

let runtimeDataSource; // Represents the parsed and managed input data stream
const bufferedInputLines = []; // Temporarily stores raw lines read from input

// Attaches an event listener to capture each line as it's received
systemInputReader.on('line', function(singleInputLine) {
  bufferedInputLines.push(singleInputLine);
});

// Attaches an event listener for when the entire input stream has concluded
systemInputReader.on('close', function() {
  // Initializes the data source with all collected input lines
  runtimeDataSource = setupInputHandler(bufferedInputLines);
  // A visual separator indicating the transition from input processing to program output
  console.error('\n--- Input Acquisition Complete, Proceeding to Main Logic ---\n');
  executeApplicationLogic(); // Invokes the primary program function
});

/**
 * Generates a deep replica of a given JavaScript entity.
 * Handles Sets, Arrays, and simple objects serializable by JSON.
 * @param {any} sourceEntity The original entity to be duplicated.
 * @returns {any} A distinct, deep copy of the source entity.
 */
function deepCloneEntity(sourceEntity) {
  // Guard clause: primitives or null/undefined are returned as-is
  if (sourceEntity === null || typeof sourceEntity !== 'object') {
    return sourceEntity;
  }

  // Handles Array cloning recursively
  if (Array.isArray(sourceEntity)) {
    return sourceEntity.map(element => deepCloneEntity(element));
  }

  // Handles Set cloning by converting to Array, cloning elements, then back to Set
  if (sourceEntity instanceof Set) {
    return new Set(Array.from(sourceEntity).map(element => deepCloneEntity(element)));
  }

  // For plain objects, attempts JSON serialization/deserialization for deep cloning.
  // This is a common, albeit limited, approach for JSON-safe objects.
  try {
    return JSON.parse(JSON.stringify(sourceEntity));
  } catch (serializationError) {
    // If JSON fails (e.g., circular structures, functions, BigInt),
    // logs a warning and performs a shallow copy as a fallback.
    console.warn(`[CLONE_WARN]: Failed JSON deep clone for object. Falling back to shallow copy. Error: ${serializationError.message}`);
    return { ...sourceEntity
    }; // Shallow copy for unsupported types
  }
}

/**
 * Retrieves and parses the next available integer from the data source.
 * @returns {number} The integer value.
 */
function obtainNextInteger() {
  return processInputFormat(retrieveNextDataItem(), 'parseInteger');
}

/**
 * Retrieves and parses the next available line into an array of strings.
 * @returns {string[]} An array of string tokens.
 */
function obtainNextStringTokens() {
  return processInputFormat(retrieveNextDataItem(), 'splitBySpace');
}

/**
 * Retrieves and parses the next available line into an array of numbers.
 * @returns {number[]} An array of numeric values.
 */
function obtainNextNumericArray() {
  return processInputFormat(retrieveNextDataItem(), 'splitBySpaceAndParseNumbers');
}

/**
 * Retrieves and parses the next available line into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function obtainNextCharacterArray() {
  return processInputFormat(retrieveNextDataItem(), 'splitByCharacter');
}

/**
 * Advances the data source pointer and returns the next raw input string.
 * @returns {string} The raw string from the input.
 */
function retrieveNextDataItem() {
  return runtimeDataSource.advanceAndFetch();
}

/**
 * Verifies if there are more data items remaining in the input source.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasRemainingInput() {
  return runtimeDataSource.queryAvailability();
}

/**
 * Constructs an object responsible for managing and providing input lines.
 * @param {string[]} allRawLines An array containing all input lines received.
 * @returns {object} An input management object with methods for access.
 */
function setupInputHandler(allRawLines) {
  // Guard clause: Ensures the input lines array is valid and non-empty.
  if (!Array.isArray(allRawLines) || allRawLines.length === 0) {
    console.error("[INPUT_ERROR]: No valid input lines provided for the handler.");
    // Returns a dummy handler to prevent further errors
    return {
      sourceLines: [],
      currentPosition: 0,
      totalEntries: 0,
      queryAvailability: () => false,
      advanceAndFetch: () => {
        throw new Error('InputBufferEmpty: No input data to fetch.');
      }
    };
  }

  return {
    sourceLines: allRawLines, // The complete collection of input strings
    currentPosition: 0, // Tracks the current index within `sourceLines`
    totalEntries: allRawLines.length, // The total number of input lines
    /** Checks if there are unread lines available. */
    queryAvailability: function() {
      return (this.currentPosition < this.totalEntries);
    },
    /** Retrieves the next line and increments the internal pointer. */
    advanceAndFetch: function() {
      if (this.queryAvailability()) {
        return this.sourceLines[this.currentPosition++];
      } else {
        // Throws a descriptive Error object when input is exhausted
        throw new Error('InputExhaustionError: Attempted to read past the end of the input buffer.');
      }
    }
  };
}

/**
 * Outputs a given string to the standard console.
 * @param {string} finalString The string to be displayed.
 */
function presentFinalResult(finalString) {
  console.log(finalString);
}

/**
 * Logs detailed debugging information to the standard error stream.
 * Utilizes `util.inspect` for structured output.
 * @param {any} debugPayload The data or message to log for debugging.
 */
function logDetailedDebugInfo(debugPayload) {
  const utilityModule = require('util');
  console.error('DEBUG_TRACE: ' + utilityModule.inspect(debugPayload, {
    showHidden: false, // Do not show non-enumerable properties
    depth: 5, // Inspect objects up to 5 levels deep
    colors: true // Use ANSI escape codes for colored output (if supported)
  }));
}

// A configuration object mapping format keys to their respective processing functions.
// This replaces the original switch statement, offering more extensibility.
const dataTransformers = {
  // Input transformations (from string to other types/structures)
  'parseInteger': (val) => parseInt(val, 10), // Explicitly base 10
  'splitBySpace': (val) => val.split(' '),
  'splitBySpaceAndParseNumbers': (val) => val.split(' ').map(Number),
  'splitByCharacter': (val) => val.split(''),
  'splitByCharacterAndParseNumbers': (val) => val.split('').map(Number), // e.g., "123" -> [1,2,3]

  // Output transformations (from array to string)
  'joinWithSpaces': (arr) => Array.isArray(arr) ? arr.join(' ') : String(arr), // Added type check
  'joinWithNewlines': (arr) => Array.isArray(arr) ? arr.join('\n') : String(arr),
  'joinWithoutSeparator': (arr) => Array.isArray(arr) ? arr.join('') : String(arr),

  // Default behavior if no matching transformer is found
  'default': (val) => val
};

/**
 * Applies a specified transformation to an input value based on a format key.
 * @param {any} rawValue The value to be transformed.
 * @param {string} transformKey A string key identifying the desired transformation.
 * @returns {any} The result of the transformation, or the original value on error/no match.
 */
function processInputFormat(rawValue, transformKey) {
  // Guard clause: Handles null or undefined input gracefully.
  if (rawValue === null || rawValue === undefined) {
    logDetailedDebugInfo(`[FORMAT_WARN]: Attempted to process null/undefined raw value with key: ${transformKey}`);
    return null;
  }
  try {
    // Retrieves the appropriate transformation function from the map, or the default.
    const transformerFunction = dataTransformers[transformKey] || dataTransformers['default'];
    return transformerFunction(rawValue);
  } catch (formatError) {
    // Logs any errors encountered during transformation and returns the original value.
    logDetailedDebugInfo(`[FORMAT_ERROR]: Failed to apply transformation '${transformKey}' to value '${rawValue}'. Error: ${formatError.message}`);
    return rawValue;
  }
}

// --------------------------------------------------------------------------
// End of utility and framework section.
// Main application logic begins here.
// --------------------------------------------------------------------------

/**
 * Serves as the primary entry point for the application's core logic.
 * Reads input, performs transformations, and outputs the final result.
 */
function executeApplicationLogic() {
  // Acquire the total count of elements expected for processing.
  const elementCount = obtainNextInteger(); // Renamed from N

  // Validation / Guard Clause: Checks for valid element count.
  if (isNaN(elementCount) || elementCount <= 0) {
    logDetailedDebugInfo(`[APP_WARN]: Invalid or non-positive element count received: ${elementCount}. Halting execution.`);
    presentFinalResult(""); // Output an empty string or error message
    return;
  }

  // Fetch the initial array of integers that will be manipulated.
  const initialDataArray = obtainNextNumericArray(); // Renamed from list

  // Initialize an empty array to build the transformed sequence.
  const finalSequence = []; // Renamed from output

  // Iterates through each item of the initial data array.
  for (let currentElementIndex = 0; currentElementIndex < elementCount; currentElementIndex++) { // Renamed from i
    const itemToProcess = initialDataArray[currentElementIndex]; // Helper variable for current item

    // **Rewritten Core Logic for Type III:**
    // The original nested if/else logic has been simplified and rewritten.
    // The condition (N % 2 == 0 && i % 2 == 0) || (N % 2 != 0 && i % 2 != 0)
    // is equivalent to (N + i) % 2 == 0 for appending.
    // Otherwise, prepend.
    const shouldAppendCurrentItem = ((elementCount + currentElementIndex) % 2 === 0);

    if (shouldAppendCurrentItem) {
      finalSequence.push(itemToProcess); // Add to the end of the sequence
    } else {
      finalSequence.unshift(itemToProcess); // Add to the beginning of the sequence
    }

    // Optional: Added debug fragment to trace each step of the transformation
    // logDetailedDebugInfo(`Processing index ${currentElementIndex}: Value ${itemToProcess} was ${shouldAppendCurrentItem ? 'appended' : 'prepended'}.`);
  }

  // Convert the final sequence array into a space-separated string for output.
  const formattedOutputString = processInputFormat(finalSequence, 'joinWithSpaces'); // Using the new transformer key

  // Display the final, processed result to the user.
  presentFinalResult(formattedOutputString);
}