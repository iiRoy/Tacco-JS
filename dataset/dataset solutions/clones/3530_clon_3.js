const readline = require('readline');
const util = require('util'); // For simplified debugging output

// This section handles input/output operations, acting as a data stream manager.
// It's designed to process lines from standard input and provide them sequentially.
class InputProcessor {
  /**
   * Initializes the input processor.
   * @param {string[]} lineBuffer - An array of raw input strings.
   */
  constructor(lineBuffer) {
    this.streamData = lineBuffer;
    this.currentIndex = 0;
    this.totalItems = lineBuffer.length;
  }

  /**
   * Checks if there are more items available in the input stream.
   * @returns {boolean} True if more items exist, false otherwise.
   */
  hasMoreItems() {
    return this.currentIndex < this.totalItems;
  }

  /**
   * Retrieves the next item from the input stream.
   * Throws an error if no more items are available.
   * @returns {string} The next input string.
   */
  getNextItem() {
    if (!this.hasMoreItems()) {
      throw new Error("InputStreamExhausted: No more data to read.");
    }
    return this.streamData[this.currentIndex++];
  }
}

// Global instances for input processing and collected raw lines
let inputReaderInstance;
const collectedInputLines = [];

// Setup the interface for reading lines from standard input
const consoleIOHandler = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line received
consoleIOHandler.on('line', (lineContent) => {
  collectedInputLines.push(lineContent);
});

// Event listener for when the input stream closes
consoleIOHandler.on('close', () => {
  inputReaderInstance = new InputProcessor(collectedInputLines);
  // Execute the main application logic after all input is collected
  startApplication();
});

// Utility functions for parsing and transforming data
// These functions are simplified and renamed from the original 'myconv'
const DataUtilities = {
  /**
   * Parses a string to an integer.
   * @param {string} val - The string value to parse.
   * @returns {number} The parsed integer.
   */
  parseInteger: (val) => parseInt(val, 10),

  /**
   * Splits a string by spaces.
   * @param {string} val - The string to split.
   * @returns {string[]} An array of strings.
   */
  splitBySpace: (val) => val.split(" "),

  /**
   * Splits a string by spaces and converts elements to numbers.
   * @param {string} val - The string to split and convert.
   * @returns {number[]} An array of numbers.
   */
  parseNumericArray: (val) => val.split(" ").map(Number),

  /**
   * Splits a string into an array of characters.
   * @param {string} val - The string to split.
   * @returns {string[]} An array of characters.
   */
  splitIntoChars: (val) => val.split(""),

  /**
   * Joins an array of elements into a single string without a separator.
   * @param {Array<any>} elements - The array to join.
   * @returns {string} The joined string.
   */
  joinWithoutSeparator: (elements) => elements.join(""),

  /**
   * Joins an array of elements with spaces.
   * @param {Array<any>} elements - The array to join.
   * @returns {string} The joined string.
   */
  joinWithSpaces: (elements) => elements.join(" "),

  /**
   * Joins an array of elements with newlines.
   * @param {Array<any>} elements - The array to join.
   * @returns {string} The joined string.
   */
  joinWithNewlines: (elements) => elements.join("\n"),
};

// Renamed input retrieval functions
const getNextInt = () => DataUtilities.parseInteger(inputReaderInstance.getNextItem());
const getNextStringArray = () => DataUtilities.splitBySpace(inputReaderInstance.getNextItem());
const getNextIntArray = () => DataUtilities.parseNumericArray(inputReaderInstance.getNextItem());
const getNextCharArray = () => DataUtilities.splitIntoChars(inputReaderInstance.getNextItem());
const getNextLine = () => inputReaderInstance.getNextItem();
const hasNextLine = () => inputReaderInstance.hasMoreItems();

// Renamed output and debugging functions
const printFinalResult = (outputMessage) => console.log(outputMessage);
const logDiagnostic = (messageContent) => console.warn(`[DEBUG-INFO]: ${util.inspect(messageContent, { showHidden: false, depth: null, colors: true })}`);


/**
 * Finds which character in the alphabet currently holds the given position in its set.
 * @param {number} position - The index to check.
 * @param {Map<string, Set<number>>} charMap - The map of characters to their position sets.
 * @param {string[]} alphabet - The array of all possible characters.
 * @returns {string | null} The character found at the position, or null if none.
 */
function findCharacterAtPosition(position, charMap, alphabet) {
    for (const charKey of alphabet) {
        if (charMap.get(charKey)?.has(position)) {
            return charKey;
        }
    }
    return null;
}

/**
 * Globally swaps the position sets of two characters in the mapping.
 * @param {string} charA - The first character.
 * @param {string} charB - The second character.
 * @param {Map<string, Set<number>>} charMap - The map of characters to their position sets.
 */
function globallySwapCharacterMappings(charA, charB, charMap) {
    const tempSet = charMap.get(charA);
    charMap.set(charA, charMap.get(charB));
    charMap.set(charB, tempSet);
}


// The primary logic for string transformation
function performStringTransformation() {
    const initialString = getNextLine();
    const desiredString = getNextLine();

    // Guard clause: If string lengths don't match, transformation is impossible.
    if (initialString.length !== desiredString.length) {
        printFinalResult("No");
        return;
    }

    // Using a Map for character-to-position-set mapping for better key handling
    const characterPositionTracker = new Map();
    // Reference list of all lowercase English alphabet characters
    const allLowercaseAlphabet = Array.from("abcdefghijklmnopqrstuvwxyz");

    // Initialize the map: each character starts with an empty set of positions
    for (const char of allLowercaseAlphabet) {
        characterPositionTracker.set(char, new Set());
    }

    // Populate initial positions based on the initial string
    for (let currentIdx = 0; currentIdx < initialString.length; currentIdx++) {
        const charInInitial = initialString[currentIdx];
        characterPositionTracker.get(charInInitial).add(currentIdx);
    }

    // Core transformation loop: iterate through each position in the string
    for (let currentPositionIndex = 0; currentPositionIndex < initialString.length; currentPositionIndex++) {
        // Determine the character that *should* be at this position according to the target string
        const requiredChar = desiredString[currentPositionIndex];

        // Find which character is *currently* mapped to this position
        const actualCharAtPosition = findCharacterAtPosition(currentPositionIndex, characterPositionTracker, allLowercaseAlphabet);

        // If a character is found at this position and it's not the one we need, perform a global swap
        if (actualCharAtPosition && actualCharAtPosition !== requiredChar) {
            globallySwapCharacterMappings(actualCharAtPosition, requiredChar, characterPositionTracker);
        }
    }

    // Reconstruct the output string based on the final character mappings
    const finalCharacterSequence = new Array(initialString.length);
    for (const [charKey, positionsSet] of characterPositionTracker.entries()) {
        // Convert Set to Array for easier iteration
        const indices = Array.from(positionsSet);
        for (const pos of indices) {
            finalCharacterSequence[pos] = charKey;
        }
    }

    const transformedOutputString = DataUtilities.joinWithoutSeparator(finalCharacterSequence);

    // Compare the transformed string with the desired string
    if (transformedOutputString === desiredString) {
        printFinalResult("Yes");
    } else {
        printFinalResult("No");
    }
}

// Main entry point for the application
function startApplication() {
    try {
        // This function encapsulates the main logic for processing the strings
        performStringTransformation();
    } catch (error) {
        logDiagnostic(`An error occurred during application execution: ${error.message}`);
        // Optionally, print a generic error message to the user
        printFinalResult("An internal error prevented processing.");
    }
}