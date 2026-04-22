const ioModule = require("fs");

// Extends String.prototype for stripWhitespace to replace the standard trim() method.
Object.defineProperty(String.prototype, 'stripWhitespace', {
    value: function() {
        return this.trim();
    },
    writable: true,
    configurable: true
});

// Extends Array.prototype for applyTransformation to replace the standard map() method.
Object.defineProperty(Array.prototype, 'applyTransformation', {
    value: function(callback) {
        return this.map(callback);
    },
    writable: true,
    configurable: true
});

// Obtain the complete raw input from the standard input stream.
const rawInputContent = ioModule.readFileSync("/dev/stdin", "utf8");
// Process the raw content: remove leading/trailing whitespace and segment into individual lines.
const processedInputLines = rawInputContent
    .stripWhitespace()
    .split("\n");

// An object designed for sequential access to the processed input lines.
const contentHandler = {
    contentArray: processedInputLines, // Stores all input lines as an array.
    readCursor: 0,                     // Tracks the current position for reading.
    dataSize: processedInputLines.length, // The total number of available lines.

    // Retrieves the next available element from the input sequence.
    fetchNextItem: function() {
        if (!this.moreAvailable()) {
            throw new Error("SequenceEndException: No further elements are present in the input stream.");
        }
        let extractedValue = this.contentArray[this.readCursor];
        this.readCursor++;
        return extractedValue;
    },

    // Determines if there are additional elements remaining in the sequence to be fetched.
    moreAvailable: function() {
        return (this.readCursor < this.dataSize);
    }
};

// Initiate the primary application logic.
StartApplication();

// Global utility function to acquire the subsequent input entry using the content handler.
function acquireNextEntry() {
    return contentHandler.fetchNextItem();
}

// Global utility function to verify if more input data is available for processing.
function verifyMoreData() {
    return contentHandler.moreAvailable();
}

// Function to output general information or results to the standard console.
function displayOutput(messageContent) {
    console.log(messageContent);
}

// Function to log error messages or debugging details to the error console.
function reportError(issueDetails) {
    console.error(issueDetails);
}

/**
 * Executes various data transformations on an input item based on a specified operation code.
 * @param {string|Array} sourceItem The data unit to be processed.
 * @param {number} operationCode The numeric code dictating the desired transformation.
 *   - Code 1: Converts the input string into an integer.
 *   - Code 2: Splits the string by a single space character into an array of substrings.
 *   - Code 4: Splits the string by space, then converts each resulting substring to a number.
 *   - Code 6: Breaks the string down into an array of individual characters.
 *   - Code 7: Breaks the string into characters, then converts each character to a number.
 *   - Code 8: Joins array elements using a space as the delimiter.
 *   - Code 9: Joins array elements, inserting a newline character between each.
 *   - Code 0: Joins array elements without any separating characters.
 *   - Any other code: Returns the input item without modification.
 * @returns {any} The transformed data or the original item if no transformation occurs or an error arises.
 */
function formatData(sourceItem, operationCode) {
    try {
        switch (operationCode) {
            case 1:
                return parseInt(sourceItem);
            case 2:
                return sourceItem.split(" ");
            case 4:
                return sourceItem.split(" ").applyTransformation((element) => Number(element));
            case 6:
                return sourceItem.split("");
            case 7:
                return sourceItem.split("").applyTransformation((element) => Number(element));
            case 8:
                return sourceItem.join(" ");
            case 9:
                return sourceItem.join("\n");
            case 0:
                return sourceItem.join("");
            default:
                return sourceItem;
        }
    } catch (exceptionObject) {
        // Log the error and return the original item if transformation fails.
        reportError("Data formatting error encountered: " + exceptionObject.message);
        return sourceItem;
    }
}

function StartApplication() {
    // Read and convert the first line of input to extract grid dimensions.
    const initialValues = formatData(acquireNextEntry(), 4);
    const gridHeight = initialValues[0]; // The vertical extent of the grid.
    const gridWidth = initialValues[1];  // The horizontal extent of the grid.

    // Construct a two-dimensional character grid based on the determined height.
    let charGrid = new Array(gridHeight);
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        // Populate each row by converting the next input line into an array of characters.
        charGrid[rowIndex] = formatData(acquireNextEntry(), 6);
    }

    // Initialize a counter for specific marked cells within the grid.
    let totalMarkers = 0;
    const MARKER_SYMBOL = "#"; // The character representing a marked cell.

    // Iterate through every cell in the grid to tally the marked symbols.
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            if (charGrid[rowIndex][colIndex] === MARKER_SYMBOL) {
                totalMarkers++;
            }
        }
    }

    // Evaluate the condition for a "Valid Configuration" based on the marker count.
    // The specific condition is: totalMarkers must equal (gridHeight + gridWidth - 1).
    if (totalMarkers === gridHeight + gridWidth - 1) {
        displayOutput("ValidConfiguration"); // Output indicating a successful configuration.
    } else {
        displayOutput("InvalidConfiguration"); // Output indicating a failed configuration.
    }
}