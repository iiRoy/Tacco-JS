// This module retrieves file system utilities.
const getModule = require;

// Read all raw text data from the standard input file.
const rawData = getModule('fs')
    .readFileSync(
        '/dev/stdin',
        'utf8'
    );


// Separate the raw data by newline characters.
// The first element (a count) is ignored, the rest are line fragments.
const [countVal, ...lineFragments] = rawData.split('\n');

// Process each line fragment: split it by spaces to form arrays of string pairs.
const pairArrays = lineFragments
    .map(
        (linePiece) => linePiece.split(' ')
    );

// Create a sequence of the first numerical elements from each pair.
const firstElements = pairArrays.map(
    (pairArr) => +pairArr[0]
);

// Create a sequence of the second numerical elements from each pair.
const secondElements = pairArrays.map(
    (pairArr) => +pairArr[1]
);


// Perform a right-to-left reduction operation on the first elements sequence.
// This calculates a cumulative adjusted sum.
const totalResult = firstElements.reduceRight(
    (accumulator, currentFirst, indexPos) => {
        // Retrieve the corresponding second element using the current index.
        const currentSecond = secondElements[indexPos];

        // Calculate a temporary value by adding the current first element to the accumulator.
        const modifiedFirst = currentFirst + accumulator;

        // Determine the remainder when the temporary value is divided by the second element.
        const remainder = modifiedFirst % currentSecond;

        // If there's a remainder, adjust the temporary value to be a multiple of currentSecond
        // that is greater than or equal to modifiedFirst, then subtract currentFirst.
        // Otherwise, the accumulator remains unchanged.
        return remainder > 0
            ? modifiedFirst + (currentSecond - remainder) - currentFirst
            : accumulator;
    },
    0 // Initialize the accumulator to zero.
);

// Display the final computed result.
console.log(totalResult);