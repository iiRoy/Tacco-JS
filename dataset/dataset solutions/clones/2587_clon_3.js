// --- Input acquisition and preparation utilities ---
const rawInputLines = []; // Array to store lines read from standard input
let dataStreamAccessor = null; // Object to manage sequential access to processed input

// Initialize readline interface for standard input/output
require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', (incomingLine) => {
  // Collect each line as it arrives
  rawInputLines.push(incomingLine);
}).on('close', () => {
  // Once all input lines are received, prepare the data stream
  dataStreamAccessor = prepareInputDataStream(rawInputLines);
  // Provide a visual cue in error stream that input processing is complete
  console.error('\n--- Input gathered. Initiating core program logic. ---');
  runMainComputation(); // Execute the primary function
});

/**
 * Creates an accessor object for sequential reading of input lines.
 * This acts as a custom iterator over the collected input.
 * @param {string[]} lines - An array of strings, each representing a line of input.
 * @returns {object} An object with methods to check for more data and retrieve the next line.
 */
function prepareInputDataStream(lines) {
  return {
    sourceContent: lines, // The underlying array of input strings
    currentCursor: 0, // Points to the next line to be read
    totalContentLength: lines.length, // Total number of lines available

    /**
     * Checks if there are more lines available in the input stream.
     * @returns {boolean} True if more lines can be read, false otherwise.
     */
    canReadNext: function() {
      return this.currentCursor < this.totalContentLength;
    },

    /**
     * Retrieves the next line from the input stream and advances the cursor.
     * Throws an error if attempting to read past the end of the stream.
     * @returns {string} The next line of input.
     */
    fetchNextLine: function() {
      if (this.canReadNext()) {
        return this.sourceContent[this.currentCursor++];
      } else {
        throw new Error('InputStreamExhausted: Attempted to read beyond available input.');
      }
    }
  };
}

/**
 * Displays a message to standard output.
 * @param {any} content - The content to display.
 */
function outputResult(content) {
  console.log(content);
}

// Custom input parsing helpers, tailored to the specific needs of runMainComputation.
// These replace parts of the original 'myconv' and 'next*' functions.

/**
 * Reads the next line from the data stream and parses it as an integer.
 * @returns {number} The parsed integer value.
 */
function fetchInteger() {
  return parseInt(dataStreamAccessor.fetchNextLine(), 10);
}

/**
 * Reads the next line, splits it by space, and converts each part to a number.
 * @returns {number[]} An array of parsed integer values.
 */
function fetchIntegerSequence() {
  return dataStreamAccessor.fetchNextLine().split(' ').map(Number);
}

// --- End of input utilities ---

// --- Main application logic ---
/**
 * Executes the primary computation logic for the problem.
 * This function processes the input values according to a specific tree-like comparison rule.
 */
function runMainComputation() {
  const maximumTreeDepth = fetchInteger(); // 'N' from original, represents levels below root
  let numericalValues = fetchIntegerSequence(); // 'list' from original

  // Type III: Add an explicit validation for the expected number of elements.
  // For a tree with 'maximumTreeDepth' levels below the root (total depth = maximumTreeDepth + 1),
  // the total number of nodes is 2^(depth + 1) - 1.
  const requiredNodeCount = (2 ** (maximumTreeDepth + 1)) - 1;
  if (numericalValues.length !== requiredNodeCount) {
    outputResult("No"); // Indicate failure due to malformed input
    console.error(`DEBUG: Input element count mismatch. Expected ${requiredNodeCount} nodes for depth ${maximumTreeDepth}, but received ${numericalValues.length}.`);
    return;
  }

  // Sort the input values in ascending order.
  numericalValues.sort((firstVal, secondVal) => firstVal - secondVal);

  // 'processedLevelsData' will accumulate elements from levels as they are processed.
  // It effectively stores the "parent" values for the next comparison stage.
  let processedLevelsData = [];

  // Extract the largest element to serve as the root (Level 0).
  const rootNodeValue = numericalValues.pop();
  processedLevelsData.push(rootNodeValue);

  // Iterate through the tree levels, starting from Level 1 up to the maximum depth.
  for (let currentLevelIndex = 1; currentLevelIndex <= maximumTreeDepth; currentLevelIndex++) {
    // Calculate the number of nodes expected at the current level (2^currentLevelIndex).
    const nodesAtCurrentLevel = 2 ** currentLevelIndex;
    let candidatesForNextLevel = []; // 'check2' from original

    // Populate 'candidatesForNextLevel' by taking the largest remaining elements.
    // These elements are popped from 'numericalValues', so they are added to
    // 'candidatesForNextLevel' in descending order of magnitude.
    for (let elementCounter = 0; elementCounter < nodesAtCurrentLevel; elementCounter++) {
      // Type III: Add a robustness check for unexpected exhaustion of elements.
      if (!numericalValues.length) {
        console.error("DEBUG: Ran out of numerical values prematurely during level population.");
        outputResult("No");
        return;
      }
      candidatesForNextLevel.push(numericalValues.pop());
    }

    // Perform the core comparison:
    // Elements from 'processedLevelsData' (representing previous levels) are compared
    // against 'candidatesForNextLevel' (representing the current level).
    // The comparison is index-by-index. The original logic implies that if
    // 'processedLevelsData' is shorter than 'candidatesForNextLevel', comparisons
    // against 'undefined' elements from 'processedLevelsData' will implicitly fail the `if` condition.
    // This behavior is explicitly maintained.
    for (let valIndex = 0; valIndex < candidatesForNextLevel.length; valIndex++) {
      const parentCandidate = processedLevelsData[valIndex];
      const childCandidate = candidatesForNextLevel[valIndex];

      // Type III: Explicitly check for 'number' type to preserve the original JavaScript
      // behavior where `undefined <= X` evaluates to `false`. This ensures the 'No'
      // condition is only triggered when a valid parent value fails the property.
      if (typeof parentCandidate === 'number' && parentCandidate <= childCandidate) {
        outputResult("No");
        return; // Terminate early if any property violation is found
      }
    }

    // After successful comparison for the current level, append its elements
    // to 'processedLevelsData' for use in subsequent level comparisons.
    // Type III: Use the spread syntax for concatenation.
    processedLevelsData.push(...candidatesForNextLevel);
  }

  // If the program reaches this point, all conditions across all levels were met.
  outputResult("Yes");
}