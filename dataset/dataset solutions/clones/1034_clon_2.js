const processOptions = {
    sourcePath: '/dev/stdin',
    rowDelimiter: '\n'
};


// Acquire the Node.js File System module to handle file operations.
const fileSystemModule = require('fs');

// Read the entire file content as a UTF-8 string, then segment it into an array of lines
// using the specified row delimiter from our processing options.
const rawContentSegments = fileSystemModule.readFileSync(processOptions.sourcePath, 'utf-8').split(processOptions.rowDelimiter);


/**
 * Determines the count of common elements between two numeric collections.
 * It filters elements from the second collection that are present in the first collection.
 *
 * @param {Array<number>} firstCollection  - The initial array of numbers to check against.
 * @param {Array<number>} secondCollection - The array of numbers to filter.
 * @returns {number} The total number of elements found in both collections.
 */
const determineOverlap = (firstCollection, secondCollection) => {

    return secondCollection.filter(itemA =>
        firstCollection.some(itemB => itemA === itemB)
    ).length;

};


// Extract the second relevant line from the input segments.
// Split it by space characters, then convert each resulting string
// into an integer, forming the first number set.
const firstNumberSet = rawContentSegments[1]
    .split(' ')
    .map(numericString => Number.parseInt(numericString, 10));


// Extract the fourth relevant line from the input segments.
// Similar to the first set, split by spaces and parse each part
// into an integer to form the second number set.
const secondNumberSet = rawContentSegments[3]
    .split(' ')
    .map(numericString => Number.parseInt(numericString, 10));


// Calculate the intersection count using our dedicated function
// and display the final result to the standard output.
console.log(determineOverlap(firstNumberSet, secondNumberSet));