"use strict";

// Helper function to safely parse numbers, returns original string for non-numeric values
const safeParseInt = (val) => {
    // If the value is not a string or is empty, return it as is or handle as an error.
    if (typeof val !== 'string' || val.trim() === '') {
        return val;
    }
    const num = Number(val);
    // Use isNaN to check if the conversion resulted in "Not a Number".
    return isNaN(num) ? val : num;
};

// Factory for creating data stream processors.
// This IIFE returns an object containing the factory function.
const InputProcessorFactory = (function() {
    // A class to manage and process text input line by line, word by word.
    // Encapsulates the state of the input stream.
    class TextDataStream {
        // Constructor initializes the stream with raw string content.
        // It pre-processes the input into an array of lines.
        constructor(rawContent) {
            // Stores all lines of the input content, trimmed and split by newline.
            this._sourceLines = rawContent.trim().split("\n");
            // Pointer indicating the index of the current line being processed.
            this._lineCursor = 0;
            // A temporary cache to hold words of the current line when 'fetchWord' is used.
            this._currentLineWordsCache = [];
            // A flag to track if the current line has already been tokenized into words for `fetchWord`.
            this._isCurrentLineTokenized = false;
        }

        // Extracts a single word (token) from the current line.
        // It processes words from right-to-left of the original line.
        // 'returnAsString' flag determines the return type (string or number).
        fetchWord(returnAsString) {
            // Check if all lines have been consumed.
            if (this._lineCursor >= this._sourceLines.length) {
                // No more data to read.
                return undefined;
            }

            // If the current line's words haven't been prepared, do so now.
            // The original logic splits and reverses the line in place. We replicate this with a cache.
            if (!this._isCurrentLineTokenized) {
                const currentLineContent = this._sourceLines[this._lineCursor];
                // Split the line by spaces and reverse the array to simulate popping from the end
                // which corresponds to reading from the start of the original line.
                this._currentLineWordsCache = currentLineContent ? currentLineContent.split(" ").reverse() : [];
                this._isCurrentLineTokenized = true;
            }

            // Retrieve the next token from the cache.
            const extractedToken = this._currentLineWordsCache.pop();

            // If the cache is now empty, it means all words on the current line have been read.
            // Advance to the next line and reset the tokenization flag.
            if (this._currentLineWordsCache.length === 0) {
                this._lineCursor++;
                this._isCurrentLineTokenized = false;
            }

            // Return the token, converting to number if `returnAsString` is false.
            return returnAsString ? extractedToken : safeParseInt(extractedToken);
        }

        // Reads and returns an entire line from the input stream.
        // The line cursor is advanced after reading.
        // 'asStringArray' flag determines if words are returned as strings or numbers.
        readFullLine(asStringArray) {
            // Ensure there are lines remaining to read.
            if (this._lineCursor >= this._sourceLines.length) {
                return undefined; // Indicate end of stream.
            }

            // Get the current line content and then advance the cursor.
            const lineContent = this._sourceLines[this._lineCursor++];
            // Reset word tokenization state as this method reads a full line at once.
            this._isCurrentLineTokenized = false;
            this._currentLineWordsCache = [];

            // Split the line into individual words.
            const wordsInLine = lineContent.split(" ");

            // Map to numbers if 'asStringArray' is false, otherwise return as strings.
            return asStringArray ? wordsInLine : wordsInLine.map(safeParseInt);
        }

        // Reads a specified number of consecutive lines, returning them as a 2D array (matrix).
        // The line cursor is advanced by 'numRows'.
        // 'keepStrings' flag determines if elements are kept as strings or converted to numbers.
        readMatrix(numRows, keepStrings) {
            // Basic validation for the number of rows to read.
            if (numRows <= 0) {
                return [];
            }

            // Calculate the end index for slicing.
            const endIndex = this._lineCursor + numRows;
            // Extract the relevant slice of lines.
            const rawMatrixLines = this._sourceLines.slice(this._lineCursor, endIndex);
            // Advance the line cursor.
            this._lineCursor = endIndex;
            // Reset word tokenization state.
            this._isCurrentLineTokenized = false;
            this._currentLineWordsCache = [];

            // Process each raw line into an array of words.
            const processedMatrix = rawMatrixLines.map(line => line.split(" "));

            // If 'keepStrings' is false, convert all elements in the matrix to numbers.
            return keepStrings ? processedMatrix : processedMatrix.map(row => row.map(safeParseInt));
        }

        // Reads a specified number of consecutive lines, returning them as a 1D array.
        // The line cursor is advanced by 'count'.
        // 'stringOutput' flag determines if elements are kept as strings or converted to numbers.
        readLines(count, stringOutput) {
            // Basic validation for the number of lines to read.
            if (count <= 0) {
                return [];
            }

            // Calculate the end index for slicing.
            const endIndex = this._lineCursor + count;
            // Extract the relevant slice of lines.
            const rawLines = this._sourceLines.slice(this._lineCursor, endIndex);
            // Advance the line cursor.
            this._lineCursor = endIndex;
            // Reset word tokenization state.
            this._isCurrentLineTokenized = false;
            this._currentLineWordsCache = [];

            // If 'stringOutput' is false, convert all elements in the array to numbers.
            return stringOutput ? rawLines : rawLines.map(safeParseInt);
        }
    }

    // The public factory function exposed by the IIFE.
    // It creates and returns an instance of `TextDataStream`.
    function createInputReader(inputContent) {
        // Basic type check for the input content.
        if (typeof inputContent !== 'string') {
            console.warn("Warning: Input content provided to createInputReader is not a string. Initializing with empty content.");
            return new TextDataStream(""); // Provide an empty stream to prevent runtime errors.
        }
        return new TextDataStream(inputContent);
    }

    // The IIFE returns an object with the factory function.
    return { createInputReader: createInputReader };
})();


