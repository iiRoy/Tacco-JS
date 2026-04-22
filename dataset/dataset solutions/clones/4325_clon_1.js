// This JavaScript program is designed to solve a specific mathematical problem
// by iterating through possible integer values. It reads a single integer
// from standard input and then attempts to find three other integers (h, n, w)
// that satisfy a given equation.

// Initialize the standard input stream.
process.stdin.resume ( ) ;

// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding( 'utf8' );

/*
 *   A global variable to hold all the input data received from stdin.
 *   Data chunks will be appended to this string until the 'end' event.
 */
var g_input = '';

// Attach an event listener for 'data' events on the standard input.
// This callback function executes every time a chunk of data is available.
process.stdin.on('data', function( chunk ) {
    g_input += chunk; // Concatenate the new data chunk to the accumulating input string.
} ) ;

// Attach an event listener for the 'end' event on the standard input.
// This callback signifies that all input has been received.
process.stdin.on('end', function( ) {
    // Once all input is gathered, split it into an array of lines.
    // The regex /\r?\n/ handles both Windows (\r\n) and Unix (\n) line endings.
    // The resulting array is then passed to the main processing function.
    Main( g_input.split( /\r?\n/ ) ) ;
} ) ;


/**
 *   The core function where the problem-solving logic resides.
 *   It takes an array of strings, which are typically lines read from standard input.
 *
 *   @param {string[]} input - An array containing the lines of input data.
 *   @returns {number} - Returns zero (0) upon successful execution.
 */
function Main( input ) {
    // Parse the first line of input as an integer.
    // The base 10 (decimal) is explicitly specified for safety.
    var capitalN = parseInt( input[0] , 10 ) ;

    // Declare and initialize the variables that will be iterated over
    // to find a solution to the Diophantine equation.
    var h = 0 ;
    var n = 0 ;
    var w = 0 ;

    // Pre-calculate constant parts of the equation to avoid redundant computations
    // inside the loops. The target equation is 4/N = 1/h + 1/n + 1/w.
    var a = 4 / capitalN ;
    var b = 2 / 3500 ; // This constant value is not directly used in the final loop logic,
    var c = 1 / 3500 ; // but it was present in commented-out parts of the original code.

    // A boolean flag to track whether a valid solution (h, n, w) has been found.
    var isFound = false ;

    // The following lines were commented out in the original code,
    // possibly for debugging or exploring different loop bounds:
    // console.log(Math.floor(1 / (a - b)));
    // for (h = Math.floor(1 / (a - b)); h < 3500; h++) {

    // Outer loop for variable 'h'. It iterates from 1 up to 3500.
    for ( h = 1 ; h <= 3500 ; h++ ) {

        // Another commented-out conditional from the original:
        // if (a < 1 / h + b) { continue; }

        // More commented-out lines from the original, related to 'n' loop bounds:
        // console.log(Math.floor(1 / (a - 1 / h - c)));
        // for (n = Math.floor(1 / (a - 1 / h - c)); n < 3500; n++) {

        // Inner loop for variable 'n'. It starts from 'h' to ensure h <= n
        // and iterates up to 3500. This helps avoid duplicate permutations (e.g., (1,2) and (2,1)).
        for ( n = h ; n <= 3500 ; n++ ) {

            // Yet another commented-out conditional from the original source:
            // if (a < 1 / h + 1 / n + c) { continue; }

            // This condition checks if the denominator for 'w' calculation is non-zero.
            // The equation for w is derived from 4/N = 1/h + 1/n + 1/w.
            // Rearranging for 1/w gives 1/w = 4/N - 1/h - 1/n.
            // To find w, we need the denominator of the right side to be non-zero.
            // The denominator is (4hn - Nh - Nn).
            if ( 4 * h * n - capitalN * h - capitalN * n != 0 ) {
                // Calculate 'w' using the rearranged equation.
                // Math.ceil is used as 'w' must be an integer, and it's typically rounded up.
                w = Math.ceil( ( capitalN * h * n ) / ( 4 * h * n - capitalN * h - capitalN * n ) ) ;

                // The original code had a commented-out loop for 'w':
                // for (w = n; w < 3500; w++) {

                // Check if the calculated 'w' is positive and if the main equation holds true
                // for the current triplet (h, n, w). The 'a' constant represents 4/N.
                if ( w > 0 && a === 1 / h + 1 / n + 1 / w ) {
                    isFound = true ; // A valid solution has been identified.
                    break ;          // Exit the current 'n' loop, as we only need one solution.
                }
                // Closing brace for the commented-out 'w' loop:
                // }
            }

            // If a solution was found in the innermost check,
            // break out of the 'n' loop to proceed to the outer loop's break condition.
            if ( isFound ) {
                break ;
            }
        }

        // If a solution was found within the 'n' loop (or its inner conditional),
        // break out of the 'h' loop as well.
        if ( isFound ) {
            break ;
        }
    }

    // Output the values of h, n, and w that satisfy the equation,
    // separated by spaces.
    console.log( h + ' ' + n + ' ' + w ) ;

    // Return 0 to indicate successful program termination.
    return 0 ;
}