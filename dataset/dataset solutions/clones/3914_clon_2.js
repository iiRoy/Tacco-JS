'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes the given input string to extract numbers,
 * generate a range, and then print unique numbers from the start and end of that range.
 * @param {string} rawData - The input string containing space-separated numbers.
 */
const processInput = (rawData) => {
    // Split the input string by spaces and convert each part to an integer.
    // This creates an array of numeric values.
    let parsedNumbers = rawData.split(' ').map(itemStr => parseInt(itemStr, 10));

    // Destructure the parsed numbers into meaningful variables.
    const startVal = parsedNumbers[0]; // The starting value of the range.
    const endVal = parsedNumbers[1];   // The ending value of the range.
    const countLimit = parsedNumbers[2]; // The number of elements to take from start and end.

    // Initialize an array to hold all numbers within the specified range (inclusive).
    let fullRangeArray = [];
    // Populate the array with numbers from startVal to endVal.
    for (let currentNum = startVal; currentNum <= endVal; currentNum++) {
        fullRangeArray.push(currentNum);
    }

    // Extract the first 'countLimit' elements from the generated range.
    const initialElements = fullRangeArray.slice(0, countLimit);
    // Extract the last 'countLimit' elements from the generated range.
    const finalElements = fullRangeArray.slice(-countLimit);

    // Create a Set to store unique numbers from both initial and final elements.
    // Using spread syntax to combine arrays into a single iterable for the Set constructor.
    const uniqueNumbersSet = new Set([...initialElements, ...finalElements]);

    // Iterate over the unique numbers in the Set and print each one to the console.
    uniqueNumbersSet.forEach(valueToPrint => console.log(valueToPrint));
};

// Read input from standard input and pass it to the processing function.
// 'fs' module is used for file system operations, 'readFileSync' reads the file synchronously.
// '/dev/stdin' is a common path for standard input on Unix-like systems.
// 'utf-8' specifies the character encoding for the input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
