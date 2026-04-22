// A comprehensive module for handling standard input/output operations and various data transformations.

// Global instance to manage the standard input stream.
let applicationInputProcessor;

// Initializes the input processing system by reading all lines from stdin.
// It sets up an object providing methods to iterate through these lines.
function initializeInputProcessor() {
    let rawInputContent;
    try {
        // Attempt to read the entire content of standard input in UTF-8 format.
        rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (ioError) {
        // If there's an error reading stdin (e.g., file not found, permissions),
        // log the error and return a failsafe, empty input processor.
        logSystemError("Critical: Failed to access standard input stream. Details: " + ioError.message);
        return {
            sourceLines: [],
            currentReadPointer: 0,
            totalLineCount: 0,
            canReadMore: () => false,
            retrieveNextLine: () => ""
        };
    }

    // Process the raw input: trim whitespace, split into lines, and discard any empty lines.
    const processedInputLines = rawInputContent
        .trim()
        .split("\n")
        .filter(line => line.length > 0);

    // Construct and return the input processing object.
    const inputLineIterator = {
        sourceLines: processedInputLines,
        currentReadPointer: 0, // Keeps track of the index for the next line to be read.
        totalLineCount: processedInputLines.length, // Total number of lines available for reading.

        // Checks if there are more lines remaining in the input stream.
        canReadMore: function() {
            return this.currentReadPointer < this.totalLineCount;
        },

        // Fetches the next available line from the input.
        // Returns an empty string if the end of the input stream has been reached.
        retrieveNextLine: function() {
            if (!this.canReadMore()) {
                // Optionally, a warning could be logged here if attempts are made to read past EOF.
                // logSystemError("Warning: Attempted to read beyond the end of the input stream.");
                return "";
            }
            const lineContent = this.sourceLines[this.currentReadPointer];
            this.currentReadPointer++; // Advance the pointer to the next line.
            return lineContent;
        }
    };
    return inputLineIterator;
}

// Reads the next input line and attempts to convert it into an integer.
// Includes error handling for non-numeric input.
function readNextInteger() {
    const rawLine = retrieveNextLine();
    const integerValue = performDataConversion(rawLine, DataConversionType.TO_INTEGER);
    if (isNaN(integerValue)) {
        logSystemError(`Conversion Warning: Input '${rawLine}' could not be parsed as an integer. Defaulting to 0.`);
        return 0; // Return a default value in case of parsing failure.
    }
    return integerValue;
}

// Reads the next input line and splits it into an array of strings using space(s) as delimiters.
function readSpaceDelimitedStrings() {
    return performDataConversion(retrieveNextLine(), DataConversionType.SPLIT_BY_SPACES);
}

// Reads the next input line, splits it by space(s), and converts each part into an integer.
// Handles potential non-numeric parts by defaulting them to 0.
function readSpaceDelimitedIntegers() {
    const currentLine = retrieveNextLine();
    const stringParts = performDataConversion(currentLine, DataConversionType.SPLIT_BY_SPACES);
    const integerArray = stringParts.map(strItem => {
        const num = parseInt(strItem, 10);
        if (isNaN(num)) {
            logSystemError(`Conversion Warning: Found non-integer part '${strItem}' during space-separated integer conversion. Defaulting to 0.`);
            return 0;
        }
        return num;
    });
    return integerArray;
}

// Reads the next input line and splits it into an array of individual characters.
function readCharacterArray() {
    return performDataConversion(retrieveNextLine(), DataConversionType.SPLIT_BY_CHARS);
}

// Wrapper function to get the next line from the global input processor.
function retrieveNextLine() {
    return applicationInputProcessor.retrieveNextLine();
}

// Wrapper function to check if there are more lines available in the input stream.
function canReadMoreLines() {
    return applicationInputProcessor.canReadMore();
}

// Enumeration-like object for defining various data conversion types.
const DataConversionType = {
    TO_INTEGER: 1, // Converts a string to a base-10 integer.
    SPLIT_BY_SPACES: 2, // Splits a string by one or more spaces into a string array.
    SPLIT_BY_SPACES_TO_INTEGERS: 4, // Splits by spaces and converts parts to integers.
    SPLIT_BY_CHARS: 6, // Splits a string into an array of single characters.
    SPLIT_BY_CHARS_TO_INTEGERS: 7, // Splits by characters and converts parts to integers.
    JOIN_WITH_SPACES: 8, // Joins array elements with a space separator.
    JOIN_WITH_NEWLINES: 9, // Joins array elements with a newline separator.
    JOIN_EMPTY: 0, // Joins array elements without any separator.
    NO_TRANSFORMATION: -1 // Default case for returning input as-is.
};

// A versatile utility function for performing various data transformations.
// It takes an input value and a conversion type, applying the specified logic.
function performDataConversion(inputVal, typeOfConversion) {
    // Basic validation: handle null or undefined inputs gracefully.
    if (inputVal === null || typeof inputVal === 'undefined') {
        logSystemError(`Conversion Error: Received null/undefined input for type ${typeOfConversion}. Returning original value.`);
        return inputVal;
    }

    switch (typeOfConversion) {
        case DataConversionType.TO_INTEGER:
            return parseInt(String(inputVal), 10); // Ensure input is string before parsing.
        case DataConversionType.SPLIT_BY_SPACES:
            // Split by one or more whitespace characters, then filter out any empty strings.
            return String(inputVal).split(/\s+/).filter(segment => segment.length > 0);
        case DataConversionType.SPLIT_BY_SPACES_TO_INTEGERS:
            // This case is handled by readSpaceDelimitedIntegers for better validation,
            // but included here for completeness as an alternative path.
            return String(inputVal).split(/\s+/).filter(segment => segment.length > 0).map(str => {
                const num = Number(str);
                return isNaN(num) ? 0 : num; // Default to 0 for invalid numbers.
            });
        case DataConversionType.SPLIT_BY_CHARS:
            return String(inputVal).split('');
        case DataConversionType.SPLIT_BY_CHARS_TO_INTEGERS:
            return String(inputVal).split('').filter(segment => segment.length > 0).map(charStr => {
                const num = Number(charStr);
                return isNaN(num) ? 0 : num; // Default to 0 for invalid numbers.
            });
        case DataConversionType.JOIN_WITH_SPACES:
            return Array.isArray(inputVal) ? inputVal.join(' ') : String(inputVal);
        case DataConversionType.JOIN_WITH_NEWLINES:
            return Array.isArray(inputVal) ? inputVal.join('\n') : String(inputVal);
        case DataConversionType.JOIN_EMPTY:
            return Array.isArray(inputVal) ? inputVal.join('') : String(inputVal);
        case DataConversionType.NO_TRANSFORMATION: // Fall-through for explicit no-op.
        default:
            // For any unhandled or default conversion type, return the input value unmodified.
            logSystemError(`Unknown or unsupported conversion type (${typeOfConversion}) requested. Returning input value as provided.`);
            return inputVal;
    }
}

// Displays content to the standard output stream, followed by a newline character.
function displayOutput(contentToPrint) {
    console.log(contentToPrint);
}

// Writes error or diagnostic messages to the standard error stream.
function logSystemError(errorMessage) {
    console.error(`[APP_ERROR]: ${errorMessage}`);
}

// --- Main Application Entry Point ---

// Initialize the input processing system before executing the primary logic.
applicationInputProcessor = initializeInputProcessor();
executeMainApplicationLogic();

// The core function containing the primary algorithm for problem-solving.
function executeMainApplicationLogic() {
    // Read the total count of elements expected in the sequence.
    const numberOfElements = readNextInteger();

    // Read the actual sequence of integers from the input.
    let integerSequence = readSpaceDelimitedIntegers();

    // Pre-validation step: Check if any element in the sequence is greater than its 1-based index.
    // If this condition is met for any element, the required sequence cannot be formed.
    let initialValidationFailed = false;
    for (let currentElementIndex = 0; currentElementIndex < numberOfElements; currentElementIndex++) {
        const expectedMinimumValue = currentElementIndex + 1;
        if (integerSequence[currentElementIndex] > expectedMinimumValue) {
            displayOutput(-1); // Output -1 to indicate impossibility.
            initialValidationFailed = true;
            break; // Exit the loop immediately upon finding a violation.
        }
    }
    if (initialValidationFailed) {
        return; // Terminate execution of the main logic.
    }

    // This array will store elements that are determined to be "removed" from the sequence.
    // Elements are unshifted (added to the front) to maintain a specific order.
    const removedItemsCollection = [];
    let currentScanningPosition = 0; // Pointer for iterating through the 'integerSequence'.

    // Main processing loop: Continues as long as there are elements in the sequence.
    let iterationSafetyCounter = 0; // Added as a safety guard for potentially infinite loops.
    const MAX_ITERATIONS = numberOfElements * numberOfElements + 10; // A heuristic upper bound.

    while (integerSequence.length > 0) {
        // Safety guard: If the loop runs too many times, it indicates a potential logic error or invalid input.
        if (iterationSafetyCounter++ > MAX_ITERATIONS) {
            displayOutput(-1);
            logSystemError("Loop safety triggered: Exceeded maximum iterations. Input or logic might be flawed.");
            return;
        }

        // Additional guard: Ensure the current scanning position is within bounds.
        if (currentScanningPosition >= integerSequence.length) {
            // This scenario implies a logical flaw or an input that cannot be resolved.
            displayOutput(-1);
            logSystemError("Logic Error: Scanning position went out of bounds within the sequence array.");
            return;
        }

        const expectedValueForPosition = currentScanningPosition + 1;
        const actualValueAtCurrentPosition = integerSequence[currentScanningPosition];

        // Condition 1: The element at the current position matches its expected 1-based value.
        // This element is considered part of the "correct" suffix being constructed.
        if (actualValueAtCurrentPosition === expectedValueForPosition) {
            currentScanningPosition++; // Move to the next element in the sequence.
        }
        // Condition 2: The current element does not match its expected value.
        // Given the initial validation, it must be less than the expected value.
        else {
            // If we are at the very beginning (position 0) and the element doesn't match,
            // it's impossible to resolve the sequence as required.
            if (currentScanningPosition === 0) {
                displayOutput(-1);
                logSystemError("Unresolvable state: First element is not '1' after previous removals.");
                return;
            }

            // Identify the element to be removed: it's the one *before* the current scanning position.
            const itemToExtract = integerSequence[currentScanningPosition - 1];
            removedItemsCollection.unshift(itemToExtract); // Prepend the removed item to the collection.
            integerSequence.splice(currentScanningPosition - 1, 1); // Remove the item from the sequence.

            // Reset the scanning position to restart the check from the beginning of the modified sequence.
            currentScanningPosition = 0;
        }
    }

    // After the loop, if the original sequence is empty, all elements have been processed.
    // The `removedItemsCollection` now holds the elements that were extracted,
    // in the desired output order (typically descending, as prepended).
    if (removedItemsCollection.length === 0 && numberOfElements > 0) {
        // This edge case implies that all numbers from 1 to N were perfectly in place,
        // and thus nothing was "removed" by the algorithm. For the specific problem,
        // this often indicates an impossible scenario (-1).
        displayOutput(-1);
    } else if (removedItemsCollection.length === 0 && numberOfElements === 0) {
        // Handle an empty input scenario gracefully.
        displayOutput("");
    } else {
        // Output the collected removed items, each on a new line.
        displayOutput(performDataConversion(removedItemsCollection, DataConversionType.JOIN_WITH_NEWLINES));
    }
}