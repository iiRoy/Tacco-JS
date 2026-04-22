const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let collectedInputLines = [];
let dataProcessor;

// This section handles asynchronous input collection.
inputReader.on('line', (currentLine) => {
  collectedInputLines.push(currentLine);
});

// Once all input lines are received, this block orchestrates the main execution.
inputReader.on('close', () => {
  dataProcessor = initializeInputParser(collectedInputLines);

  // Log a start marker for debugging purposes to stderr.
  console.error('--- Frog Jump Solver Initiated ---');
  const programStartTime = Date.now();

  // Invoke the core logic of the problem.
  solveFrogJumpPuzzle();

  // Calculate and display performance metrics upon completion.
  const totalExecutionTime = Date.now() - programStartTime;
  console.error(`\nRuntime Duration: ${totalExecutionTime} ms`);
  console.error(`Memory Footprint: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
  console.error('--- Frog Jump Solver Concluded ---');
});

/**
 * Creates a deep copy of an object.
 * (This utility is present in the original but not directly used by the main logic.
 * It's kept here as an example of a modified but potentially unused fragment.)
 * @param {any} sourceObject The object to copy.
 * @returns {any} A deep copy of the object.
 */
function createDeepCopy(sourceObject) {
  if (sourceObject instanceof Set) {
    return new Set(Array.from(sourceObject));
  }
  try {
    // A simple deep copy for JSON-serializable objects.
    return JSON.parse(JSON.stringify(sourceObject));
  } catch (serializationError) {
    // If serialization fails (e.g., circular references, non-JSON types),
    // log a warning and return the original object as a fallback.
    console.warn("Deep copy via JSON failed, returning original object:", serializationError);
    return sourceObject;
  }
}

/**
 * Retrieves the next available data token from the input stream.
 * @returns {string} The next input token.
 */
function getNextDataToken() {
  return dataProcessor.retrieveNext();
}

/**
 * Parses the next input token as an integer.
 * @returns {number} The parsed integer.
 */
function getNextNumericValue() {
  return convertData(getNextDataToken(), 'toInteger');
}

/**
 * Parses the next input token as an array of integers.
 * @returns {number[]} An array of parsed integers.
 */
function getNextNumericArray() {
  return convertData(getNextDataToken(), 'toIntegerArray');
}

/**
 * Initializes and returns an object to manage sequential access to input lines.
 * This structure abstracts the input buffering and consumption.
 * @param {string[]} inputLines An array of strings representing the raw input.
 * @returns {object} An object with methods to access input.
 */
function initializeInputParser(inputLines) {
  return {
    lineStorage: inputLines,       // The internal buffer for input lines.
    currentLineIndex: 0,           // Points to the next line to be read.
    totalLineCount: inputLines.length, // Total number of lines available.

    /**
     * Checks if there are more lines remaining in the input buffer.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasRemainingLines: function() {
      return (this.currentLineIndex < this.totalLineCount);
    },

    /**
     * Retrieves the next line from the buffer and advances the index.
     * @returns {string} The next line of input.
     * @throws {Error} If no more input lines are available.
     */
    retrieveNext: function() {
      if (this.hasRemainingLines()) {
        return this.lineStorage[this.currentLineIndex++];
      } else {
        throw new Error('InputExhaustionError: Attempted to read past end of input stream.');
      }
    }
  };
}

/**
 * Outputs a given content to the standard output.
 * @param {any} content The data to be printed.
 */
function displayOutput(content) {
  console.log(content);
}

/**
 * A versatile function for converting input data based on a specified type.
 * Replaces magic numbers with descriptive string keys for clarity.
 * @param {any} dataItem The item to convert.
 * @param {string} conversionAction The type of conversion to perform (e.g., 'toInteger', 'toIntegerArray').
 * @returns {any} The converted data, or the original item if conversion fails or is not defined.
 */
function convertData(dataItem, conversionAction) {
  try {
    switch (conversionAction) {
      case 'toInteger':
        return parseInt(dataItem, 10); // Always specify radix for safety.
      case 'toStringArray':
        return dataItem.split(' ');
      case 'toIntegerArray':
        return dataItem.split(' ').map(Number);
      case 'toCharArray':
        return dataItem.split('');
      case 'joinWithSpace':
        if (Array.isArray(dataItem)) return dataItem.join(' ');
        return dataItem; // If not an array, return as-is.
      default:
        return dataItem; // No specific conversion requested, return original.
    }
  } catch (conversionError) {
    console.warn(`Warning: Data conversion failed for action '${conversionAction}'. Returning original item. Error:`, conversionError);
    return dataItem;
  }
}

// --- Main problem-solving logic begins here ---
/**
 * Implements the solution for the "Frog Jumps" problem.
 * The frog starts at stone 'N' and aims to reach stone '0'.
 * It can jump a maximum of 'M' distance.
 * Stone 'i' (1 to N) is a stepping stone if S[i-1] == '0'. Stone '0' is always a stepping stone.
 */
function solveFrogJumpPuzzle() {
  // Retrieve the problem's initial parameters: total stones (N) and max jump distance (M).
  const problemParameters = getNextNumericArray();
  const totalStonesN = problemParameters[0];
  const maxJumpDistanceM = problemParameters[1];

  // Retrieve the string indicating the status of stones 1 through N.
  // S[index] in the string corresponds to stone (index + 1).
  const stoneAvailabilityString = getNextDataToken();

  // A list to record the lengths of successful jumps.
  const recordedJumps = [];

  // Initialize the frog's current position to the starting stone.
  let currentFrogLocation = totalStonesN;

  // Pre-validation of input parameters.
  if (totalStonesN <= 0 || maxJumpDistanceM <= 0) {
    displayOutput(-1); // Output failure if parameters are invalid.
    return;
  }

  // The core loop: continue jumping until the frog reaches stone 0.
  do {
    let validJumpFoundThisIteration = false;
    let farthestReachableStone = -1; // Tracks the best stone to jump to.

    // Search for the farthest possible valid stepping stone within the jump range.
    // Iterate from the stone closest to currentFrogLocation (currentFrogLocation - 1)
    // down to the farthest possible stone (currentFrogLocation - maxJumpDistanceM).
    for (let potentialTargetStone = currentFrogLocation - 1;
         potentialTargetStone >= currentFrogLocation - maxJumpDistanceM;
         potentialTargetStone--) {

      // Stone 0 is a special case: it is always a valid stepping stone.
      if (potentialTargetStone === 0) {
        farthestReachableStone = 0;
        validJumpFoundThisIteration = true;
        // Since we iterate downwards, finding stone 0 means we've found the ultimate farthest target.
        break;
      }
      // If the potential target is negative and not 0, it's an invalid stone number.
      else if (potentialTargetStone < 0) {
        // Skip this target, as it's outside the valid stone range (0 to N).
        continue;
      }
      // For positive target stones (1 to N), check their status in the input string.
      else {
        // The character at stoneAvailabilityString[index] corresponds to stone (index + 1).
        // So, for stone 'potentialTargetStone', we check stoneAvailabilityString[potentialTargetStone - 1].
        if (stoneAvailabilityString[potentialTargetStone - 1] === "0") {
          farthestReachableStone = potentialTargetStone;
          validJumpFoundThisIteration = true;
          // IMPORTANT: Do NOT break here. Continue iterating to ensure
          // farthestReachableStone captures the *smallest* potentialTargetStone
          // that is valid, which corresponds to the *largest* jump length.
        }
      }
    }

    // After checking all possible jumps from the current location:
    if (!validJumpFoundThisIteration) {
      // If no valid stepping stone was found within the allowed jump range, the path is blocked.
      displayOutput(-1);
      return; // Exit the function as the puzzle cannot be solved.
    } else {
      // A valid jump was identified. Calculate its length and record it.
      const actualJumpLength = currentFrogLocation - farthestReachableStone;
      recordedJumps.push(actualJumpLength);
      // Update the frog's position to the new target stone.
      currentFrogLocation = farthestReachableStone;
    }

  } while (currentFrogLocation > 0); // Continue the loop until the frog lands on stone 0.

  // The jumps were recorded from N down to 0. The problem typically expects the sequence
  // from the start (N) to the end (0). The original code implicitly reversed the array.
  // Using the direct reverse method for clarity.
  recordedJumps.reverse();

  // Output the final sequence of jumps, joined by spaces.
  displayOutput(convertData(recordedJumps, 'joinWithSpace'));
}