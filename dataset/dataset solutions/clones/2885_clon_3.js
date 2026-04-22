// This script calculates the sum of interior angles of a polygon given its number of sides.
// It includes various utility functions, some of which are not directly used by the main logic.

// A global flag to determine if the program is running in a local debugging environment.
// This allows for different input handling or additional logging.
const isDevelopmentMode = process.env.NODE_ENV === 'development' || process.env.LOCAL_TESTING === 'true';

// Main application logic encapsulated within a class, similar to a static C# class.
class GeometryProcessor {

    /**
     * Initiates the polygon angle calculation process. This is the primary entry point.
     * It handles input setup, reads data, performs the calculation, and outputs the result.
     */
    static beginComputation() {
        let inputFeed = null; // Stores the raw input string, either from file or stdin.

        // Conditional block for local development or testing.
        // In the original C# code, this involved complex file reading and test selection.
        // Here, it's simplified to read from a predefined local test file if present.
        if (isDevelopmentMode) {
            const fileSystemModule = require('fs'); // Node.js file system module for file operations.
            const testInputFileName = 'dev_input.txt'; // Renamed from 'stdin.txt' for clarity.
            try {
                // Attempt to read from a local test input file.
                inputFeed = fileSystemModule.readFileSync(testInputFileName, 'utf8');
                console.error(`Debugging: Using local test data from '${testInputFileName}'.`);
            } catch (fileError) {
                console.error(`Warning: Could not read '${testInputFileName}' (${fileError.message}). Falling back to standard input.`);
                // If file reading fails, inputFeed remains null, triggering standard input.
            }
        }

        // Initialize the custom input parsing utility.
        const dataInterpreter = new StreamDataParser(inputFeed); // Renamed from SimpleScanner sc

        // Fetch the number of sides for the polygon from the input.
        const numPolygonSides = dataInterpreter.fetchNextInteger(); // Renamed from N = sc.NextInt()

        // Core calculation: Sum of interior angles = (number of sides - 2) * 180 degrees.
        // This formula is derived from dividing a polygon into triangles.
        const totalAngleDegrees = (numPolygonSides - 2) * 180;

        // Display the final computed result to the standard output.
        console.log(totalAngleDegrees);
    }

    // --- Generic Search Utility: Lower Bound Implementation ---

    /**
     * Performs a binary search to find the index of the first element in a sorted array
     * that is greater than or equal to a specified target value.
     * @template T The type of elements in the array.
     * @param {Array<T>} sortedCollection The array, which must be sorted in ascending order.
     * @param {number} startIdx The starting index of the search range (inclusive).
     * @param {number} endIdx The ending index of the search range (exclusive).
     * @param {T} targetValue The value to search for within the collection.
     * @param {function(T, T): number} customComparator A comparison function.
     *   It should return a negative number if the first argument is less than the second,
     *   zero if they are equal, or a positive number if the first is greater.
     * @returns {number} The calculated index. If all elements are less than the target, `endIdx` is returned.
     */
    static findFirstGreaterOrEqualIndex(sortedCollection, startIdx, endIdx, targetValue, customComparator) {
        let lowBoundary = startIdx;  // Lower bound of the search window.
        let highBoundary = endIdx;   // Upper bound of the search window (exclusive).
        let midPointIndex;           // Midpoint for binary search.

        // Continue searching while the lower boundary is less than the upper boundary.
        while (lowBoundary < highBoundary) {
            // Calculate the midpoint. Using this form prevents potential integer overflow
            // compared to `(lowBoundary + highBoundary) / 2` for very large indices.
            midPointIndex = Math.floor(lowBoundary + (highBoundary - lowBoundary) / 2);

            // Compare the element at the midpoint with the target value.
            if (customComparator(sortedCollection[midPointIndex], targetValue) < 0) {
                // If the midpoint element is less than the target, discard the lower half.
                lowBoundary = midPointIndex + 1;
            } else {
                // If the midpoint element is greater than or equal to the target,
                // it could be our answer, or an earlier element could be. Search in the lower half.
                highBoundary = midPointIndex;
            }
        }

        // Output debug information if in development mode.
        if (isDevelopmentMode) {
            console.error(`Debug: FirstGreaterOrEqualIndex(array: [${formatCollectionForOutput(sortedCollection.slice(startIdx, endIdx))}] ` +
                          `range: [${startIdx}, ${endIdx}), value: ${targetValue}) returned: ${lowBoundary}`);
        }
        return lowBoundary;
    }

