/*
 * This JavaScript file defines a program that processes numerical input.
 * It reads several numbers from standard input and performs a specific
 * comparison based on these values.
 *
 * The program is designed to output a simple message ('Yay!' or ':(')
 * depending on the outcome of the comparison.
 */

// Define the primary function responsible for handling the application's logic.
function   main (   input   )
{
    // Declare a constant variable 'tmp' to hold the parsed numerical data.
    // The input string is first cleaned, then segmented into individual lines,
    // and finally, each segment is converted into an integer.
    const   tmp   =   input
        .trim(   ) // Remove any leading or trailing whitespace from the input string.
        .split(   '\n'   ) // Divide the string into an array of substrings using newline characters as delimiters.
        .map(   (   n   )   =>   parseInt(   n,   10   )   ) ; // Iterate over the array and convert each string element to an integer (base 10).

    // Evaluate a conditional expression involving specific elements from the 'tmp' array.
    // The condition checks if the difference between the fifth and first elements (0-indexed)
    // is less than or equal to the sixth element.
    if   (   tmp[4]   -   tmp[0]   <=   tmp[5]   )
    {
        // If the condition evaluates to true, print a positive affirmation to the console.
        console.log(   'Yay!'   ) ;
    }
    else
    {
        // If the condition evaluates to false, print a negative expression to the console.
        console.log(   ':('   ) ;
    }
} // End of the 'main' function definition.

// This statement initiates the program by calling the 'main' function.
// It reads the content of '/dev/stdin' synchronously using Node.js's 'fs' module,
// interpreting the content as a UTF-8 encoded string, and passes it as an argument
// to the 'main' function.
main(   require(   'fs'   ) . readFileSync(   '/dev/stdin',   'utf8'   )   ) ;