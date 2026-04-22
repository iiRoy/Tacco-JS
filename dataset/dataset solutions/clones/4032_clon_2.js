const fileSystemModule = require('fs'); // Obtain the file system module
let   rawInputContent = fileSystemModule
    .readFileSync('/dev/stdin', 'utf8');

const numericalMatrix = rawInputContent
    .split('\n')
    .map( (lineSegment) =>
        lineSegment
            .split(' ')
            .map( (numericString) => parseInt(numericString, 10) )
    );

// Compute the minimum value for each horizontal sequence
const horizontalMins = [
    Math.min(numericalMatrix[0][0], numericalMatrix[0][1], numericalMatrix[0][2]),
    Math.min(numericalMatrix[1][0], numericalMatrix[1][1], numericalMatrix[1][2]),
    Math.min(numericalMatrix[2][0], numericalMatrix[2][1], numericalMatrix[2][2])
];

// Compute the minimum value for each vertical sequence
const verticalMins = [
    Math.min(numericalMatrix[0][0], numericalMatrix[1][0], numericalMatrix[2][0]),
    Math.min(numericalMatrix[0][1], numericalMatrix[1][1], numericalMatrix[2][1]),
    Math.min(numericalMatrix[0][2], numericalMatrix[1][2], numericalMatrix[2][2])
];

let finalStatus = 'Yes'; // Assume the condition holds true initially

// Iterate through the matrix cells
for (let rowIdx = 0; finalStatus !== 'No' && rowIdx < 3; rowIdx++)
    for (let colIdx = 0; finalStatus !== 'No' && colIdx < 3; colIdx++)
        // Check if the current cell's value matches the sum of its row and column minimums
        numericalMatrix[rowIdx][colIdx] !== (horizontalMins[rowIdx] + verticalMins[colIdx]) ? finalStatus = 'No' : null;

// Output the conclusive status
console.log(finalStatus);