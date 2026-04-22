/*
 * This JavaScript code reads input from /dev/stdin,
 * processes it to find the minimum difference between numbers.
 * It's structured to handle multiple test cases coming from standard input.
 *
 * The input format is expected to be:
 *   - An integer 'count' (number of elements in the next line)
 *   - A line of 'count' space-separated numbers
 *   - This pattern repeats until 'count' is 0, which signals termination.
 */

//  Require the 'fs' (file system) module to read from standard input.
const input = require('fs')
    .readFileSync(
        '/dev/stdin', // Path to the standard input file.
        'utf8'        // Specify UTF-8 encoding for the input.
    );


// Process the raw input string:
// 1. Remove any leading or trailing whitespace.
// 2. Split the string into an array of lines based on the newline character.
const lines = input
    .trim()
    .split('\n');


// Declare global-like variables used in the main processing loop.
var count; // This variable will store the number of elements for each test case.
var ctr = 0; // This counter tracks the current line being processed from the 'lines' array.


// The main loop that processes input lines for test cases.
// It uses a do-while structure to ensure at least one iteration.
do {

    // Check if the current line index is even. Even lines are expected to contain the 'count' of numbers.
    if ( ctr % 2 == 0 )
    {
        // If the 'count' line contains '0', it's the termination signal.
        if ( lines[ctr] == 0 )
        {
            break; // Exit the do-while loop.
        }

        // Parse the current line as the 'count' for the next set of numbers.
        count = lines[ctr];
        // Move to the next line immediately, as the odd line will contain the actual numbers.
        // The 'ctr' increment happens at the end of the loop, but 'continue' skips the rest of this iteration.
        continue;
    }

    // If the current line index is odd, it contains the actual numbers for the current test case.
    // Split the line by spaces and convert each part to a number.
    const numbers = lines[ctr]
        .split(' ')     // Split the string by spaces into an array of strings.
        .map(Number);   // Convert each string element in the array to a numeric type.


    // Call the 'findMinDiff' function with the parsed numbers and the stored 'count'.
    // Log the result to the console.
    console.log( findMinDiff( numbers, count ) );

    // Increment the line counter to move to the next input line.
    ctr++;

}
while ( ctr < lines.length ); // Continue looping as long as 'ctr' is within the bounds of the 'lines' array.


/**
 * @function findMinDiff
 * @description Calculates the minimum absolute difference between any two elements in an array.
 * @param {Array<number>} arr - The input array of numbers.
 * @param {number} n - The number of elements to consider in the array (should be arr.length).
 * @returns {number} The minimum absolute difference found.
 *
 * Note: The 'diff' variable is not initialized to a specific value.
 * In some JavaScript environments, comparing an undefined variable with a number
 * might behave unexpectedly or lead to 'diff' not being updated correctly
 * if the initial comparison fails. A robust implementation would initialize 'diff'
 * to a very large number or the difference of the first pair.
 * Also, 'Math.Abs' should typically be 'Math.abs' (lowercase 'a') in standard JavaScript.
 */
function findMinDiff ( arr, n )
{

    // Declare a variable to store the minimum difference found.
    var diff;


    // Outer loop: Iterate through the array from the first element up to the second-to-last element.
    for ( i = 0; i < n - 1; i++ )
    {
        // Inner loop: Iterate from the element immediately after 'i' to the last element.
        // This ensures every unique pair (arr[i], arr[j]) is considered once.
        for ( j = i + 1; j < n; j++ )
        {
            // Calculate the absolute difference between the current pair of elements.
            // If this difference is smaller than the currently stored 'diff', or if 'diff'
            // is still undefined (first comparison), update 'diff'.
            if ( Math.Abs( ( arr[i] - arr[j] ) ) < diff )
            {
                // Update 'diff' with the new minimum absolute difference.
                diff = Math.Abs( ( arr[i] - arr[j] ) );
            }
        }
    }
    // Return the smallest absolute difference found across all pairs.
    return diff;
}