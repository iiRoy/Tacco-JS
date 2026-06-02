let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

/**
 * Main processing function for the input data.
 * @param {object} params - Object containing various utility functions and input.
 * @param {string} params.sourceData - The raw input string.
 * @param {function} params.dataLoader - Function to load and parse data.
 * @param {function} params.boolToText - Function to convert boolean to 'Yes'/'No'.
 * @param {function} params.calcSum - Function to calculate sum of numbers.
 * @param {function} params.findMaximum - Function to find maximum in a list.
 * @param {function} params.findMinimum - Function to find minimum in a list.
 * @param {function} params.outputJson - Function to log JSON output.
 * @returns {string} The computed result as a string.
 */
function processData({ sourceData, dataLoader, boolToText, calcSum, findMaximum, findMinimum, outputJson }) {
    // Load the first big integer value
    const [firstVal] = dataLoader(1, 1, BigInt);
    // Load the second numeric value
    let [secondVal] = dataLoader();
    // Convert the second value to a BigInt after scaling by 1000
    secondVal = BigInt(Math.floor(secondVal * 1000));
    // Perform the calculation and return as a string
    return (firstVal * secondVal / 1000n).toString();
}

// Split the raw input into tokens based on whitespace or newlines
let parsedTokens = rawData.split(/[\s\n]/);

// Execute the main processing function with necessary utilities
let finalOutcome = processData({
    sourceData: rawData,
    boolToText: (inputBoolean) => inputBoolean ? 'Yes' : 'No',
    calcSum: (numArray) => numArray.reduce((accumulator, currentElement) => accumulator + currentElement, 0),
    dataLoader(numRows = 1, numCols = 1, dataType = Number) {
        const totalElements = numRows * numCols;
        // Extract the required number of tokens from the beginning of the array
        let extractedValues = parsedTokens.splice(0, totalElements);
        // If the data type is not String, map the values to the specified type
        if (dataType !== String) {
            extractedValues = extractedValues.map(dataType);
        }
        // If multiple columns are specified, restructure into an array of arrays
        if (numCols > 1) {
            const columnArrays = new Array(numCols);
            for (let columnIndex = 0; columnIndex < numCols; columnIndex++) {
                columnArrays[columnIndex] = new Array();
                for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
                    columnArrays[columnIndex].push(extractedValues[rowIndex * numCols + columnIndex]);
                }
            }
            extractedValues = columnArrays;
        }
        return extractedValues;
    },
    // Placeholder for an infinite loop prevention mechanism
    inifinite_loop_preventer() {
        throw new Error("Infinite loop detected");
    },
    findMaximum: findMaximum, // Reference to the global findMaximum function
    findMinimum: findMinimum, // Reference to the global findMinimum function
    outputJson(valueToLog) {
        console.log(JSON.stringify(valueToLog));
    },
});

// Check if the final outcome is undefined and log a warning, otherwise log the result
if (finalOutcome === undefined) {
    console.warn("The computed result is undefined");
} else {
    console.log(finalOutcome);
}

/**
 * Finds the maximum value in a list of numbers.
 * @param {Array<number>} numericList - An array of numbers.
 * @param {number|null} [startValue=null] - An optional initial value for comparison.
 * @returns {number} The maximum value found.
 */
function findMaximum(numericList, startValue = null) {
    let currentExtreme = (startValue === null) ? numericList[0] : startValue;
    for (const currentNum of numericList) {
        if (currentNum > currentExtreme) {
            currentExtreme = currentNum;
        }
    }
    return currentExtreme;
}

/**
 * Finds the minimum value in a list of numbers.
 * @param {Array<number>} numericList - An array of numbers.
 * @param {number|null} [startValue=null] - An optional initial value for comparison.
 * @returns {number} The minimum value found.
 */
function findMinimum(numericList, startValue = null) {
    let currentExtreme = (startValue === null) ? numericList[0] : startValue;
    for (const currentNum of numericList) {
        if (currentNum < currentExtreme) {
            currentExtreme = currentNum;
        }
    }
    return currentExtreme;
}
