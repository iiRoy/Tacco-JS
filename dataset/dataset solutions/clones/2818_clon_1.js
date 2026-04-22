/*
 * This JavaScript file defines a primary function, 'Main',
 * which processes an input string to perform a simple comparison.
 * The input is expected to be a space-separated string of numbers.
 *
 * Author: Code Clone Generator
 * Date: Current Date
 * Version: 1.0.0
 */

// Define the main entry point function for our application logic.
// This function takes a single string 'input' as its argument.
function    Main   (   input   )
{

    // Step 1: Split the incoming 'input' string by spaces.
    // This creates an array of string representations of numbers.
    var    inputSeparated    =    input.split ( ' ' ) ;

    // Step 2: Convert each string element in 'inputSeparated' to an integer.
    // The 'map' function applies 'parseInt' to each item, creating a new array of numbers.
    var    int    =    inputSeparated . map (   i   =>   parseInt (   i   )   ) ;


    // Step 3: Perform a conditional check based on the first two elements of the 'int' array.
    // We are comparing the integer at index 0 with the integer at index 1.
    if    (   int [   0   ]    <    int [   1   ]   )
    {
        // If the first number is less than the second number,
        // print '0' to the console. This indicates a specific condition met.
        console.log (   0   ) ;
    }
    else
    {
        // Otherwise (if the first number is not less than the second, i.e.,
        // it's greater than or equal to the second number),
        // print '10' to the console. This indicates the alternative condition.
        console.log (   10   ) ;
    }

} // End of the Main function definition.


// --- Program Execution Start ---
// This section handles reading input from standard input and
// then calls the 'Main' function with that input.

// First, we require the built-in 'fs' (file system) module.
// Then, we use 'readFileSync' to synchronously read the content
// of '/dev/stdin' (standard input on Unix-like systems).
// The content is read as UTF-8 encoded text.
// Finally, the obtained string is passed as an argument to our 'Main' function.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;
// --- Program Execution End ---