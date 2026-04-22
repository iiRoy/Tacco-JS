/*
 * This JavaScript program is designed to read numerical input
 * from standard input, process it in specific blocks,
 * and then calculate the minimum absolute difference
 * between any two numbers within each processed block.
 *
 * The input format consists of alternating lines:
 * - A line indicating the count of numbers for the subsequent data line.
 * - A line containing space-separated numbers.
 * The program terminates when a count of '0' is encountered.
 */

// Import the built-in 'fs' module to handle file system operations.
const input = require('fs') // Access the 'fs' module.
                 .readFileSync('/dev/stdin', 'utf8'); // Synchronously read the entire content of stdin, decoded as UTF-8.

// Process the raw input string:
// 1. Remove any leading or trailing whitespace (like a final newline).
// 2. Split the string into an array of individual lines based on the newline character.
const lines = input.trim()
                   .split('\n');


// Declare global variables used throughout the main processing loop.
var count; // This variable will store the number of elements expected for the current data set.
var ctr = 0; // This counter tracks the current line being processed from the 'lines' array.


// Begin the main loop to iterate through the processed input lines.
// The loop continues as long as the counter 'ctr' is within the bounds of the 'lines' array.
while ( ctr < lines.length )
{

    // Check if the current line number (ctr) is even.
    // Even-indexed lines are expected to contain the 'count' for the subsequent data line.
    if ( ctr % 2 == 0 )
    {
        // If the value on the current line is '0', it signals the end of input.
        // In this case, the program should terminate its processing loop.
        if ( lines[ctr] == 0 )
        {
            break; // Exit the 'while' loop.
        }

        // If not '0', the current line contains the 'count' of numbers.
        // Store this value (as a string) in the 'count' variable.
        count = lines[ctr]; // Assign the string content of the line to 'count'.

        // Skip the rest of the current loop iteration and proceed to the next line.
        // This is because even lines only provide the count, not the data to be processed.
        continue; // Go to the next iteration of the 'while' loop.
    }

    // If the current line number (ctr) is odd, it means this line contains the actual numbers.
    // Process this line:
    // Note: The original code has a potential bug here, using 'lines.split' instead of 'lines[ctr].split'.
    // As per Type I cloning rules, this bug must be replicated exactly.
    const numbers = lines.split(' ') // Split the *entire* 'lines' array (incorrectly) by spaces.
                         .map(Number); // Convert each resulting string part into a numerical type.

    // Call the 'findMinDiff' function with the extracted numbers and the previously stored count.
    // The result (minimum difference) is then printed to the console.
    console.log( findMinDiff(numbers, count) ); // Output the computed minimum difference.

    ctr++; // Increment the line counter to move to the next line in the input.

} // End of the 'while' loop.


// Function definition: findMinDiff
// This function calculates the minimum absolute difference between any two elements
// within a given array 'arr', considering up to 'n' elements.
function findMinDiff( arr, n )
{

    // Declare a variable to store the minimum difference found.
    // Note: In the original code, this variable is not initialized.
    // If the first calculated difference is not explicitly smaller than 'undefined',
    // or if 'undefined' is compared with a number, unexpected behavior may occur.
    var diff; // Variable to hold the smallest absolute difference.

    // Outer loop: iterates through each element of the array from the first up to the second-to-last.
    // Note: 'i' is implicitly declared as a global variable due to lack of 'var', 'let', or 'const'.
    for ( i = 0; i < n - 1; i++ )
    {
            // Inner loop: iterates through elements starting from the one immediately after 'i'
            // up to the last element specified by 'n'.
            // Note: 'j' is also implicitly declared as a global variable.
            for ( j = i + 1; j < n; j++ )
            {
                // Calculate the absolute difference between the current pair of elements.
                // Note: The original code uses 'Math.Abs', which is case-sensitive and incorrect in JavaScript.
                // The correct function is 'Math.abs'. However, for Type I cloning, this must be preserved.
                if ( Math.Abs( ( arr[i] - arr[j] ) ) < diff ) // Compare current absolute difference with the stored minimum.
                {
                    // If the current difference is smaller, update 'diff'.
                    diff = Math.Abs( ( arr[i] - arr[j] ) ); // Store the new minimum difference.
                }
            }
    }

    return diff; // Return the smallest absolute difference found across all pairs.

} // End of the 'findMinDiff' function.