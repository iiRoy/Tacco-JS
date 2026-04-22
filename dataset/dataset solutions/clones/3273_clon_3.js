// This script manages input, performs data transformations, and executes a core algorithm.
// It's designed to read numerical sequences and calculate the minimum operations needed
// to balance certain differences between two arrays.

var inputReader = initializeInputSystem(); // Initialize the input management object.
processData(); // Begin the main data processing routine.

// Retrieves the next line from the input and attempts to parse it as an integer.
function readInteger() {
    return formatInput(getNextLine(), 101); // Conversion type 101 for integer parsing.
}

// Fetches the next input line and splits it into an array of strings using space as delimiter.
function readStringArray() {
    return formatInput(getNextLine(), 102); // Conversion type 102 for string array.
}

// Reads the next input line, splits it by spaces, and converts each part to a number.
function readIntegerArray() {
    return formatInput(getNextLine(), 104); // Conversion type 104 for integer array.
}

// Obtains the next input line and breaks it down into an array of individual characters.
function readCharacterArray() {
    return formatInput(getNextLine(), 106); // Conversion type 106 for character array.
}

// Accesses the input reader to get the subsequent line of data.
function getNextLine() {
    return inputReader.getNext();
}

// Queries the input reader to determine if there are more lines available for processing.
function hasMoreLines() {
    return inputReader.hasMoreLines();
}

// Utility function to read all raw input from standard input.
// It reads the entire content, trims whitespace, and then splits it into an array of lines.
function fetchRawInput() {
    const fileSystem = require("fs"); // Import the file system module.
    const rawContent = fileSystem.readFileSync("/dev/stdin", "utf8"); // Read file synchronously.
    const trimmedContent = rawContent.trim(); // Remove leading/trailing whitespace.
    return trimmedContent.split("\n"); // Split into an array of lines.
}

// Sets up the input handling mechanism.
// This function creates an object that manages reading lines sequentially from standard input.
function initializeInputSystem() {
    const rawInputLines = fetchRawInput(); // Get all lines from the input source.
    const totalLinesCount = rawInputLines.length;

    // Provide an early exit or a default handler if no input is found.
    if (totalLinesCount === 0) {
        console.warn("Input system initialized with no data. Subsequent reads will be empty.");
        return {
            dataLines: [], currentLineIndex: 0, totalLines: 0,
            hasMoreLines: () => false, getNext: () => ""
        };
    }

    // The main input handler object.
    let inputHandler = {
        dataLines: rawInputLines, // Array storing all input lines.
        currentLineIndex: 0, // Tracks the current line being processed.
        totalLines: totalLinesCount, // Total number of lines available.

        // Checks if the current index is within the bounds of available lines.
        hasMoreLines: function() {
            return (this.currentLineIndex < this.totalLines);
        },

        // Retrieves the line at the current index and advances the index.
        getNext: function() {
            if (!this.hasMoreLines()) {
                logError("Attempted to read past the end of the input stream.");
                return ""; // Return empty string if no more input.
            }
            let lineContent = this.dataLines[this.currentLineIndex];
            this.currentLineIndex++; // Move to the next line.
            return lineContent;
        }
    };
    return inputHandler;
}

// Displays the provided value to the standard output.
function displayResult(valueToOutput) {
    console.log(valueToOutput);
}

// Logs an error message to the standard error stream.
// This function is included for debugging or reporting issues.
function logError(message) {
    console.error(`ERROR: ${message}`);
}

