/*
 * This is a Type I clone of a JavaScript program.
 *
 * All identifiers, variable names, function names, operators,
 * and expressions remain absolutely unchanged.
 *
 * Only whitespace (spaces, tabs, newlines) and comments
 * have been extensively modified to create visual difference.
 *
 * The program computes the sum of powers of 2 that divide
 * each number in the second line of the input.
 */


function    Main (   input    )    {
    // The Main function begins its execution here.

    // First, process the raw input string.
    input     =     input     .     split     (     "\n"     )     ;     // Split the input string by newline characters.


    // Extract the second line, split by spaces, and convert to numbers.
    var     a     =     input     [     1     ]     .     split     (     ' '     )     .     map     (     n     =>     Number     (     n     )     )     ;


    var     ans     =     0     ;     /* Initialize the answer variable to zero. */


    // Loop through each number in the array 'a'.
    for     (     var     n     of     a     )     {

        // For the current number 'n', repeatedly divide by 2
        // as long as it remains an even number.
        while     (     n     %     2     ===     0     )     {
            // If 'n' is even, perform the division.
            n     =     n     /     2     ;

            // Increment the counter for each division by 2.
            ans     ++     ;
        }    // End of the inner 'while' loop.

    }    // End of the outer 'for' loop.


    // Output the final accumulated count to the console.
    console     .     log     (     ans     )     ;


}     // End of the Main function.


// This section handles reading input from standard input and
// passing it to the Main function for processing.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;     // Call the primary function of the script.