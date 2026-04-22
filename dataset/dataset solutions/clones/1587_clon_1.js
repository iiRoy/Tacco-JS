/*
 * This script processes input data from standard input to solve a specific problem.
 * It involves reading dimensions (height, width) and a list of target coordinates.
 * The core logic calculates the frequency of targets appearing in each row and column,
 * identifies the rows and columns with the maximum frequencies, and then checks
 * for a specific condition related to these maximum frequency rows/columns and the targets.
 * The final output is a calculated sum based on these frequencies.
 */

// Import the 'fs' (file system) module, which is necessary for reading input files.
let input = require('fs')
              .readFileSync('/dev/stdin', 'utf8') // Read the content of '/dev/stdin' as a UTF-8 string.
              /*
               * For local testing or debugging purposes, one might uncomment and use
               * the following line instead to read from a sample file:
               * .readFileSync('./sample_e.txt', 'utf8')
               */
              .split(/\n| /) // Split the input string into an array of substrings
                             // using either newline characters or spaces as delimiters.
              .slice(0, -1)  // Remove the last element of the array. This is often
                             // done to handle trailing newlines which might result in
                             // an empty string at the end after splitting.
              .map(item => parseInt(item)) // Convert each string item in the array to an integer.
                                           // This assumes all input components are valid numbers.


// Destructure the processed input array.
// The first element becomes 'height', the second 'width'.
// All remaining elements are collected into an array named '_targets'.
const [ height, width, ..._targets ] = input;

// Initialize an empty array to store the target coordinates in a more structured format
// (e.g., as arrays of [x, y] pairs).
const targets = [ ];

// Loop through the '_targets' array, which contains raw flattened coordinates.
// We start from index 1 because the first two elements of the original input
// were 'height' and 'width', and '_targets' starts after them.
// We increment by 2 to process coordinates as pairs (x, y).
for ( let i = 1; i < _targets.length; i += 2 ) {
    // Add a new target pair [x, y] to the 'targets' array.
    // _targets[i] is the x-coordinate, _targets[i+1] is the y-coordinate.
    targets.push([ _targets[i], _targets[i + 1] ]);
}


// Initialize two arrays, 'hlist' and 'wlist', to count occurrences.
// 'hlist' will store counts for each row (height index), initialized with zeros.
// 'wlist' will store counts for each column (width index), also initialized with zeros.
let hlist = new Array(height).fill(0);
let wlist = new Array(width).fill(0);


// Iterate over each target coordinate pair.
for ( let i = 0; i < targets.length; i++ ) {
    // For the current target [x, y]:
    // Increment the count for the row corresponding to x.
    // We subtract 1 from x because target coordinates are typically 1-based,
    // while array indices are 0-based.
    hlist[targets[i][0] - 1]++;
    // Increment the count for the column corresponding to y.
    // Similarly, subtract 1 from y for 0-based indexing.
    wlist[targets[i][1] - 1]++;
}


// Find the maximum count in the 'hlist' (maximum number of targets in any single row).
const hmax = Math.max(...hlist);
// Initialize an array to store the 0-based indices of all rows that have the 'hmax' count.
const hindexes = [ ];

// Loop through each possible row index.
for ( let i = 0; i < height; i++ ) {
    // If the count for the current row is equal to 'hmax',
    if ( hlist[i] === hmax ) {
        hindexes.push(i); // Add this row's 0-based index to 'hindexes'.
    }
}


// Find the maximum count in the 'wlist' (maximum number of targets in any single column).
const wmax = Math.max(...wlist);
// Initialize an array to store the 0-based indices of all columns that have the 'wmax' count.
const windexes = [ ];

// Loop through each possible column index.
for ( let i = 0; i < width; i++ ) {
    // If the count for the current column is equal to 'wmax',
    if ( wlist[i] === wmax ) {
        windexes.push(i); // Add this column's 0-based index to 'windexes'.
    }
}


// Iterate over each index in 'hindexes' (representing a row with maximum targets).
for ( hitem of hindexes ) {
    // For each 'hitem', iterate over each index in 'windexes' (representing a column with maximum targets).
    for ( witem of windexes ) {
        // Check if there is NO target point in the 'targets' array that matches
        // the current combination of (hitem + 1, witem + 1).
        // We add 1 to 'hitem' and 'witem' to convert them back to 1-based coordinates
        // for comparison with the 'targets' array.
        if ( !targets.some(item => item[0] === hitem + 1 && item[1] === witem + 1) ) {
            // If such a combination (a row with hmax and a column with wmax that does NOT
            // contain a target) is found, then the result is simply the sum of hmax and wmax.
            console.log(hmax + wmax);
            return; // Exit the script immediately after printing the result.
        }
    }
}

// If the script reaches this point, it means that for every combination of a
// maximum-frequency row and a maximum-frequency column, there *is* at least one
// target point located at their intersection. In this specific scenario,
// the result is hmax + wmax - 1.
console.log(hmax + wmax - 1);