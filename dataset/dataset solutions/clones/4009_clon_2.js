let dataProcessor = initializeProcessor();
executeProgram();

const retrieveInteger = () => transformValue(fetchNextItem(), 1); // Obtain an integer from the input stream
function retrieveStringArray() { return transformValue(fetchNextItem(), 2); } /* Split input by spaces into an array of strings */
const retrieveNumberArray = () => transformValue(fetchNextItem(), 4); // Get an array of numbers from space-separated input
function retrieveCharacterArray() { return transformValue(fetchNextItem(), 6); } // Break input into individual characters

function fetchNextItem() { return dataProcessor.fetchNextItem(); }
function hasMoreItems() { return dataProcessor.hasMoreItems(); }

const readInputData = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}; // Read all lines from standard input

function initializeProcessor() {
    const inputLines = readInputData();
    let processorInstance = {
        "lineCollection" : inputLines,
        "currentIndex" : 0,
        "maximumIndex" : inputLines.length,

        "hasMoreItems" : function() {
            return (this.currentIndex < this.maximumIndex);
        },

        "fetchNextItem" : function() { // Retrieve the subsequent input element
            if (!this.hasMoreItems()) {
                throw new Error("Input stream exhausted. No more elements available.");
            } else {
                let currentLine = this.lineCollection[this.currentIndex];
                this.currentIndex++;
                return currentLine;
            }
        }
    };
    return processorInstance;
}

const displayOutput = (val) => { console.log(val); }; // Print a value to standard output
function reportError(message) { console.error(message); } /* Output an error message to the console */

/*
 * This function handles various transformations of input values.
 * Parameter 'conversionType' dictates the operation:
 * - If 'conversionType' is unknown or invalid, the input is returned as-is.
 * - 1: Parses input into an integer.
 * - 2: Splits input string by spaces into a string array.
 * - 4: Splits input string by spaces and maps to a number array.
 * - 6: Splits input string into an array of single characters.
 * - 7: Splits input string into characters and maps to a number array.
 * - 8: Joins array elements with a space.
 * - 9: Joins array elements with a newline.
 * - 0: Joins array elements without any separator.
 */
function transformValue(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1: return parseInt(inputValue);
            case 2: return inputValue.split(" ");
            case 4: return inputValue.split(" ").map((element) => Number(element));
            case 6: return inputValue.split("");
            case 7: return inputValue.split("").map((element) => Number(element));
            case 8: return inputValue.join(" ");
            case 9: return inputValue.join("\n");
            case 0: return inputValue.join("");
            default: return inputValue;
        }
    } catch (err) {
        // In case of any conversion error, return the original input
        return inputValue;
    }
}

function executeProgram() {
    let inputCount = retrieveInteger(); // Read the first integer input

    const charCounts = { // Initialize an object to store character frequencies
        "M" : 0,
        "A" : 0,
        "R" : 0,
        "C" : 0,
        "H" : 0
    };

    while (hasMoreItems()) { // Loop through all available input items
        const firstChar = retrieveCharacterArray()[0]; // Get the initial character of the current line
        charCounts[firstChar]++;
    }

    const characterKeys = Object.keys(charCounts); // Extract the keys from the frequency map
    let totalCombinations = 0; // Variable to accumulate the final count

    for (let idx1 = 0; idx1 < characterKeys.length - 2; idx1++) { // First loop for combinations
        for (let idx2 = idx1 + 1; idx2 < characterKeys.length - 1; idx2++) { // Second loop for combinations
            for (let idx3 = idx2 + 1; idx3 < characterKeys.length; idx3++) { // Third loop for combinations
                totalCombinations += charCounts[characterKeys[idx1]] * charCounts[characterKeys[idx2]] * charCounts[characterKeys[idx3]];
            }
        }
    }

    displayOutput(totalCombinations);
}