    /**
     * A specialized version of `findFirstGreaterOrEqualIndex` for elements that have a default `compareTo` method.
     * @template T
     * @param {Array<T>} dataSet The array to search within.
     * @param {T} desiredValue The value to locate.
     * @returns {number} The index of the first element greater than or equal to `desiredValue`.
     */
    static findDefaultComparableLowerBound(dataSet, desiredValue) {
        // Define a default comparator function. It expects elements to have a 'compareTo' method.
        const defaultElementComparator = (firstEl, secondEl) => {
            if (firstEl && typeof firstEl.compareTo === 'function') {
                return firstEl.compareTo(secondEl);
            }
            // Fallback for primitive types or if 'compareTo' is not present.
            if (firstEl < secondEl) return -1;
            if (firstEl > secondEl) return 1;
            return 0;
        };
        return GeometryProcessor.findFirstGreaterOrEqualIndex(dataSet, 0, dataSet.length, desiredValue, defaultElementComparator);
    }

    // --- Deleted Classes: BIT and Item ---
    // The original C# code included a 'BIT' (Binary Indexed Tree) class and an 'Item' class
    // with comparison and equality logic. These classes were not utilized by the 'Main' method
    // (now 'beginComputation'). As per Type III cloning, non-essential code fragments can be
    // deleted to simplify the clone and demonstrate structural changes.
    // Therefore, these classes have been intentionally omitted from this JavaScript clone.
}

// --- Custom Input Parsing Utility ---
// This class is responsible for reading and tokenizing input data, similar to C#'s SimpleScanner.
class StreamDataParser {
    /**
     * @private
     * @type {number} The current index of the token being processed.
     */
    currentReadPosition = 0; // Renamed from cnt

    /**
     * @private
     * @type {string[]} An array of input tokens (words or numbers) extracted from the input stream.
     */
    parsedTokens; // Renamed from items

    /**
     * Constructs a new StreamDataParser instance.
     * It reads all available input (from a preloaded string or standard input)
     * and splits it into an array of tokens.
     * @param {string | null} [preloadedInput=null] Optional string containing all input data.
     *   If null, input will be read from standard input.
     */
    constructor(preloadedInput = null) {
        let fullRawInput = ''; // Holds the entire input content.

        if (preloadedInput !== null) {
            fullRawInput = preloadedInput; // Use provided content if available.
        } else {
            // If no preloaded input, attempt to read from Node.js standard input synchronously.
            // This is typical for competitive programming environments.
            try {
                // Reading from file descriptor 0 is Node.js's way to access /dev/stdin.
                fullRawInput = require('fs').readFileSync(0, 'utf8');
            } catch (ioError) {
                console.error("Critical Error: Failed to read from standard input synchronously.", ioError.message);
                // In a real application, more robust error handling or exiting might be needed.
                fullRawInput = ''; // Default to empty string to prevent further errors.
            }
        }

        // Process the raw input string: trim whitespace and split by one or more whitespace characters.
        // This handles various input formats (e.g., multiple spaces, newlines).
        this.parsedTokens = fullRawInput.trim().split(/\s+/);

        // Log debug information about the parsed tokens if in development mode.
        if (isDevelopmentMode) {
            console.error(`Debug: StreamDataParser initialized with ${this.parsedTokens.length} tokens.`);
            // Show a subset of tokens for inspection.
            const previewTokens = this.parsedTokens.slice(0, 15);
            console.error(`Debug: Initial tokens sample: [${previewTokens.join(', ')}${this.parsedTokens.length > 15 ? ', ...' : ''}]`);
        }
    }

