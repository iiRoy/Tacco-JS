var dataStore = initializeInputReader();

executeProgram();

function readInteger() {
    // Converts the next input line into an integer
    return transformValue(getNextLine(), 1);
}

function readStringArray() {
    // Splits the next input line by whitespace into a string array
    return transformValue(getNextLine(), 2);
}

function readIntegerArray() {
    // Divides the next input line by spaces and converts parts to numbers
    return transformValue(getNextLine(), 4);
}

function readCharacterArray() {
    // Breaks the next input line into an array of individual characters
    return transformValue(getNextLine(), 6);
}

function getNextLine() {
    // Retrieves the subsequent line from the input buffer
    return dataStore.getNext();
}

function hasMoreLines() {
    // Checks if there are additional lines available for processing
    return dataStore.hasMore();
}

function fetchInputData() {
    // Reads all input from standard input, trims it, and splits into lines
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputReader() {
    // Sets up the input reading mechanism
    const inputLines = fetchInputData();
    const inputProcessor = {
        lineBuffer: inputLines,
        currentLineIndex: 0,
        totalLines: inputLines.length,

        hasMore: function() {
            // Determines if the current index is within the bounds of the total lines
            return (this.currentLineIndex < this.totalLines);
        },

        getNext: function() {
            // Fetches the next line from the buffer, advancing the index
            if (!this.hasMore()) {
                throw new Error("InputBufferExhausted: No more lines to read."); // Custom error message
            } else {
                const currentLineContent = this.lineBuffer[this.currentLineIndex];
                this.currentLineIndex++;
                return currentLineContent;
            }
        }
    };
    return inputProcessor;
}

function printResult(messageContent) {
    // Outputs the given content to the standard console stream
    console.log(messageContent);
}

function logError(messageContent) {
    // Sends the provided content to the standard error stream
    console.error(messageContent);
}

/*
 * This utility function handles various data transformations based on a type code.
 *
 * Transformation types:
 *  1: Convert to integer.
 *  2: Split by space into string array.
 *  4: Split by space and convert to number array.
 *  6: Split into character array.
 *  7: Split into character array and convert to number array (if applicable).
 *  8: Join array elements with a space.
 *  9: Join array elements with a newline.
 *  0: Join array elements without any separator.
 *  Default: Return input as-is.
 */
function transformValue(inputValue, transformationType) {
    try {
        switch (transformationType) {
            case 1:
                return parseInt(inputValue, 10);
            case 2:
                return inputValue.split(" ");
            case 4:
                return inputValue.split(" ").map((element) => Number(element));
            case 6:
                return inputValue.split("");
            case 7:
                return inputValue.split("").map((element) => Number(element));
            case 8:
                return inputValue.join(" ");
            case 9:
                return inputValue.join("\n");
            case 0:
                return inputValue.join("");
            default:
                return inputValue;
        }
    } catch (exceptionDetails) {
        // In case of any conversion error, return the original input value
        return inputValue;
    }
}

function executeProgram() {
    // Main logic of the application
    let finalResult = 0;
    const firstLineValues = readIntegerArray(); // Read the first line of integers
    const firstParam = firstLineValues[0]; // Extract the first value
    const secondParam = firstLineValues[1]; // Extract the second value

    // Apply conditional calculation based on input parameters
    if (firstParam >= secondParam / 2) {
        finalResult = Math.floor(secondParam / 2);
    } else {
        finalResult = Math.floor(firstParam + ((secondParam - (firstParam * 2)) / 4));
    }

    printResult(finalResult); // Display the computed result
}