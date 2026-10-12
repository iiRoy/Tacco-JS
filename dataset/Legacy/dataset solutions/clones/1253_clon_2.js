// This file contains the primary logic for processing numerical data from standard input.

/**
 * Processes an array of string-represented numbers, calculates min, max, and sum,
 * then outputs these results to standard output.
 * @param {string[]} dataChunks - An array of strings, where the first element is the count
 *                                of numbers, followed by the numbers themselves.
 */
function processInput(dataChunks) {
    // The first element indicates how many numbers to expect.
    let countElements = +dataChunks.shift();

    // Initialize an array to hold the parsed numeric values.
    const numericArray = [];

    // Loop to extract and convert the specified number of elements.
    for (let idx = 0; idx < countElements; ++idx) {
        numericArray.push(+dataChunks.shift());
    }

    // Create a list to store the calculated statistics.
    const resultsList = [];

    // Determine the smallest value in the collection.
    resultsList.push(utilityFunctions.findMinimum(numericArray));

    // Determine the largest value in the collection.
    resultsList.push(utilityFunctions.findMaximum(numericArray));

    // Compute the total sum of all numbers.
    resultsList.push(utilityFunctions.calculateSum(numericArray));

    // Write the computed statistics to standard output, separated by spaces.
    process.stdout.write(resultsList.join(' '));
}

// Activate the standard input stream to begin receiving data.
process.stdin.resume();

// Configure the input stream to interpret incoming bytes as UTF-8 characters.
process.stdin.setEncoding('utf8');

// Set up an event listener to handle incoming data segments.
process.stdin.on('data', function (inputSegment) {
    // Split the received data segment by any whitespace and pass it to the processing function.
    processInput(inputSegment.split(/\s+/));
});

// This section defines a collection of general-purpose utility functions.
let utilityFunctions;
(function (utilityFunctions) {
    /**
     * Obtains the smallest number from a given array.
     * @param {number[]} dataCollection - The array of numbers to search.
     * @returns {number} The minimum value found.
     */
    function findMinimum(dataCollection) {
        return Math.min.apply(Math, dataCollection);
    }
    utilityFunctions.findMinimum = findMinimum;

    /**
     * Obtains the largest number from a given array.
     * @param {number[]} dataCollection - The array of numbers to search.
     * @returns {number} The maximum value found.
     */
    function findMaximum(dataCollection) {
        return Math.max.apply(Math, dataCollection);
    }
    utilityFunctions.findMaximum = findMaximum;

    /**
     * Reduces an array to a single value by applying a function against an accumulator and each element.
     * @param {any[]} dataCollection - The array to iterate over.
     * @param {Function} operation - The function to execute on each element.
     * @param {any} initialValue - The initial value of the accumulator.
     * @returns {any} The accumulated single value.
     */
    function aggregateValues(dataCollection, operation, initialValue) {
        let accumulator = initialValue;
        for (let index = 0; index < dataCollection.length; ++index) {
            accumulator = operation(accumulator, dataCollection[index]);
        }
        return accumulator;
    }
    utilityFunctions.aggregateValues = aggregateValues;

    /**
     * Computes the sum of all numeric elements within an array.
     * @param {number[]} dataCollection - The array of numbers to sum.
     * @returns {number} The total sum of the numbers.
     */
    function calculateSum(dataCollection) {
        return aggregateValues(dataCollection, function (accumulator, currentElement) {
            return accumulator + currentElement;
        }, 0);
    }
    utilityFunctions.calculateSum = calculateSum;
})(utilityFunctions || (utilityFunctions = {}));
