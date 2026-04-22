"use strict"; // Enforcing strict mode for cleaner code practices

/**
 * Custom error class for handling out-of-bounds input stream access.
 * This is an added code fragment (Type III).
 */
class InputStreamBoundaryError extends Error {
    constructor(message) {
        super(message);
        this.name = "InputStreamBoundaryError";
    }
}

/**
 * Constants representing various verdict statuses.
 * These are added helper variables (Type III).
 */
const VERDICT_ACCEPTED = "AC";
const VERDICT_WRONG_ANSWER = "WA";
const VERDICT_TIME_LIMIT_EXCEEDED = "TLE";
const VERDICT_RUNTIME_ERROR = "RE";

/**
 * Initializes and returns an object capable of reading input lines
 * from standard input. It parses the entire input stream at once.
 * This function's structure and variable names are heavily modified (Type II & III).
 * @returns {object} An input stream handler object.
 */
const initializeInputHandler = () => {
    // Breaking down the input reading process into intermediate steps (Type III).
    const fileSystemModule = require("fs"); // Helper variable for fs module
    const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", { encoding: "utf8" }); // Using options object
    const cleanedInputContent = rawInputContent.trim(); // Trim whitespace
    const inputLinesBuffer = cleanedInputContent.split("\n"); // Split into an array of lines

    // The reader state object with renamed properties and methods (Type II).
    const streamReaderState = {
        lineStorage: inputLinesBuffer, // Renamed 'list'
        currentPosition: 0,            // Renamed 'index'
        totalLineCount: inputLinesBuffer.length, // Renamed 'max'

        /**
         * Checks if there are more lines available to read in the buffer.
         * Logic rewritten for clarity (Type III).
         * @returns {boolean} True if more lines are available, false otherwise.
         */
        hasMoreLines: function() {
            return this.totalLineCount - this.currentPosition > 0;
        },

        /**
         * Retrieves the next line from the input buffer and advances the pointer.
         * Logic rewritten, intermediate variable added, and custom error thrown (Type III).
         * @returns {string} The next line of input.
         * @throws {InputStreamBoundaryError} If an attempt is made to read beyond the buffer's end.
         */
        fetchNextLine: function() {
            // Guard clause for boundary check (Type III).
            if (!this.hasMoreLines()) {
                throw new InputStreamBoundaryError("Attempted to access input stream beyond its boundaries.");
            }
            const fetchedLine = this.lineStorage[this.currentPosition]; // Intermediate step
            this.currentPosition++; // Advance the pointer
            return fetchedLine;
        }
    };
    return streamReaderState;
};

// Global instance of the input reader (renamed from 'o')
const globalInputStream = initializeInputHandler();

/**
 * Helper function to read the next line as a string.
 * Renamed from 'next' (Type II).
 * @returns {string} The next input line.
 */
const readNextStringLine = () => globalInputStream.fetchNextLine();

/**
 * Helper function to read the next line and parse it as an integer.
 * Renamed from 'nextInt', added radix and validation (Type III).
 * @returns {number} The parsed integer.
 * @throws {Error} If the parsed value is not a valid integer.
 */
const readNextInteger = () => {
    const rawValue = globalInputStream.fetchNextLine();
    const numericValue = parseInt(rawValue, 10); // Added radix for safety
    // Validation check (Type III).
    if (isNaN(numericValue)) {
        throw new Error(`Input format error: "${rawValue}" is not a valid integer.`);
    }
    return numericValue;
};

/**
 * Helper function to read the next line and split it into a string array.
 * Renamed from 'nextStrArray' (Type II).
 * @returns {string[]} An array of strings.
 */
const readStringArrayFromLine = () => globalInputStream.fetchNextLine().split(" ");

/**
 * Helper function to read the next line, split it, and parse elements into an integer array.
 * Renamed from 'nextIntArray', added radix and validation (Type III).
 * @returns {number[]} An array of integers.
 * @throws {Error} If any element cannot be parsed as a valid integer.
 */
const readIntegerArrayFromLine = () => {
    return globalInputStream.fetchNextLine().split(" ").map(elementStr => {
        const parsedElement = parseInt(elementStr, 10); // Added radix
        // Validation check for each element (Type III).
        if (isNaN(parsedElement)) {
            throw new Error(`Input format error: "${elementStr}" in array is not a valid integer.`);
        }
        return parsedElement;
    });
};

/**
 * Helper function to read the next line and split it into a character array.
 * Renamed from 'nextCharArray' (Type II).
 * @returns {string[]} An array of characters.
 */
const readCharacterArrayFromLine = () => globalInputStream.fetchNextLine().split("");

/**
 * Helper function to check if more input is available.
 * Renamed from 'hasNext' (Type II).
 * @returns {boolean} True if more input lines exist, false otherwise.
 */
const isInputAvailable = () => globalInputStream.hasMoreLines();

/**
 * A generalized logging utility.
 * Renamed from 'myout' (Type II).
 * @param {...any} data - Data to log to the console.
 */
const outputToConsole = (...data) => console.log(...data);

/**
 * The primary execution logic of the program.
 * Renamed from 'Main', variable names changed, structure modified (Type II & III).
 */
const executeProgramLogic = () => {
    // The variable 'n' was read but unused in the original. It has been deleted (Type III).
    // let initialInputCount = readNextInteger(); // Removed as it was unused.

    // Renamed counters for clarity (Type II).
    let acceptedCount = 0;
    let wrongAnswerCount = 0;
    let timeLimitExceededCount = 0;
    let runtimeErrorCount = 0;

    // Loop condition uses renamed helper (Type II).
    while (isInputAvailable()) {
        const currentVerdictString = readNextStringLine(); // Renamed temporary variable (Type II)

        // Replaced if-else if chain with a switch statement (Type III).
        switch (currentVerdictString) {
            case VERDICT_ACCEPTED:
                acceptedCount++;
                break;
            case VERDICT_WRONG_ANSWER:
                wrongAnswerCount++;
                break;
            case VERDICT_TIME_LIMIT_EXCEEDED:
                timeLimitExceededCount++;
                break;
            case VERDICT_RUNTIME_ERROR:
                runtimeErrorCount++;
                break;
            default:
                // Added a guard clause/validation for unexpected input (Type III).
                console.warn(`[WARNING] An unknown verdict "${currentVerdictString}" was encountered and ignored.`);
                break;
        }
    }

    // Output statements using renamed helper and variables (Type II).
    outputToConsole(`AC x ${acceptedCount}`);
    outputToConsole(`WA x ${wrongAnswerCount}`);
    outputToConsole(`TLE x ${timeLimitExceededCount}`);
    outputToConsole(`RE x ${runtimeErrorCount}`);
};

// Initiate the program's execution (renamed function call).
executeProgramLogic();