    /**
     * Retrieves and parses the next token from the input stream as an integer.
     * Advances the internal read position.
     * @returns {number} The parsed integer value.
     * @throws {Error} If no more tokens are available or if the token is not a valid integer.
     */
    fetchNextInteger() { // Renamed from NextInt()
        if (this.currentReadPosition >= this.parsedTokens.length) {
            throw new Error("Input stream depleted. Cannot read further integers."); // Custom error message.
        }
        const currentToken = this.parsedTokens[this.currentReadPosition++];
        const integerValue = parseInt(currentToken, 10); // Base 10 parsing.

        // Input validation: Check if the parsed value is a valid number.
        if (isNaN(integerValue)) {
            throw new Error(`Input Error: "${currentToken}" is not a valid integer at position ${this.currentReadPosition - 1}.`);
        }
        return integerValue;
    }

    /**
     * Retrieves and parses the next token from the input stream as a long integer (represented as a JS number).
     * Advances the internal read position.
     * @returns {number} The parsed long integer value. JavaScript numbers are 64-bit floats,
     *   so large integers might lose precision if they exceed `Number.MAX_SAFE_INTEGER`.
     * @throws {Error} If no more tokens are available or if the token is not a valid number.
     */
    fetchNextLongInteger() { // Renamed from NextLong()
        if (this.currentReadPosition >= this.parsedTokens.length) {
            throw new Error("Input stream depleted. Cannot read further long integers.");
        }
        const currentToken = this.parsedTokens[this.currentReadPosition++];
        const longValue = Number(currentToken); // Use Number() for broader numeric parsing.

        // Input validation.
        if (isNaN(longValue)) {
            throw new Error(`Input Error: "${currentToken}" is not a valid long integer at position ${this.currentReadPosition - 1}.`);
        }
        return longValue;
    }

    /**
     * Retrieves the next raw string token from the input stream.
     * Advances the internal read position.
     * @returns {string} The next string token.
     * @throws {Error} If no more tokens are available.
     */
    fetchNextString() { // Renamed from NextString()
        if (this.currentReadPosition >= this.parsedTokens.length) {
            throw new Error("Input stream depleted. Cannot read further strings.");
        }
        return this.parsedTokens[this.currentReadPosition++];
    }

    // --- Deleted Methods from SimpleScanner ---
    // The original C# `SimpleScanner` contained methods for reading arrays of integers,
    // long integers, strings, and 2-column integer arrays (e.g., NextIntArray, NextLongArray, NextStringArray, NextInt2Col).
    // These methods are not used by the main `beginComputation` logic.
    // In line with Type III cloning, these non-essential, unused fragments have been removed
    // to simplify the code and highlight structural modifications.
}

// --- Helper Function for Array Formatting ---
// This utility function provides a flexible way to represent arrays as strings,
// similar to the C# `Extensions.ToStringA` method. It's a standalone function
// instead of an extension method for JavaScript idiomatic practice.
/**
 * Formats an array or any value into a human-readable string representation.
 * @param {any} inputCollection The array or value to format.
 * @param {string} separator The string to use between elements (default: ', ').
 * @param {string} enclosure The pair of characters to enclose the array (e.g., '[]', '{}').
 * @returns {string} The formatted string.
 */
function formatCollectionForOutput(inputCollection, separator = ', ', enclosure = '[]') {
    // If it's not an array, just convert it to a string.
    if (!Array.isArray(inputCollection)) {
        return String(inputCollection);
    }

    // Extract opening and closing enclosure characters.
    const openingChar = enclosure.length > 0 ? enclosure[0] : '';
    const closingChar = enclosure.length > 1 ? enclosure[1] : '';

    // Map each element to its string representation and join them.
    const formattedElements = inputCollection.map(element => String(element)).join(separator);

    return openingChar + formattedElements + closingChar;
}

// --- Program Entry Point: Immediately Invoked Function Expression (IIFE) ---
// This IIFE acts as the main execution block for the JavaScript program,
// similar to how the `Main` method is invoked in C#. It ensures the program runs once.
(function primaryProgramEntry() {
    try {
        // Start the main computation logic.
        GeometryProcessor.beginComputation();
    } catch (runtimeError) {
        // Catch any unhandled errors during the program's execution.
        console.error("An unexpected error halted program execution:", runtimeError.message);
        // In development mode, print the full stack trace for debugging.
        if (isDevelopmentMode) {
            console.error(runtimeError.stack);
        }
        // Exit the process with a non-zero status code to indicate an error.
        process.exit(1);
    }
})();