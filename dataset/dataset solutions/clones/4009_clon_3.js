let dataFeeder = initializeInputProcessor();
processMainApplication();

// Fetches the next line from input and attempts to parse it as an integer.
function getNextInteger() {
    const rawValue = advanceAndRetrieveLine();
    if (rawValue === undefined || rawValue === null) {
        reportError("Attempted to read integer from empty input stream.");
        return NaN; // Indicate failure to parse
    }
    return performDataConversion(rawValue, 1);
}

// Fetches the next line from input and splits it into an array of strings using whitespace.
function retrieveStringArray() {
    const rawLine = advanceAndRetrieveLine();
    if (rawLine === undefined || rawLine === null) {
        return []; // Return an empty array if no input
    }
    return performDataConversion(rawLine, 2);
}

// Fetches the next line from input, splits it by whitespace, and converts parts to numbers.
function retrieveNumericArray() {
    const rawLine = advanceAndRetrieveLine();
    if (rawLine === undefined || rawLine === null) {
        return []; // Return an empty array if no input
    }
    return performDataConversion(rawLine, 4);
}

// Fetches the next line from input and splits it into an array of individual characters.
function retrieveCharacterArray() {
    const rawLine = advanceAndRetrieveLine();
    if (rawLine === undefined || rawLine === null) {
        return []; // Return an empty array if no input
    }
    return performDataConversion(rawLine, 6);
}

// Advances the input pointer and returns the next available line from the data feeder.
function advanceAndRetrieveLine() {
    return dataFeeder.getNextLine();
}

// Checks if there are more lines available in the input stream managed by the data feeder.
function hasMoreLinesAvailable() {
    return dataFeeder.canAdvance();
}

// Reads all input from standard input (/dev/stdin) and returns it as an array of trimmed lines.
function readAllStandardInput() {
    try {
        // Using Node.js 'fs' module to read from /dev/stdin
        // The input is expected to be UTF-8 encoded, trimmed of leading/trailing
        // whitespace, and then split into an array where each element is a line.
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        return fileContent.trim().split("\n");
    } catch (errorReading) {
        reportError(`Failed to read input from /dev/stdin: ${errorReading.message}`);
        // In case of an error, return an empty array to prevent further processing issues.
        return [];
    }
}

// Initializes an object responsible for managing input lines, providing methods
// to check for availability, retrieve lines, and reset the processor.
function initializeInputProcessor() {
    const rawInputLines = readAllStandardInput();
    
    // Guard clause: If no input lines are detected, create a dummy processor.
    if (!rawInputLines || rawInputLines.length === 0) {
        reportError("No input lines detected. Initializing with an empty input processor.");
        return {
            sourceLines: [],
            currentLineIdx: 0,
            totalLinesCount: 0,
            canAdvance: () => false,
            getNextLine: () => undefined,
            resetProcessor: () => reportError("Cannot reset an empty input processor.")
        };
    }

    let lineProcessor = {
        sourceLines: rawInputLines,
        currentLineIdx: 0,
        totalLinesCount: rawInputLines.length,

        // Determines if there are more lines available to be processed.
        canAdvance: function() {
            return this.currentLineIdx < this.totalLinesCount;
        },

        // Retrieves the next line from the input stream and increments the internal pointer.
        // Returns `undefined` if no more lines are available, logging an error.
        getNextLine: function() {
            if (!this.canAdvance()) {
                reportError("Attempted to read beyond the end of the input stream.");
                return undefined;
            }
            const currentLine = this.sourceLines[this.currentLineIdx];
            this.currentLineIdx++;
            return currentLine;
        },

        // New feature: Resets the input processor's pointer to the beginning of the input.
        resetProcessor: function() {
            this.currentLineIdx = 0;
            displayResult("Input processor has been successfully reset to the initial line.");
        }
    };
    return lineProcessor;
}

// Displays the provided data to the standard output stream.
function displayResult(outputData) {
    console.log(outputData);
}

// Reports an error message to the standard error output stream, prefixed for clarity.
function reportError(errorMessage) {
    console.error(`APPLICATION_ERROR: ${errorMessage}`);
}

