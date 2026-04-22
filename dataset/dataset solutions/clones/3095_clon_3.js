"use strict";

/**
 * A utility class designed to process multi-line string input,
 * allowing for sequential reading of individual tokens or entire lines.
 */
function TextReader(rawInputString, customParsingStrategy) {
    // Basic validation for the input string to ensure robustness.
    if (typeof rawInputString !== 'string') {
        console.error("TextReader Warning: Provided input is not a string. Attempting type coercion.");
        rawInputString = String(rawInputString);
    }

    // Store each line of the input as an element in an array.
    this._inputLines = rawInputString.split("\n");
    // Keep track of the total number of lines for boundary checks.
    this._totalLineCount = this._inputLines.length;

    // Pointers for the current reading position within the input.
    this._currentLineIndex = 0;
    this._currentWordIndex = 0;

    // The function used to parse each token. Defaults to Number if not provided or invalid.
    this._activeParsingStrategy = (typeof customParsingStrategy === 'function') ? customParsingStrategy : Number;

    // console.debug(`TextReader initialized with ${this._totalLineCount} lines.`);
}

/**
 * Reads and returns the next single token (word) from the input stream.
 * It advances the internal pointers accordingly.
 * @returns {any | undefined} The parsed token, or undefined if no more tokens are available.
 */
TextReader.prototype.fetchSingleToken = function() {
    // Ensure we haven't exhausted all input lines.
    if (this._currentLineIndex >= this._totalLineCount) {
        // console.log("End of input stream reached. No more tokens to fetch.");
        return undefined; // Explicitly indicate no more data.
    }

    let lineContent = this._inputLines[this._currentLineIndex];

    // Handle empty or whitespace-only lines by advancing to the next line.
    while (!lineContent || lineContent.trim().length === 0) {
        this._currentLineIndex++;
        this._currentWordIndex = 0; // Reset word index when moving to a new line.

        if (this._currentLineIndex >= this._totalLineCount) {
            // console.log("End of input stream reached after skipping empty lines.");
            return undefined;
        }
        lineContent = this._inputLines[this._currentLineIndex];
    }

    // Split the current line into individual tokens based on whitespace.
    const tokensOnCurrentLine = lineContent.trim().split(" ");

    // Check if the current word index is within the bounds of the tokens on this line.
    if (this._currentWordIndex >= tokensOnCurrentLine.length) {
        // This scenario should ideally be handled by the line advancement logic,
        // but acts as a safeguard. Reset and advance if somehow out of sync.
        this._currentWordIndex = 0;
        this._currentLineIndex++;
        // Recursively call to fetch from the next line, or return undefined if no more lines.
        return this.fetchSingleToken();
    }

    // Retrieve the token and advance the word pointer.
    const tokenToProcess = tokensOnCurrentLine[this._currentWordIndex];
    this._currentWordIndex++;

    // If all tokens on the current line have been read, prepare for the next line.
    if (this._currentWordIndex >= tokensOnCurrentLine.length) {
        this._currentWordIndex = 0; // Reset word index for the next line.
        this._currentLineIndex++;   // Advance to the next line.
    }

    // Apply the configured parsing strategy to the token and return it.
    return this._activeParsingStrategy(tokenToProcess);
};

/**
 * Reads and returns all tokens from the current line as an array,
 * then advances the internal pointer to the next line.
 * @returns {Array<any> | null} An array of parsed tokens from the line, or an empty array for empty lines,
 *                              or null if no more lines are available.
 */
TextReader.prototype.getAllTokensOnLine = function() {
    // Check if there are any lines remaining to be read.
    if (this._currentLineIndex >= this._totalLineCount) {
        // console.log("No more lines to retrieve in full.");
        return null; // Indicate no more lines to process.
    }

    const currentRawLine = this._inputLines[this._currentLineIndex];

    // Reset the word index as this method processes the entire line.
    this._currentWordIndex = 0;
    // Immediately advance the line index as this line is considered 'consumed'.
    this._currentLineIndex++;

    // If the line is empty or contains only whitespace, return an empty array.
    if (!currentRawLine || currentRawLine.trim().length === 0) {
        // console.debug(`Skipping and returning empty array for line ${this._currentLineIndex - 1}.`);
        return [];
    }

    // Split the line into tokens, apply the parsing strategy to each, and return the resulting array.
    const processedTokens = currentRawLine.trim().split(" ").map(this._activeParsingStrategy);
    return processedTokens;
};

// Export the TextReader class for module consumption.
module.exports = TextReader;

/**
 * The primary execution function for this application.
 * It reads the input, performs a DNA nucleotide complement lookup, and displays the result.
 * @param {string} programInputContent - The raw string data provided to the application.
 */
function initiateSequenceProcessing(programInputContent) {
    // Strict mode for this function as well.
    "use strict";

    // Define the immutable mapping for DNA nucleotide complements.
    const nucleotideComplementMap = Object.freeze({
        "A": "T",
        "C": "G",
        "G": "C",
        "T": "A"
    });

    // Instantiate the TextReader to handle the incoming program input.
    // We expect single character inputs, so String is the appropriate parsing strategy.
    const inputDataHandler = new TextReader(programInputContent, String);

    // Fetch the first token from the input stream, which should be our nucleotide.
    const primaryNucleotide = inputDataHandler.fetchSingleToken();

    // Perform robust validation on the retrieved nucleotide.
    if (typeof primaryNucleotide !== 'string' || primaryNucleotide.length !== 1) {
        console.error(`Operation Failed: Expected a single character DNA base (A, C, G, T). Received: '${primaryNucleotide}'.`);
        // Terminate execution if input is malformed.
        return;
    }

    // Convert the input nucleotide to uppercase to handle case-insensitivity.
    const normalizedNucleotide = primaryNucleotide.toUpperCase();

    // Look up the complementary nucleotide using the predefined map.
    const complementaryBase = nucleotideComplementMap[normalizedNucleotide];

    // Output the result or an error message if the base is not recognized.
    if (complementaryBase) {
        console.log(`Input nucleotide: ${primaryNucleotide}. Its DNA complement is: ${complementaryBase}`);
    } else {
        console.warn(`Processing Warning: The nucleotide '${primaryNucleotide}' is not a recognized DNA base (A, C, G, T). No complement found.`);
    }
}

// This block ensures the main processing logic runs only when the script is executed directly.
if (require.main === module) {
    const fileSystemUtils = require("fs"); // Import Node.js File System module.
    const standardInputPath = "/dev/stdin"; // Standard path for input in Unix-like systems.
    let capturedInputBuffer = "";

    try {
        // Synchronously read all content from stdin using UTF-8 encoding.
        capturedInputBuffer = fileSystemUtils.readFileSync(standardInputPath, "utf8");
    } catch (ioError) {
        // Log a critical error if reading from stdin fails.
        console.error(`Runtime Error: Could not read data from standard input (${standardInputPath}). Details: ${ioError.message}`);
        // Exit the process with a failure code.
        process.exit(1);
    }

    // Invoke the main processing function with the trimmed input content.
    // Trimming helps remove any trailing newlines that might interfere with parsing.
    initiateSequenceProcessing(capturedInputBuffer.trim());
}