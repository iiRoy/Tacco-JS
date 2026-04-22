const {format} = require('path'); /* This line imports the 'format' function from the 'path' module. It's not actually used in the provided code snippet, but it's part of the original source. */


/*
 * This section is responsible for reading the input data.
 * It uses the Node.js 'fs' module to read a file.
 * The commented-out line shows an alternative for reading from standard input.
 */
let input = require('fs')
    .readFileSync('./sample_e.txt', 'utf8') // Read the content of 'sample_e.txt' as a UTF-8 string.
    .split(/\n| /) // Split the string by newlines or spaces into an array of strings.
    // The following line is commented out in the original, for converting items to integers.
    // .map(item => parseInt(item))
    .slice(0, -1); // Remove the last element from the array, often an empty string due to trailing newline/space.


// Destructuring assignment to extract height, width, and an array of targets.
const [height, width, ..._targets] = input; /* 'height' and 'width' are the first two elements,
                                             ' _targets' collects the rest. */

// The actual target coordinates start from the second element of '_targets'.
const targets = _targets.slice(1); // Skip the first element of _targets, which is often redundant or a count.

let numMap = []; // Initialize an empty array that will represent our 2D grid (map).


// --- Map Creation Section ---
/*
 * This block initializes a 2D array (numMap) with dimensions
 * 'height' x 'width', filling all cells with an initial value of 0.
 */
for (let i = 0; i < height; i++) { // Loop through each row based on the 'height' value.
    numMap.push([]); // Add a new empty array for the current row.

    for (let j = 0; j < width; j++) { // Loop through each column in the current row.
        numMap[i].push(0); // Initialize the cell at [i][j] with a value of 0.
    }
}


// Calculate the number of target pairs. Each target consists of two coordinates (Y, X).
const leng = targets.length / 2;

/*
 * This loop processes each target pair.
 * For each target (Y, X), it simulates an action that affects
 * a row, a column, and then corrects the intersection point.
 */
for (let i = 0; i < leng; i++) {
    // Extract the Y and X coordinates for the current target pair.
    const [_Y, _X] = targets.slice(2 * i, 2 * i + 2);

    // Convert string coordinates to numbers and adjust for 0-based indexing.
    const Y = _Y - 1; // Y-coordinate (row index)
    const X = _X - 1; // X-coordinate (column index)

    // Increment all cells in the target's row (Y).
    for (let j = 0; j < width; j++) {
        numMap[Y][j] += 1;
    }

    // Increment all cells in the target's column (X).
    for (let j = 0; j < height; j++) {
        numMap[j][X] += 1;
    }

    /*
     * The cell at the intersection (Y, X) was incremented twice
     * (once for the row, once for the column).
     * This line decrements it by one to correct for the double increment,
     * ensuring it's only incremented once relative to the other cells.
     */
    numMap[Y][X] -= 1;
}


let Max = 0; // Initialize a variable to store the maximum value found in numMap.

/*
 * This nested loop iterates through the entire numMap
 * to find the highest value stored in any cell.
 */
for (let i = 0; i < height; i++) { // Loop through each row.
    for (let j = 0; j < width; j++) { // Loop through each column in the current row.
        // If the current cell's value is greater than the current 'Max', update 'Max'.
        if (Max < numMap[i][j]) Max = numMap[i][j];
    }
}


// Output the final maximum value found in the map.
console.log(Max); // Print the result to the console.