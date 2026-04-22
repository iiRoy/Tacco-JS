'use strict';

// Defines constants for various data transformation types.
const NUMERIC_PARSE_TYPE = 1;
const SPACE_DELIMITED_TYPE = 2;
const SPACE_DELIMITED_NUMERIC_TYPE = 4;
const CHARACTER_SPLIT_TYPE = 6;
const CHARACTER_DELIMITED_NUMERIC_TYPE = 7;
const JOIN_BY_SPACE_TYPE = 8;
const JOIN_BY_NEWLINE_TYPE = 9;
const JOIN_WITHOUT_SEPARATOR_TYPE = 0;

// Global input management object, initialized upon script execution.
let inputSource = initializeInputSystem();

// Begin the primary application logic.
executePrimaryLogic();

// Function to fetch the next line of input and convert it into an integer.
function retrieveInteger() {
    return dataTransformer(getNextLine(), NUMERIC_PARSE_TYPE);
}

// Function to fetch the next line of input and parse it into an array of strings,
// using a space as the delimiter.
function retrieveStringArray() {
    return dataTransformer(getNextLine(), SPACE_DELIMITED_TYPE);
}

// Function to fetch the next line, split it by spaces, and convert each part to a number.
function retrieveNumericArray() {
    return dataTransformer(getNextLine(), SPACE_DELIMITED_NUMERIC_TYPE);
}

// Function to fetch the next line and break it down into an array of single characters.
function retrieveCharacterArray() {
    return dataTransformer(getNextLine(), CHARACTER_SPLIT_TYPE);
}

// Retrieves the next available line from the input stream.
function getNextLine() {
    return inputSource.fetchLine();
}

// Checks if there are additional lines of input data available for processing.
function hasMoreInput() {
    return inputSource.checkAvailability();
}

// Reads all content from standard input, removes leading/trailing whitespace,
// and then divides it into an array of strings based on newline characters.
function acquireInputContent() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

// Sets up the input reading system, creating an object to manage the input lines.
function initializeInputSystem() {
    const rawInputLines = acquireInputContent();
    const readerInstance = {
        "lineCollection": rawInputLines,
        "readPointer": 0,
        "totalLines": rawInputLines.length,
        "checkAvailability": function() {
            return (this.readPointer < this.totalLines);
        },
        "fetchLine": function() {
            if (!this.checkAvailability()) {
                return "";
            } else {
                const currentEntry = this.lineCollection[this.readPointer];
                this.readPointer++;
                return currentEntry;
            }
        }
    };
    return readerInstance;
}

// Outputs the provided value to the standard console.
function outputResult(outputValue) {
    console.log(outputValue);
}

// Logs an error message to the standard error stream.
function logError(errorDetails) {
    console.error(errorDetails);
}

// // This function is a placeholder for a disabled error logging mechanism.
// // function logError(errorDetails){return;}

/**
 * Applies a specific transformation to an input value based on the given type.
 * Default behavior for unknown types or errors is to return the original value.
 * @param {string|Array} inputValue - The data to be processed.
 * @param {number} transformType - A constant specifying the desired conversion.
 * @returns {*} The result of the transformation or the original input on failure.
 */
function dataTransformer(inputValue, transformType) {
    try {
        switch (transformType) {
            case NUMERIC_PARSE_TYPE:
                return parseInt(inputValue);
            case SPACE_DELIMITED_TYPE:
                return inputValue.split(" ");
            case SPACE_DELIMITED_NUMERIC_TYPE:
                return inputValue.split(" ").map((item) => Number(item));
            case CHARACTER_SPLIT_TYPE:
                return inputValue.split("");
            case CHARACTER_DELIMITED_NUMERIC_TYPE:
                return inputValue.split("").map((item) => Number(item));
            case JOIN_BY_SPACE_TYPE:
                return inputValue.join(" ");
            case JOIN_BY_NEWLINE_TYPE:
                return inputValue.join("\n");
            case JOIN_WITHOUT_SEPARATOR_TYPE:
                return inputValue.join("");
            default:
                return inputValue; // Returns input unchanged if conversion type is not recognized.
        }
    } catch (conversionError) {
        return inputValue; // Catches any error during conversion and returns the original input.
    }
}

// Executes the core logic of the application.
function executePrimaryLogic() {
    const initialConfig = retrieveNumericArray();
    const paramA = initialConfig[0];
    const paramB = initialConfig[1];
    const paramC = initialConfig[2];
    const paramD = initialConfig[3];

    const arrayA = retrieveNumericArray();
    const arrayB = retrieveNumericArray();
    const arrayC = retrieveNumericArray();

    // Computes all possible sums of pairs from arrayA and arrayB.
    const intermediateSums = new Array(paramA * paramB);
    for (let outerIdx = 0; outerIdx < paramA; outerIdx++) {
        for (let innerIdx = 0; innerIdx < paramB; innerIdx++) {
            intermediateSums[outerIdx * paramB + innerIdx] = arrayA[outerIdx] + arrayB[innerIdx];
        }
    }

    // Sorts the collected intermediate sums in descending order.
    intermediateSums.sort(function(val1, val2) {
        return val2 - val1;
    });

    // This operation creates a new array containing the first 'paramD' elements,
    // but the result is not assigned, so 'intermediateSums' remains unchanged
    // for subsequent operations. This mirrors the exact original logic.
    intermediateSums.slice(0, paramD);

    // Calculates all possible sums by combining elements from 'intermediateSums'
    // (the full original array) and 'arrayC'.
    const finalCombinedSums = new Array(intermediateSums.length * paramC);
    for (let currentSumIdx = 0; currentSumIdx < intermediateSums.length; currentSumIdx++) {
        for (let thirdArrayIdx = 0; thirdArrayIdx < paramC; thirdArrayIdx++) {
            finalCombinedSums[currentSumIdx * paramC + thirdArrayIdx] = intermediateSums[currentSumIdx] + arrayC[thirdArrayIdx];
        }
    }

    // Sorts the final combined sums in descending order.
    finalCombinedSums.sort(function(val1, val2) {
        return val2 - val1;
    });

    // Similar to above, this creates a new array of the first 'paramD' elements,
    // but the result is discarded, leaving 'finalCombinedSums' unchanged for output.
    finalCombinedSums.slice(0, paramD);

    // Outputs the final combined sums, with each element separated by a newline character.
    outputResult(dataTransformer(finalCombinedSums, JOIN_BY_NEWLINE_TYPE));
}