// Transforms an input item based on a specified conversion type.
// New conversion types are used for differentiation.
// 101: Convert to base-10 integer.
// 102: Split string by spaces into an array of strings.
// 104: Split string by spaces, then convert each part to a number.
// 106: Split string into an array of individual characters.
// 107: Split string into characters, then convert each character to a number.
// 108: Join array elements with a space.
// 109: Join array elements with a newline.
// 100: Join array elements without any separator.
// Any other type: Returns the item unchanged.
function formatInput(item, conversionType) {
    try {
        if (conversionType === 101) {
            const parsedValue = Number.parseInt(item, 10);
            return Number.isNaN(parsedValue) ? item : parsedValue; // Return original if parsing fails.
        } else if (conversionType === 102) {
            return String(item).split(" ");
        } else if (conversionType === 104) {
            return String(item).split(" ").filter(s => s !== '').map((element) => Number(element));
        } else if (conversionType === 106) {
            return String(item).split("");
        } else if (conversionType === 107) {
            return String(item).split("").filter(s => s !== '').map((element) => Number(element));
        } else if (conversionType === 108) {
            if (Array.isArray(item)) return item.join(" ");
            return item; // If not an array, return as is.
        } else if (conversionType === 109) {
            if (Array.isArray(item)) return item.join("\n");
            return item;
        } else if (conversionType === 100) {
            if (Array.isArray(item)) return item.join("");
            return item;
        } else {
            return item; // Default: return item as is.
        }
    } catch (err) {
        logError(`Failed to format input (type ${conversionType}): ${err.message}`);
        return item; // On error, return the original item.
    }
}

// This is the core logic of the application.
// It reads two arrays, calculates differences, and determines a minimum operation count.
function processData() {
    // Initial validation: ensure input system is operational and has data.
    if (!inputReader || !inputReader.hasMoreLines()) {
        displayResult(-1); // Indicate an error due to no input.
        return;
    }

    const countN = readInteger(); // Read the size of the arrays.
    // Validate the read 'N' value.
    if (typeof countN !== 'number' || countN <= 0 || Number.isNaN(countN)) {
        logError(`Invalid input for N: ${countN}`);
        displayResult(-1);
        return;
    }

    const arrayA = readIntegerArray(); // Read the first array of integers.
    const arrayB = readIntegerArray(); // Read the second array of integers.

    // Validate that both arrays have the expected number of elements.
    if (arrayA.length !== countN || arrayB.length !== countN) {
        logError(`Array length mismatch: Expected ${countN}, got A: ${arrayA.length}, B: ${arrayB.length}`);
        displayResult(-1);
        return;
    }

    const positiveDiffs = []; // Stores the non-negative differences (A[k] - B[k]).
    let sumOfDeficits = 0; // Accumulates the sum of (B[k] - A[k]) for negative differences.
    let totalDifference = 0; // Overall sum of (A[k] - B[k]) for all elements.
    let operationsCount = 0; // Counts the total operations required.

    // Iterate through the arrays to calculate differences and populate lists.
    for (let k = 0; k < countN; k++) {
        const currentDifference = arrayA[k] - arrayB[k];
        totalDifference += currentDifference; // Aggregate the total difference.

        if (currentDifference >= 0) {
            positiveDiffs.push(currentDifference); // Collect positive or zero differences.
        } else {
            sumOfDeficits += Math.abs(currentDifference); // Sum the magnitude of deficits.
            operationsCount++; // Each deficit requires at least one operation.
        }
    }

    // If the total difference across all elements is negative, it's impossible to balance.
    if (totalDifference < 0) {
        displayResult(-1);
        return;
    }

    // Sort the collected positive differences in descending order.
    // This allows us to use the largest available positive values to cover deficits first.
    positiveDiffs.sort((valueOne, valueTwo) => valueTwo - valueOne);

    let diffIndex = 0; // Index to iterate through the sorted positive differences.
    // Utilize the positive differences to counteract the accumulated deficits.
    while (sumOfDeficits > 0 && diffIndex < positiveDiffs.length) {
        sumOfDeficits -= positiveDiffs[diffIndex]; // Reduce the deficit.
        operationsCount++; // Increment operation count for each positive difference used.
        diffIndex++; // Move to the next largest positive difference.
    }

    // The final count of operations. If totalDifference was non-negative,
    // all deficits should theoretically be covered by now.
    displayResult(operationsCount);
}