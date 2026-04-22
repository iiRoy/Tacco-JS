let rawContent = require("fs").readFileSync("/dev/stdin", "utf8");

/**
 * Main processing function for the application logic.
 * It receives a context object with various utility functions.
 * @param {object} applicationContext - The context object providing necessary utilities.
 */
function processCalculation(
  {
    contextData,      // Input data from standard input
    fetchData,        // Utility to load structured data
    booleanToText,    // Converts boolean to 'Yes'/'No'
    calculateSum,     // Sums an array of numbers
    findMaximum,      // Finds the maximum in a collection
    findMinimum,      // Finds the minimum in a collection
    outputJson        // Outputs data as JSON
  }
)
{
    // Load the first operand as a BigInt.
    // Expects one row, one column, and BigInt type.
    const [operandOne] = fetchData(1,1,BigInt);

    // Load the second operand, initially as a Number (default type).
    let [operandTwo] = fetchData();

    // Convert the second operand:
    // 1. Multiply by 1000 to handle decimal precision.
    // 2. Floor the result to remove fractional parts.
    // 3. Convert the final number to a BigInt for arithmetic with operandOne.
    operandTwo = BigInt(Math.floor(operandTwo * 1000));

    // Perform the calculation: (operandOne * operandTwo) / 1000.
    // The divisor is also a BigInt to ensure BigInt division.
    // Finally, convert the BigInt result back to a string for output.
    return (operandOne * operandTwo / BigInt(1000)).toString();
}


// Split the raw input content into tokens based on whitespace and newlines.
let processedTokens = rawContent.split(/[\s\n]/);

// Execute the main processing function, passing a comprehensive context object.
let finalOutput = processCalculation({
    contextData: rawContent, // The original raw input string

    // Utility function to convert a boolean value to a descriptive string.
    booleanToText: val => val ? 'Yes' : 'No',

    // Utility function to sum all numbers in an array.
    calculateSum: numberSequence => numberSequence.reduce((accumulator, currentElement) => accumulator + currentElement, 0),

    /**
     * Data loading utility. Extracts values from the global processedTokens array.
     * @param {number} [numRows=1] - Number of rows to read.
     * @param {number} [numColumns=1] - Number of columns per row.
     * @param {Function} [dataType=Number] - The constructor function to apply to each extracted value (e.g., Number, BigInt, String).
     * @returns {Array|Array[]} An array of values, or an array of arrays if multiple columns are requested.
     */
    fetchData(numRows = 1, numColumns = 1, dataType = Number) {
        const totalElements = numRows * numColumns;
        // Extract the required number of elements from the beginning of processedTokens.
        let extractedValues = processedTokens.splice(0, totalElements);

        // If the expected data type is not String, map the values to the specified type.
        if (dataType !== String) {
            extractedValues = extractedValues.map(dataType);
        }

        // If multiple columns are requested, restructure the flat array into a columnar format.
        if (numColumns > 1) {
            const columnarArrays = new Array(numColumns);
            for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
                columnarArrays[columnIndex] = []; // Initialize each column array
                for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
                    // Populate columns by taking elements appropriately from the flat list.
                    columnarArrays[columnIndex].push(extractedValues[rowIndex * numColumns + columnIndex]);
                }
            }
            extractedValues = columnarArrays; // Replace flat array with columnar structure.
        }
        return extractedValues;
    },

    // A placeholder utility to prevent infinite loops, throwing an error if called.
    loopGuard() {
        throw new Error("Potential infinite loop detected!");
    },

    // Pass references to the globally defined maximum and minimum finding functions.
    findMaximum: findMaximum,
    findMinimum: findMinimum,

    // Utility function to log an object as a JSON string to the console.
    outputJson(valueToLog) {
        console.log(JSON.stringify(valueToLog));
    },
});

// Check if the final result from the main processing function is undefined.
if (finalOutput === undefined) {
    console.warn("The computation yielded an undefined result.");
} else {
    // Otherwise, print the computed result to standard output.
    console.log(finalOutput);
}

/**
 * Finds the maximum value in a numeric collection.
 * @param {Array<number|BigInt>} numericCollection - An array of numbers or BigInts.
 * @param {number|BigInt|null} [startingValue=null] - An optional initial value for comparison.
 * @returns {number|BigInt} The maximum value found.
 */
function findMaximum(numericCollection, startingValue = null) {
    // Initialize the result with the first element or the provided starting value.
    let computedResult = (startingValue === null) ? numericCollection[0] : startingValue;

    // Iterate through the collection to find the largest element.
    for (const currentNumber of numericCollection) {
        if (currentNumber > computedResult) {
            computedResult = currentNumber;
        }
    }
    return computedResult;
}

/**
 * Finds the minimum value in a numeric collection.
 * @param {Array<number|BigInt>} numericCollection - An array of numbers or BigInts.
 * @param {number|BigInt|null} [startingValue=null] - An optional initial value for comparison.
 * @returns {number|BigInt} The minimum value found.
 */
function findMinimum(numericCollection, startingValue = null) {
    // Initialize the result with the first element or the provided starting value.
    let computedResult = (startingValue === null) ? numericCollection[0] : startingValue;

    // Iterate through the collection to find the smallest element.
    for (const currentNumber of numericCollection) {
        if (currentNumber < computedResult) {
            computedResult = currentNumber;
        }
    }
    return computedResult;
}