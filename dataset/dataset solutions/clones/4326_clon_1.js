/*
 * This script processes standard input to solve a specific mathematical problem.
 * It reads all input data first, then processes it.
 */
process.stdin .resume (); // Ensure the standard input stream stays open.
process.stdin. setEncoding( 'utf8' ); // Set encoding for input data.


var g_input = ''; // Global variable to store all incoming data.

// Event listener for incoming data chunks.
process.stdin.on( 'data', function ( chunk ) {

    g_input += chunk; // Append the current chunk to the global input string.

} );


// Event listener for when the input stream ends.
process.stdin.on( 'end', function () {

    // Split the accumulated input by newlines and pass to the Main function.
    Main( g_input .split( /\r?\n/ ) );

} );


/**
 * Main function to solve the problem based on the input array.
 * @param {string[]} input - An array of strings, where each string is a line from the input.
 */
function Main ( input ) {

    // Parse the first line of input as an integer, base 10.
    var capitalN = parseInt( input[0], 10 );

    /*
     * Initialize variables for the iteration.
     * These represent the denominators in the Egyptian fraction problem.
     */
    var h = 0;
    var n = 0;
    var w = 0;

    // Pre-calculate common terms to optimize the loop condition checks.
    var a = 4 / capitalN;
    var b = 2 / 3500;
    var c = 1 / 3500;

    // Flag to indicate if a solution has been found.
    var isFound = false;

    // The following lines were originally commented out for debugging or alternative approaches.
    // We keep them commented as per Type I clone rules.
    // console.log("Calculated floor for h: " + Math.floor(1 / (a - b)));
    // for (h = Math.floor(1 / (a - b)); h < 3500; h++) {

    // Outer loop for variable 'h'. Iterates from 1 up to (but not including) 3500.
    for ( h = 1; h < 3500; h ++ ) {

        // Optimization: if 'a' is too small relative to 'h' and 'b', skip to next 'h'.
        if ( a < 1 / h + b ) {
            continue; // Move to the next iteration of the 'h' loop.
        }

        // Original commented-out debug lines for 'n' loop start, now rephrased.
        // console.log("Calculated floor for n: " + Math.floor(1 / (a - 1 / h - c)));
        // for (n = Math.floor(1 / (a - 1 / h - c)); n < 3500; n++) {

        // Middle loop for variable 'n'. Starts from 'h' to avoid redundant permutations.
        for ( n = h; n < 3500; n ++ ) {

            // Optimization: if 'a' is too small relative to 'h', 'n', and 'c', skip to next 'n'.
            if ( a < 1 / h + 1 / n + c ) {
                continue; // Move to the next iteration of the 'n' loop.
            }

            // Calculate 'w' based on the current 'h' and 'n' values.
            // This formula is derived from the Egyptian fraction equation: 4/N = 1/h + 1/n + 1/w
            w = Math.ceil( ( capitalN * h * n ) / ( 4 * h * n - capitalN * h - capitalN * n ) );

            // Original commented-out loop for 'w' (this was an alternative approach).
            // for (w = n; w < 3500; w++) {

            // Check if the current combination (h, n, w) satisfies the Egyptian fraction equation.
            if ( a === 1 / h + 1 / n + 1 / w ) {
                isFound = true; // Set flag to true as a solution is found.
                break; // Exit the 'n' loop immediately.
            }

            // } // End of commented-out 'w' loop.

            // If a solution was found in the inner check, break this loop too.
            if ( isFound ) {
                break; // Exit the 'n' loop.
            }

        } // End of inner 'n' loop.

        // If a solution was found in the 'n' loop, break the outer 'h' loop.
        if ( isFound ) {
            break; // Exit the 'h' loop.
        }

    } // End of outer 'h' loop.

    // Output the found values of h, n, and w, separated by spaces.
    console.log( h + ' ' + n + ' ' + w );

    // The function returns 0, typically indicating successful execution.
    return 0;

} // End of Main function.