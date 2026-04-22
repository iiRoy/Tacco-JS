'use strict'
; /*
 * This is a Type I clone of an original JavaScript program.
 * It processes a list of numbers from standard input,
 * identifies unique elements, and then outputs the count of those unique elements.
 *
 * The 'use strict' directive helps catch common coding errors and "unsafe" actions.
 */

// Define the primary function responsible for the application's logic.
function   main   (   input   )
{
        // Declare a variable 'args' to hold the parsed numeric input.
        // First, the raw input string is split into an array of strings by newline characters.
        // Then, each string element is mapped to its integer representation (base 10).
        var   args   =   input . split   (   '\n'   )   . map   (   ( n )   =>   parseInt   (   n   ,   10   )   )
        ; // End of the input parsing and array assignment.


        // Remove the first element from the 'args' array.
        // This is a common pattern where the first line of input might be a count
        // or some metadata that isn't part of the actual data set to be processed.
        args .   shift   (   )
        ; // The 'shift' operation modifies the array in place.


        // Perform the core logic: count unique elements.
        // 1. Create a 'Set' from 'args' to automatically filter out duplicate numbers.
        // 2. Convert the 'Set' back into an 'Array' because 'Set' objects don't have a 'sort' method directly.
        // 3. Sort the array of unique numbers in ascending order using a custom comparison function.
        // 4. Finally, retrieve the 'length' property of the sorted unique array, which gives the count.
        // 5. Log this final count to the console.
        console . log   (   Array . from   (   new   Set   (   args   )   ) . sort   (   ( a , b )   =>   a   -   b   ) . length   )
        ; // End of the console output statement.
}


// Invoke the main function.
// The input is read from standard input using Node.js's 'fs' module.
// 'readFileSync' is used for synchronous file reading.
// '/dev/stdin' is the standard path for input on Unix-like systems.
// 'utf8' specifies the character encoding for the input.
main   (   require   (   'fs'   ) . readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )
; // The program execution flow concludes here.