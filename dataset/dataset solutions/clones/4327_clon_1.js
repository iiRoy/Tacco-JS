/*
 * This script processes standard input to perform a calculation.
 * It's designed to read data, then execute a main function.
 */

// Resumes the stdin stream, allowing data to be read.
process.stdin.resume( );

// Sets the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding( 'utf8' );

/*
 * Global variable to accumulate all incoming data from stdin.
 * It is initialized as an empty string.
 */
var    g_input    =    '';

// Event listener for 'data' events on the standard input.
// Each 'chunk' of data received is appended to g_input.
process.stdin.on(
    'data',
    function( chunk )
    {

        // Append the received chunk to the global input string.
        g_input    +=    chunk;

    }
);

/*
 * Event listener for the 'end' event on the standard input.
 * This signifies that all input has been received.
 * The accumulated g_input is split by newlines and passed to the Main function.
 */
process.stdin.on(
    'end',
    function( )
    {

        // Split the accumulated input by common newline patterns and call Main.
        Main( g_input.split( /\r?\n/ ) );

    }
);

/*
 * The primary function that performs the core logic of the program.
 * It takes an array of strings (lines from stdin) as its input.
 */
function     Main( input )
{

    // Parse the first line of input as an integer, base 10, for 'N'.
    var capitalN    =    parseInt( input[0],    10 );

    // Initialize variables for the loops.
    var    h    =    0;
    var    n    =    0;
    var    w    =    0;

    // --- Pre-calculate constant values to optimize loop calculations ---

    // Calculate 'a' based on the input N.
    var    a    =    4    /    capitalN;

    // Calculate 'b' with a fixed divisor.
    var    b    =    2    /    3500;

    // Calculate 'c' with another fixed divisor.
    var    c    =    1    /    3500;

    // Flag to indicate if a solution has been found.
    var    isFound    =    false;

    /*
     * Outer loop for variable 'h'.
     * The starting value is calculated to optimize the search space.
     * Loop continues as long as 'h' is less than 3500.
     */
    for    (    h    =    Math.floor( 1 / ( a    -    b ) );    h    <    3500;    h++    )
    {

        // --- Optimization check for 'h' loop ---
        // If 'a' is too small, no solution can be found with current 'h'.
        if    (    a    <    1    /    h    +    b    )
        {

            // Log a debug message (can be removed in production).
            console.log( 'a' );

            // Skip to the next iteration of the outer loop.
            continue;

        }


        /*
         * Middle loop for variable 'n'.
         * Starts with an optimized value, similar to 'h'.
         * Loop continues as long as 'n' is less than 3500.
         */
        for    (    n    =    Math.floor( 1 / ( a    -    1 / h    -    c ) );    n    <    3500;    n++    )
        {

            // --- Optimization check for 'n' loop ---
            // If 'a' is too small, no solution can be found with current 'h' and 'n'.
            if    (    a    <    1    /    h    +    1    /    n    +    c    )
            {

                // Skip to the next iteration of the middle loop.
                continue;

            }


            /*
             * Innermost loop for variable 'w'.
             * Starts from 'n' to avoid redundant checks (w >= n).
             * Loop continues as long as 'w' is less than 3500.
             */
            for    (    w    =    n;    w    <    3500;    w++    )
            {

                // --- Core condition check ---
                // If the equation holds true, a solution is found.
                if    (    a    ===    1    /    h    +    1    /    n    +    1    /    w    )
                {

                    // Set the flag to true.
                    isFound    =    true;

                    // Exit the innermost loop.
                    break;

                }

            }

            // If a solution was found in the innermost loop, exit the middle loop.
            if    (    isFound    )
            {

                break;

            }

        }

        // If a solution was found in the middle loop, exit the outer loop.
        if    (    isFound    )
        {

            break;

        }

    }

    // Output the values of h, n, and w that satisfy the condition.
    console.log( h    +    ' '    +    n    +    ' '    +    w );

    // Return 0 indicating successful execution.
    return    0;

}