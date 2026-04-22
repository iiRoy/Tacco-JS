/*
 * This JavaScript code processes standard input to solve a specific combinatorial problem.
 * It reads lines until "0 0" is encountered, then for each valid line,
 * it performs calculations using a recursive helper function.
 */

// Import the 'fs' (File System) module for input/output operations.
var fs = require( 'fs' );

// Determine the size of the standard input stream.
var length = fs.fstatSync( process.stdin.fd ).size;

// Allocate a buffer to store the entire input data.
var buffer = new Buffer( length );

// Read the data from standard input into the buffer.
// Parameters: file descriptor (stdin), buffer, offset in buffer, length to read, position in file (0 for stdin).
var bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 );

// Convert the buffer content to a UTF-8 string,
// trim any leading/trailing whitespace, and split it into an array of lines.
var input = buffer.toString( 'utf8', 0, bytesRead )
                   .trim()
                   .split( '\n' );

// Call the main function to start the program's execution.
main();


/**
 * The main function orchestrates the processing of each input line.
 * It iterates through the 'input' array, parses each line, and calls
 * the 'conv' helper function to calculate the required pattern.
 */
function main()
{
    // Loop through each line of the input array.
    for ( var i = 0, len = input.length; i < len; i++ )
    {
        // Check if the current input line is the termination signal.
        if ( input[ i ] == '0 0' )
        {
            break; // If "0 0" is found, exit the loop.
        }

        // Split the current line by space to extract numerical components.
        var c = input[ i ].split( ' ' );

        // Assign the parsed components to variables 'n' and 's'.
        // Note: These are initially strings and will be coerced to numbers in arithmetic operations.
        var n = c[ 0 ], s = c[ 1 ];

        // Initialize 'pattern' counter for the current input line.
        var pattern = 0;


        // This loop iterates from 9 down to the value of 'n' (first component of input).
        // It's part of the problem's specific logic to sum up results from 'conv'.
        for ( var a = 9; a >= n; a-- )
        {
            // Call the recursive 'conv' function with specific parameters
            // and add its returned value to the total 'pattern'.
            pattern += conv( a, s - a, n - 1 );
        }

        // Output the final calculated 'pattern' for the current input line to the console.
        console.log( pattern );
    }
}


/**
 * Recursive helper function `conv` to calculate a specific combinatorial pattern.
 * This function likely determines the number of ways to pick 'limit' numbers
 * such that their sum is 'dist', with each number being at most 'start'.
 *
 * @param {number} start - The maximum value allowed for the current number to be chosen.
 * @param {number} dist  - The remaining sum that needs to be achieved.
 * @param {number} limit - The number of elements still remaining to be chosen.
 * @returns {number} The count of valid combinations for the given parameters.
 */
function conv( start, dist, limit )
{
    var result = 0; // Initialize the result for this specific call.

    // Base Case 1: If no more elements need to be chosen (limit is 0)
    // and the remaining sum is also 0, then this is one valid combination.
    if ( limit == 0 && dist == 0 )
    {
        return 1;
    }

    // Base Case 2: If any of the parameters are negative, it indicates an invalid state
    // (e.g., trying to choose a negative number of elements, or achieve a negative sum,
    // or start from a negative value in the iteration).
    if ( start < 0 || dist < 0 || limit < 0 )
    {
        return result; // Return 0, as no valid combinations can be formed.
    }

    // Recursive Step: Iterate downwards to find combinations.
    // The loop chooses the next number 'i' from (start - 1) down to (limit - 1).
    // This choice implies that 'i' is the next number in a decreasing sequence.
    for ( var i = start - 1; i >= limit - 1; i-- )
    {
        // Recursively call 'conv' with updated parameters:
        // - New 'start' is 'i' (the number just chosen).
        // - Remaining 'dist' is reduced by 'i'.
        // - Remaining 'limit' is reduced by 1.
        result += conv( i, dist - i, limit - 1 );
    }

    // Return the accumulated count of valid combinations from this branch.
    return result;
}