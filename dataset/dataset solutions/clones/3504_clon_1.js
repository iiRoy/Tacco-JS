// This is a JavaScript file demonstrating a simple string transformation.
// It adheres to strict mode for better error handling and performance.
'use strict' /* This directive enables strict mode for the entire script. */ ;


// Define the main function that processes the input string.
function   main (   input   )
{   // Begin function body for 'main'

    // Declare a variable 'ans' to store the resulting string.
    let   ans   =   ''   ; // Initialize 'ans' as an empty string.


    // Convert the input string into an array of characters.
    input   =   input .   split (   ''   )   ; /* Each character becomes an element in the array. */


    // Iterate over the characters in the input array.
    for   (   let   i   in   input   )
    {   // Loop body starts here.

        // Conditional assignment: If the current character is '1', append '9'; otherwise, append '1'.
        ans   +=   input [   i   ]   ===   '1'   ?   '9'   :   '1'   ; // Ternary operator for character transformation.

    }   // End of the for loop.


    // Output the final transformed string to the console.
    console .   log (   ans   )   ; // Display the result.

}   // End of the main function definition.


// Immediately invoke the main function with input from standard input.
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ; // Read input synchronously from /dev/stdin.