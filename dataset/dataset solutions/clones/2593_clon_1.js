/*
 * This JavaScript file contains a function to process numerical input
 * and compute a specific result based on a loop.
 *
 * It demonstrates reading input from standard input, parsing numbers,
 * and performing arithmetic operations within a controlled loop structure.
 *
 * The primary goal is to calculate an incrementing counter based on
 * a range defined by two input numbers and a specific step value.
 */

// Define the main function that orchestrates the program's logic.
// It accepts 'input' which is expected to be an array of strings (lines).
function   main (   input   )
{
    // Declare and initialize variable 'a'.
    // It extracts the first number from the first line of the input array.
    // `input[0]` gets the first line.
    // `.split(" ")` divides it into parts by space.
    // `[0]` selects the first part.
    // `- 0` is a common JavaScript idiom to convert a string to a number.
    var   a   =   input[0] . split (   " "   ) [0]   -   0   ;

    // Declare and initialize variable 'b'.
    // This extracts the second number from the same first line of the input array.
    // The process is identical to 'a', but it takes the second part `[1]`.
    var   b   =   input[0] . split (   " "   ) [1]   -   0   ;


    // Initialize the 'ans' variable, which will store the final computed answer.
    // It starts with a base value of 1.
    var   ans   =   1   ;

    /*
     * Begin a 'for' loop to iterate and increment 'ans'.
     * The loop variable 'i' is initialized with the value of 'a'.
     * The loop continues as long as 'i' is strictly less than 'b'.
     * In each iteration, 'i' is incremented by `a - 1`.
     */
    for   (   var   i   =   a   ;   i   <   b   ;   i   +=   a   -   1   )
    {
        // Increment the 'ans' counter by one in each pass of the loop.
        ans   ++   ;
    }

    // Output the final calculated value of 'ans' to the standard output (console).
    console . log (   ans   )   ;
}

// --- Main execution block of the script ---

// This line reads the input from '/dev/stdin' (standard input on POSIX systems).
// `require('fs')` loads the Node.js file system module.
// `.readFileSync('/dev/stdin', 'utf8')` reads the entire file synchronously as UTF-8.
// `.split("\n")` then splits the read content into an array of strings, one for each line.
// Finally, this array of lines is passed as an argument to the 'main' function to begin processing.
main   (   require (   'fs'   ) . readFileSync (   '/dev/stdin'   ,   'utf8'   ) . split (   "\n"   )   )   ;

// --- End of script ---