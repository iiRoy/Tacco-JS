/*
 * This script initializes standard input processing.
 * It's designed to read data from the command line.
 */
process
    .stdin
    .resume(); /* Ensure the standard input stream stays open */

// Set the encoding for the input stream to UTF-8
process
    .stdin
    .setEncoding(
        'utf8' // Using the universal character encoding
    );


// Global variable to accumulate all incoming data chunks
var g_input = ''; // Initialize as an empty string


/*
 * Event listener for 'data' chunks received from stdin.
 * Appends each chunk to the global input string.
 */
process
    .stdin
    .on(
        'data', // Event name: 'data'
        function (
            chunk // The received data chunk
        ) {
            g_input += chunk; // Concatenate the chunk to the existing input
        }
    );


/*
 * Event listener for the 'end' of the input stream.
 * Once all data is received, it processes the accumulated input.
 */
process
    .stdin
    .on(
        'end', // Event name: 'end'
        function () {
            // Split the accumulated input by newlines (both Windows and Unix styles)
            // and pass the resulting array to the Main function for processing.
            Main(
                g_input
                    .split(
                        /\r?\n/ // Regular expression to match newlines
                    )
            );
        }
    );



/*
 * The primary function to solve the problem.
 * It takes an array of strings (lines of input) as its argument.
 */
function Main(
    input // The array of input lines
) {
    // Parse the first line of input as an integer, base 10.
    var capitalN = parseInt(
        input[0], // The first element of the input array
        10 // Radix for parsing, ensures decimal
    );


    // Initialize loop variables to zero.
    var h = 0; // Variable h for the first loop
    var n = 0; // Variable n for the second loop
    var w = 0; // Variable w for the third loop

    // Calculate constant values derived from capitalN.
    // These represent reciprocals or related fractions.
    var a = 4 / capitalN; // Equivalent to 4/N
    var b = 2 / 3500; // Constant value for one part of the equation
    var c = 1 / 3500; // Constant value for another part of the equation

    // Flag to indicate if a solution has been found.
    var isFound = false; // Initially, no solution has been found.


    // Outer loop for variable 'h'.
    // It starts from a calculated lower bound and iterates up to 3499.
    for (
        h = Math.floor(
            1 / (
                a - b // Denominator of the initial calculation
            )
        ); // Initialization of h
        h < 3500; // Condition: h must be less than 3500
        h++ // Increment h in each iteration
    ) {

        // Optimization: If 'a' is too small relative to 'h' and 'b',
        // it's impossible to satisfy the equation, so skip to the next 'h'.
        if (
            a < // Comparison operator
            1 / h + b // Right-hand side of the inequality
        ) {
            continue; // Skip the rest of this iteration and go to the next 'h'
        }


        // Middle loop for variable 'n'.
        // It starts from a calculated lower bound and iterates up to 3499.
        for (
            n = Math.floor(
                1 / (
                    a - 1 / h - c // Denominator for n's initial value
                )
            ); // Initialization of n
            n < 3500; // Condition: n must be less than 3500
            n++ // Increment n in each iteration
        ) {

            // Optimization: If 'a' is too small relative to 'h', 'n', and 'c',
            // it's impossible to satisfy the equation, so skip to the next 'n'.
            if (
                a < // Comparison operator
                1 / h + 1 / n + c // Right-hand side of the inequality
            ) {
                continue; // Skip the rest of this iteration and go to the next 'n'
            }


            // Innermost loop for variable 'w'.
            // It starts from 'n' (to avoid duplicate combinations and ensure w >= n)
            // and iterates up to 3499.
            for (
                w = n; // Initialization of w, starting from n
                w < 3500; // Condition: w must be less than 3500
                w++ // Increment w in each iteration
            ) {

                // Check if the current combination (h, n, w) satisfies the equation.
                if (
                    a === // Strict equality check
                    1 / h + 1 / n + 1 / w // Right-hand side of the equation
                ) {
                    isFound = true; // Set the flag to true, indicating a solution is found
                    break; // Exit the innermost 'w' loop as a solution is found
                }
            }


            // If a solution was found in the innermost loop,
            // no need to continue with the current 'n', so break from this loop.
            if (
                isFound // Check the flag
            ) {
                break; // Exit the middle 'n' loop
            }
        }


        // If a solution was found in the middle loop,
        // no need to continue with the current 'h', so break from this loop.
        if (
            isFound // Check the flag again
        ) {
            break; // Exit the outer 'h' loop
        }
    }


    // Output the found values of h, n, and w, separated by spaces.
    console.log(
        h + ' ' + n + ' ' + w // Concatenated string for output
    );

    // The function returns 0, typically indicating successful execution.
    return 0; // Standard exit code for success
}