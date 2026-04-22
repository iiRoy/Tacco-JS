"use strict" // Enforce strict mode for cleaner code practices

// --- Core Input Stream Management ---

/**
 * Creates an object capable of reading input lines sequentially from standard input.
 * This acts as a custom iterator for processing multiple lines of data.
 * @returns {object} An object with methods to check for more elements and retrieve the next one.
 */
const produceStreamReader = () => {
    // Attempt to read all data from the standard input synchronously.
    // Ensure the data is UTF-8 encoded, remove leading/trailing whitespace,
    // and then split into individual lines. An empty input results in ['']
    // so we filter out empty strings to handle truly empty lines or files.
    const dataSourceLines = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }).trim().split("\n").filter(line => line.length > 0);

    // Construct the iterator-like utility object.
    const dataIterator = {
        sourceData: dataSourceLines, // The array of all input lines
        currentPosition: 0,          // Current index in the sourceData array
        totalElements: dataSourceLines.length, // Total number of lines available

        /**
         * Checks if there are more elements (lines) to read in the stream.
         * @returns {boolean} True if more elements exist, false otherwise.
         */
        hasMoreElements: function() {
            return this.currentPosition < this.totalElements;
        },

        /**
         * Retrieves the next element (line) from the stream.
         * Throws an error if no more elements are available.
         * @returns {string} The next line from the input.
         * @throws {Error} If attempting to read beyond the stream's end.
         */
        retrieveNextElement: function() {
            // Guard clause: ensure we don't go out of bounds.
            if (!this.hasMoreElements()) {
                throw new Error("EndOfStreamException: Attempted to read past the last available element.");
            }
            // Return the current element and then increment the position.
            return this.sourceData[this.currentPosition++];
        }
    };
    return dataIterator;
};

// --- Global Input Accessors ---

// Initialize the global stream reader once.
const globalReader = produceStreamReader();

/**
 * Fetches the next line from the input stream.
 * @returns {string} The next input line.
 */
const fetchNextLine = () => globalReader.retrieveNextElement();

/**
 * Parses the next line from the input stream as an integer.
 * Includes validation for non-numeric input.
 * @returns {number} The parsed integer.
 * @throws {Error} If the line content cannot be parsed as a valid integer.
 */
const fetchInteger = () => {
    const lineContent = globalReader.retrieveNextElement();
    // Use Number() for parsing, as it handles various string formats and is explicit.
    const parsedValue = Number(lineContent);
    // Add a basic validation for NaN results.
    if (isNaN(parsedValue)) {
        throw new Error(`InvalidNumberFormatException: Could not parse "${lineContent}" as an integer.`);
    }
    return parsedValue;
};

/**
 * Checks if there are more lines available in the input stream.
 * @returns {boolean} True if more lines exist, false otherwise.
 */
const checkStreamAvailability = () => globalReader.hasMoreElements();

// --- Output Utility ---

/**
 * Displays output to the console. Can take multiple arguments, which are then joined by spaces.
 * @param {...any} outputArgs - Arguments to be logged.
 */
const displayOutput = (...outputArgs) => console.log(...outputArgs);

// --- Main Application Logic ---

/**
 * The primary function that processes the input and computes the result.
 * This function determines the common characters and their minimum frequencies
 * across all input lines, then constructs and prints the final string.
 */
const processInputAndCompute = () => {
    // The original code read an initial integer 'n' but never used it.
    // For a Type III clone, this non-essential statement is removed to simplify the logic.
    // let initialCount = fetchInteger(); // Original equivalent: let n = nextInt()

    // Define the lowercase English alphabet for character-to-index mapping.
    const alphabetString = "abcdefghijklmnopqrstuvwxyz";
    const alphabetSize = alphabetString.length;

    // Initialize an array to store the minimum frequency of each character across all lines.
    // - A value of -1 signifies that a character has not yet been encountered in any line.
    // - A value of 0 signifies that a character was present in some lines but missing in at least one,
    //   hence its overall minimum count is zero, meaning it's not common to all lines.
    // - Any positive number is the current minimum count found so far.
    const minimumCharacterCounts = new Array(alphabetSize).fill(-1);

    // Process each line from the input stream until no more lines are available.
    while (checkStreamAvailability()) {
        const currentLine = fetchNextLine(); // Get the next line of text.

        // Initialize an array to count character frequencies for the current line.
        // All counts start at zero for a new line.
        const lineCharacterFrequencies = new Array(alphabetSize).fill(0);

        // Iterate through each character in the current line to populate its frequency array.
        // This loop uses a traditional index-based iteration.
        for (let charPosition = 0; charPosition < currentLine.length; charPosition++) {
            const charItem = currentLine[charPosition];
            // Determine the index of the character in the alphabet (e.g., 'a' -> 0, 'b' -> 1).
            const charIndex = alphabetString.indexOf(charItem);
            // Only count if the character is a recognized lowercase English letter.
            if (charIndex !== -1) {
                lineCharacterFrequencies[charIndex]++;
            }
        }

        // Update the global minimum character counts based on the current line's frequencies.
        for (let charCodeIdx = 0; charCodeIdx < alphabetSize; charCodeIdx++) {
            const currentLineCount = lineCharacterFrequencies[charCodeIdx];
            let overallMinCount = minimumCharacterCounts[charCodeIdx];

            // Apply logic to refine the minimum character count:
            if (currentLineCount === 0) {
                // If the character is NOT present in the current line, its overall minimum
                // count must be 0, as it's not common to ALL lines.
                minimumCharacterCounts[charCodeIdx] = 0;
            } else if (overallMinCount === -1) {
                // If this is the FIRST time we've encountered this character (overallMinCount is -1),
                // then its current line count becomes its initial minimum.
                minimumCharacterCounts[charCodeIdx] = currentLineCount;
            } else if (overallMinCount > 0) {
                // If the character was present in previous lines (overallMinCount > 0)
                // and also in the current line (currentLineCount > 0),
                // update the overall minimum to the smaller of the two counts.
                minimumCharacterCounts[charCodeIdx] = Math.min(overallMinCount, currentLineCount);
            }
            // Note: If overallMinCount was 0 (meaning already determined not common to all lines),
            // it remains 0 regardless of currentLineCount. This is implicitly handled
            // by the order of conditions and the fact that 0 is the lowest possible min.
        }
    }

    // Construct the final string by appending characters based on their determined minimum frequencies.
    // An array is used as a performant way to build the string piece by piece before a final join.
    let finalResultBuilder = [];

    // Iterate through the alphabet characters.
    for (let charIndex = 0; charIndex < alphabetSize; charIndex++) {
        const charCurrentMin = minimumCharacterCounts[charIndex];
        // Only append characters that have a minimum count greater than 0
        // (meaning they were common to all input lines).
        if (charCurrentMin > 0) {
            const characterToAppend = alphabetString[charIndex];
            // Append the character 'charCurrentMin' times to the builder.
            for (let count = 0; count < charCurrentMin; count++) {
                finalResultBuilder.push(characterToAppend);
            }
        }
    }

    // The original code included `ans.sort()`. This is redundant here because
    // `finalResultBuilder` is populated by iterating through `alphabetString`
    // in alphabetical order. Thus, the characters are already in sorted order.
    // This redundant step is removed as a Type III transformation.
    // finalResultBuilder.sort(); // Removed: Already sorted by construction.

    // Join all parts of the builder array into a single string and display it.
    displayOutput(finalResultBuilder.join(""));
};

// Execute the main processing function to start the application.
processInputAndCompute();