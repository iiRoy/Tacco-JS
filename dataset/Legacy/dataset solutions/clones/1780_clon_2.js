let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

/**
 * Processes an array of numbers to find the count of unique prime numbers.
 * This function identifies numbers that appear exactly once after marking multiples.
 *
 * @param {object} params - An object containing utility functions and input data.
 * @param {string} params.sourceData - The raw input string (not directly used in this main logic, but passed through).
 * @param {function} params.dataLoader - A function to load numerical data from the input.
 * @param {function} params.boolFormatter - A utility to format boolean values (not used here).
 * @param {function} params.numericAggregator - A utility to sum numbers (not used here).
 */
function processData({ sourceData, dataLoader, boolFormatter, numericAggregator }) {
    // Load the first line, which contains the count of elements.
    const [countOfElements] = dataLoader();
    // Load the array of numbers based on the provided count.
    const elementList = dataLoader(countOfElements);

    // Determine the maximum value present in the input array.
    let maximumValue = 0;
    for (const currentElement of elementList) {
        if (currentElement > maximumValue) {
            maximumValue = currentElement;
        }
    }

    // Initialize a frequency map (array) to store counts of each number up to maximumValue.
    // All elements are initially set to zero.
    const frequencyMap = new Array(maximumValue + 1).fill(0);

    // Populate the frequency map by counting occurrences of each number in elementList.
    for (const currentElement of elementList) {
        frequencyMap[currentElement]++;
    }

    // Sieve-like process: Mark multiples of numbers that appear in the input.
    // If a number `currentNumber` is present in the input (frequencyMap[currentNumber] > 0),
    // then all its multiples `multipleNumber` (starting from 2*currentNumber) are marked as 0
    // in the frequencyMap. This effectively removes non-prime numbers and their multiples.
    for (let currentNumber = 1; currentNumber <= maximumValue; currentNumber++) {
        // Skip if the current number is not present in the input array.
        if (!frequencyMap[currentNumber]) {
            continue;
        }
        // Iterate through multiples of currentNumber.
        for (let multipleNumber = currentNumber * 2; multipleNumber <= maximumValue; multipleNumber += currentNumber) {
            frequencyMap[multipleNumber] = 0; // Mark multiples as not unique/prime-like.
        }
    }

    // Filter the frequency map to count how many numbers have a frequency of exactly 1.
    // These are the numbers that were present in the input and were not marked as multiples of other numbers.
    const finalCount = frequencyMap.filter(itemCount => itemCount === 1).length;

    // Output the final count to the console.
    console.log(finalCount);
}

// Split the raw input string into segments based on whitespace or newlines.
let parsedSegments = rawData.split(/[\s\n]/);

// Invoke the main processing function with an object containing necessary utilities.
processData({
    sourceData: rawData, // The original raw input string.
    boolFormatter: (value) => (value ? 'Yes' : 'No'), // A simple boolean formatter.
    // A flexible data loading function.
    dataLoader(numRows = 1, numCols = 1, shouldParseAsNumber = true) {
        const totalItems = numRows * numCols;
        // Extract the required number of segments from the beginning of parsedSegments.
        let extractedData = parsedSegments.splice(0, totalItems);
        // Convert segments to numbers if specified.
        if (shouldParseAsNumber) {
            extractedData = extractedData.map(Number);
        }
        // If multiple columns are requested, restructure the data into columnar arrays.
        if (numCols > 1) {
            const columnarArrays = new Array(numCols);
            for (let columnIndex = 0; columnIndex < numCols; columnIndex++) {
                columnarArrays[columnIndex] = new Array();
                for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
                    columnarArrays[columnIndex].push(extractedData[rowIndex * numCols + columnIndex]);
                }
            }
            extractedData = columnarArrays;
        }
        return extractedData;
    },
    // A function to prevent infinite loops (throws an error if called).
    loopGuard() {
        throw new Error("Infinite loop detected!");
    },
    // A function to calculate the sum of an array of numbers.
    numericAggregator(inputNumbers) {
        return inputNumbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    },
});