// Helper function to abstract away the detail of reading from standard input.
function getStandardInputContent() {
    try {
        // Dynamically require the 'fs' module for file system operations.
        const fileSystemModule = require("fs");
        // Read the entire content of standard input synchronously, decoding it as UTF-8.
        return fileSystemModule.readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        // Log any errors that occur during input reading.
        console.error("Failed to read from /dev/stdin:", error.message);
        return ""; // Return an empty string to allow the program to continue gracefully.
    }
}

// Initialize the input processing system by creating a reader instance.
// This instance will handle all subsequent input operations.
const inputReader = InputProcessorFactory.createInputReader(getStandardInputContent());

// The main function that encapsulates the problem-solving logic.
function executeSolution() {
    // The original code had two consecutive 'var n = o.l();' statements.
    // This implies that the result of the first call to 'o.l()' was effectively discarded
    // as the variable 'n' was immediately reassigned with the result of the second call.
    // We explicitly replicate this behavior by consuming the first line without storing its value.
    inputReader.readFullLine(); // Consume and discard the first line of input.

    // Read the second line from the input stream. This is the line whose data will be used.
    let secondLineData = inputReader.readFullLine();

    // Add a guard clause to handle cases where the input might be malformed or too short.
    // This prevents potential runtime errors if 'secondLineData' is not an array or lacks enough elements.
    if (!Array.isArray(secondLineData) || secondLineData.length < 2) {
        // If the expected data is not available, return 0 as a default/error value.
        // This maintains the original's implicit behavior if `n[1]` is unreachable.
        return 0;
    }

    // Extract the second element (at index 1) from the processed second line.
    // This intermediate variable improves readability.
    const relevantElement = secondLineData[1];

    // Evaluate the condition: if the second element is strictly equal to 1.
    // The original ternary operator has been expanded into an if-else block for clarity.
    if (relevantElement === 1) {
        return 1;
    } else {
        return 0;
    }
}

// Execute the main solution function and print its return value to the console.
console.log(executeSolution());