// This function calculates a specific variation of the Levenshtein distance between two input strings.
// It takes two string arguments, 'firstString' and 'secondString'.
function calculateLevenshteinDistance(firstString, secondString) {
    // Initialize a two-dimensional array (matrix) to store the computed distances.
    // Using 'let' for block-scoped variable declarations.
    let distanceMatrix = new Array();

    // Populate the distance matrix with initial dimensions (firstString.length + 1) by (secondString.length + 1).
    // Each cell is initially set to a value of zero.
    for (let rowIdx = 0; rowIdx < firstString.length + 1; rowIdx++) {
        let currentRow = new Array(); // Create a new array to represent the current row.
        for (let colIdx = 0; colIdx < secondString.length + 1; colIdx++) {
            currentRow.push(0); // Add a zero to the end of the current row.
        }
        distanceMatrix.push(currentRow); // Append the completed row to the main distance matrix.
    }

    // Initialize the first column of the distance matrix.
    // The cost of transforming an empty string to a string of length 'rowIdx' is 'rowIdx'.
    for (let rowIdx = 0; rowIdx < firstString.length + 1; rowIdx++) {
        distanceMatrix[rowIdx][0] = rowIdx;
    }

    // Initialize the first row of the distance matrix.
    // The cost of transforming a string of length 'colIdx' to an empty string is 'colIdx'.
    for (let colIdx = 0; colIdx < secondString.length + 1; colIdx++) {
        distanceMatrix[0][colIdx] = colIdx;
    }

    // Iterate through the remaining cells of the matrix to calculate the Levenshtein distances.
    // The loops start from index 1 because the first row and column are already initialized.
    for (let rowIdx = 1; rowIdx < firstString.length + 1; rowIdx++) {
        for (let colIdx = 1; colIdx < secondString.length + 1; colIdx++) {
            // Compare the characters at the current positions (rowIdx - 1) and (colIdx - 1).
            if (firstString.charAt(rowIdx - 1) === secondString.charAt(colIdx - 1)) {
                // If the characters are identical, the cost is the minimum of deletion or insertion.
                // This specific implementation does not consider the diagonal (substitution cost 0) in this case.
                distanceMatrix[rowIdx][colIdx] = Math.min(
                    distanceMatrix[rowIdx - 1][colIdx] + 1, // Cost of deleting a character from the first string.
                    distanceMatrix[rowIdx][colIdx - 1] + 1   // Cost of inserting a character into the first string.
                );
            } else {
                // If the characters are different, consider deletion, insertion, and substitution.
                // Note: The substitution cost (distanceMatrix[rowIdx - 1][colIdx - 1]) is added without a +1 here,
                // which is a specific characteristic of this algorithm's implementation.
                distanceMatrix[rowIdx][colIdx] = Math.min(
                    distanceMatrix[rowIdx - 1][colIdx] + 1,     // Cost of deleting a character.
                    distanceMatrix[rowIdx][colIdx - 1] + 1,     // Cost of inserting a character.
                    distanceMatrix[rowIdx - 1][colIdx - 1]      // Cost of substituting a character.
                );
            }
        }
    }
    // The final Levenshtein distance is located in the bottom-right cell of the matrix.
    return distanceMatrix[firstString.length][secondString.length];
}

// Import the Node.js file system module to handle file operations.
const fileSystemModule = require('fs');

// Read the entire content from standard input synchronously.
// '/dev/stdin' is the standard path for reading from stdin in Node.js on Unix-like systems.
// 'utf8' specifies the character encoding for the input.
let fileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Split the read content into an array of strings, using the newline character as a delimiter.
// This assumes that each string to be compared is provided on a separate line.
let inputLines = fileContent.split('\n');

// Call the 'calculateLevenshteinDistance' function with the first two lines from the input.
// The result (the calculated distance) is then printed to the console.
console.log(calculateLevenshteinDistance(inputLines[0], inputLines[1]));