// Comprehensive utility for various data type conversions and manipulations.
// It handles different modes based on the requested conversion type.
function performDataConversion(inputValue, conversionType) {
    // Guard clause: Check for null or undefined input values early.
    if (inputValue === null || inputValue === undefined) {
        reportError("Attempted data conversion on a null or undefined input value.");
        return null; // Return null to indicate conversion failure
    }

    try {
        const whitespaceSplitter = /\s+/; // Regular expression for splitting by one or more spaces.

        switch (conversionType) {
            case 1: // Convert the input value to an integer, using base 10.
                return Number.parseInt(String(inputValue), 10);
            case 2: // Split a string by whitespace into an array of strings.
                if (typeof inputValue !== 'string') {
                    reportError("Input for string array split must be a string.");
                    return [];
                }
                return inputValue.split(whitespaceSplitter);
            case 4: // Split a string by whitespace, then convert each segment to a number.
                if (typeof inputValue !== 'string') {
                    reportError("Input for numeric array split must be a string.");
                    return [];
                }
                // Filter out any empty strings that might result from multiple spaces.
                return inputValue.split(whitespaceSplitter).filter(Boolean).map(segment => Number(segment));
            case 6: // Split a string into an array of individual characters.
                if (typeof inputValue !== 'string') {
                    reportError("Input for character array split must be a string.");
                    return [];
                }
                return Array.from(inputValue); // A modern way to convert string to char array.
            case 7: // Split a string into a character array, then convert each character to a number.
                if (typeof inputValue !== 'string') {
                    reportError("Input for numeric character array split must be a string.");
                    return [];
                }
                return Array.from(inputValue).map(char => Number(char));
            case 8: // Join elements of an array with a single space.
                if (!Array.isArray(inputValue)) {
                    reportError("Input for joining with space must be an array.");
                    return '';
                }
                return inputValue.join(" ");
            case 9: // Join elements of an array with a newline character.
                if (!Array.isArray(inputValue)) {
                    reportError("Input for joining with newline must be an array.");
                    return '';
                }
                return inputValue.join("\n");
            case 0: // Join elements of an array without any separator.
                if (!Array.isArray(inputValue)) {
                    reportError("Input for joining without separator must be an array.");
                    return '';
                }
                return inputValue.join("");
            default: // If the conversion type is unrecognized, return the original value.
                reportError(`Unrecognized conversion type '${conversionType}'. Returning original input value.`);
                return inputValue;
        }
    } catch (conversionError) {
        reportError(`An unexpected error occurred during data conversion (type ${conversionType}): ${conversionError.message}. Returning original input value.`);
        return inputValue; // Fallback: return the original value in case of an error.
    }
}

// Orchestrates the primary processing logic of the application.
// This function reads input, counts specific characters, and calculates a combination product.
function processMainApplication() {
    // Deletion: The original `var N = nextInt();` line was removed as it was unused in the logic.
    // let initialInputLineNumericValue = getNextInteger(); // This line is not essential for the core problem.

    // Initialize an object to count occurrences of specific 'MARCH' characters.
    const marchCharacterCounter = {
        'M': 0, 'A': 0, 'R': 0, 'C': 0, 'H': 0
    };

    // Iterate through each line of available input.
    while (hasMoreLinesAvailable()) {
        const currentLineChars = retrieveCharacterArray();
        
        // Guard clause: Skip processing if the current line is empty or has no characters.
        if (currentLineChars.length === 0) {
            continue; // Move to the next line of input.
        }

        const firstCharacterOfLine = currentLineChars[0];
        
        // Increment the counter only if the first character of the line is one of the 'MARCH' keys.
        // Using hasOwnProperty ensures we only modify predefined keys and don't add new ones.
        if (Object.prototype.hasOwnProperty.call(marchCharacterCounter, firstCharacterOfLine)) {
            marchCharacterCounter[firstCharacterOfLine]++;
        }
    }

    // Filter out 'MARCH' characters that had zero occurrences, as they cannot contribute to combinations.
    const availableMarchChars = Object.keys(marchCharacterCounter).filter(
        charKey => marchCharacterCounter[charKey] > 0
    );

    // Guard clause: If there are fewer than 3 unique 'MARCH' characters with positive counts,
    // it's impossible to form combinations of three, so the result is 0.
    if (availableMarchChars.length < 3) {
        displayResult(0);
        return;
    }

    let totalCombinationsProduct = 0; // Accumulator for the product of combinations.
    const numberOfAvailableChars = availableMarchChars.length; // Cache the length for loop optimization.

    // Calculate the product of combinations of three distinct 'MARCH' character counts.
    // This is achieved using three nested loops, ensuring each character in a combination is unique
    // and ordered (i.e., (M,A,R) is counted, but (A,M,R) is not a distinct combination).
    for (let firstCharIdx = 0; firstCharIdx < numberOfAvailableChars - 2; firstCharIdx++) {
        for (let secondCharIdx = firstCharIdx + 1; secondCharIdx < numberOfAvailableChars - 1; secondCharIdx++) {
            for (let thirdCharIdx = secondCharIdx + 1; thirdCharIdx < numberOfAvailableChars; thirdCharIdx++) {
                // Retrieve the actual characters and their counts for the current combination.
                const char1 = availableMarchChars[firstCharIdx];
                const char2 = availableMarchChars[secondCharIdx];
                const char3 = availableMarchChars[thirdCharIdx];

                const count1 = marchCharacterCounter[char1];
                const count2 = marchCharacterCounter[char2];
                const count3 = marchCharacterCounter[char3];

                // Add the product of the three counts to the running total.
                totalCombinationsProduct += count1 * count2 * count3;
            }
        }
    }

    // Display the final calculated sum of combination products.
    displayResult(totalCombinationsProduct);
}