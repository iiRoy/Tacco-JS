const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataStore; // Manages access to processed input lines
let collectedRawInput = []; // Buffers raw input lines from stdin

// Registers a handler for each line read from standard input.
inputReader.on('line', (currentLine) => {
  collectedRawInput.push(currentLine);
});

// Registers a handler for the 'close' event, triggered when input stream ends.
inputReader.on('close', () => {
  dataStore = createInputNavigator(collectedRawInput); // Configure input access
  processMainLogic(); // Initiate the primary computational routine
});

/**
 * Constructs an object for sequential navigation through a list of input strings.
 * This replaces the original `init` function with a more descriptive structure.
 * @param {string[]} rawStringList An array of raw input strings.
 * @returns {object} An interface with methods to check for and retrieve input.
 */
function createInputNavigator(rawStringList) {
  // Added a robustness check for empty or invalid input lists.
  if (!Array.isArray(rawStringList) || rawStringList.length === 0) {
    return {
      sourceData: [],
      currentPosition: 0,
      totalEntries: 0,
      hasMore: () => false,
      fetchNext: () => { throw new Error('Attempted to fetch from an empty input source.'); }
    };
  }

  return {
    sourceData: rawStringList,
    currentPosition: 0,
    totalEntries: rawStringList.length,
    /** Determines if there are additional entries available for retrieval. */
    hasMore: function() { return (this.currentPosition < this.totalEntries); },
    /** Retrieves the next entry from the source and increments the internal pointer. */
    fetchNext: function() {
      if (this.hasMore()) {
        return this.sourceData[this.currentPosition++];
      } else {
        // Updated and simplified the error message for clarity.
        throw new Error('All input entries have been consumed.');
      }
    }
  };
}

/** Utility function to write output to standard output. Renamed from `myout`. */
const printToConsole = (content) => console.log(content);

/**
 * A versatile converter for input strings, replacing the original `myconv`.
 * Uses an `if-else if` structure instead of a `switch` for variety.
 * @param {string} inputString The string to be converted.
 * @param {number} conversionRule An integer specifying the conversion type.
 *   - 1: Parses the string as an integer.
 *   - 2: Splits the string by spaces into an array of strings.
 *   - 4: Splits by spaces and converts each part to a number.
 * @returns {any} The converted value based on the rule.
 */
function applyInputTransformation(inputString, conversionRule) {
  try {
    if (conversionRule === 1) {
      return parseInt(inputString, 10); // Explicitly specify radix 10.
    } else if (conversionRule === 2) {
      return String(inputString).split(' '); // Ensure string type before splitting.
    } else if (conversionRule === 4) {
      return String(inputString).split(' ').map(Number);
    }
    // Removed unused conversion rules (6, 7, 8, 9, 0) as they are not invoked by the core logic.
    return inputString; // Default: return original string if no rule matches.
  } catch (err) {
    // Simplified error handling; returns original on failure.
    return inputString;
  }
}

/** Retrieves the next raw string from the input data store. */
const retrieveNextString = () => dataStore.fetchNext();
/** Retrieves the next string, parsed as an integer. Renamed from `nextInt`. */
const retrieveNextParsedInt = () => applyInputTransformation(retrieveNextString(), 1);
/** Retrieves the next string, parsed as an array of integers. Renamed from `nextIntArray`. */
const retrieveNextIntArray = () => applyInputTransformation(retrieveNextString(), 4);

// This function contains the primary algorithm logic. Renamed from `Main`.
function processMainLogic() {
  const numberOfLevels = retrieveNextParsedInt(); // Renamed 'N'
  const rawNumberSequence = retrieveNextIntArray(); // Renamed 'list'

  // Added input validation for the main parameters.
  if (!Number.isInteger(numberOfLevels) || numberOfLevels < 1) {
    printToConsole("INVALID_INPUT: Number of levels must be a positive integer.");
    return;
  }

  // The total number of elements required is 2^(N+1) - 1.
  const requiredSequenceLength = (1 << (numberOfLevels + 1)) - 1;
  if (!Array.isArray(rawNumberSequence) || rawNumberSequence.length < requiredSequenceLength) {
    printToConsole("INVALID_INPUT: Insufficient elements in the provided sequence.");
    return;
  }

  // Sort the sequence in ascending order. Using `toSorted()` for immutability (Type III update).
  // This avoids modifying `rawNumberSequence` directly.
  const orderedNumericSet = rawNumberSequence.toSorted((valueA, valueB) => valueA - valueB);

  // Initialize the first comparison group with the largest element. Renamed 'check'.
  const comparisonGroups = [orderedNumericSet.pop()];

  // Iterate through subsequent levels, starting from the second level.
  // Renamed loop variable `i` to `currentLevel`.
  for (let currentLevel = 1; currentLevel <= numberOfLevels; currentLevel++) {
    const elementsForThisLevel = []; // Renamed 'check2'

    // Determine how many elements to extract for the current level (2^currentLevel).
    const countToExtract = 1 << currentLevel;

    // Added a guard to ensure enough elements remain for extraction.
    if (orderedNumericSet.length < countToExtract) {
        printToConsole("NO"); // Not enough elements to form the next level
        return;
    }

    // Extract `countToExtract` elements from the end of the sorted set.
    // Using `splice` to remove multiple elements efficiently (Type III update).
    const extractedBatch = orderedNumericSet.splice(-countToExtract);
    elementsForThisLevel.push(...extractedBatch); // Add extracted elements to the current level's array.

    // Compare elements from the previous comparison groups with the current level's elements.
    // Renamed loop variable `j` to `elementIndex`.
    for (let elementIndex = 0; elementIndex < elementsForThisLevel.length; elementIndex++) {
      // The condition checks if an element from the previous (larger) group is NOT strictly greater than
      // its corresponding element from the current (smaller) group.
      if (comparisonGroups[elementIndex] <= elementsForThisLevel[elementIndex]) {
        printToConsole("NO"); // Condition failed, output "NO" and terminate.
        return;
      }
    }

    // Merge the current level's elements into the main comparison array.
    // Using spread syntax for concatenation (Type III update).
    comparisonGroups.push(...elementsForThisLevel);
  }

  // If the algorithm completes without returning "NO", then the condition holds.
  printToConsole("YES");
}