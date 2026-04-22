/* This is a Type I clone of a JavaScript program. */
/* The purpose of this clone is to demonstrate extensive variations in whitespace and comments, */
/* while strictly preserving all original code tokens and their order. */


function   main  (   input   )   // Definition of the primary function named 'main', accepting one argument 'input'.
{
    // Start of the main function's execution block.

    input   =   input.trim();   // First, the input string is processed to remove any leading or trailing whitespace characters.

    // A constant variable 's' is declared to hold the result of splitting the trimmed input.
    const   s    =    input.split( '' );   // The trimmed input string is then split into an array of individual characters.


    /*
     * Below, we calculate the occurrences of specific characters ('a', 'b', 'c')
     * within the character array 's'.
     * The regex `/[char]/g` finds all occurrences, `|| []` handles cases where no match is found
     * (returning an empty array instead of null), and `.length` gives the count.
     */

    var   count1   =   ( s.match( /a/g )   ||   [] ).length;   // Counts the total number of 'a' characters.


    var   count2   =   ( s.match( /b/g )   ||   [] ).length;   // Counts the total number of 'b' characters.


    var   count3   =   ( s.match( /c/g )   ||   [] ).length;   // Counts the total number of 'c' characters.


    // The final step: print the result based on the character counts.
    console.log
    (
        // Conditional (ternary) operator checks if all three counts are exactly 1.
        (
               count1   ==   1
            && count2   ==   1
            && count3   ==   1
        )
        ?   'Yes'   // If the condition is true (all counts are 1), output 'Yes'.
        :   'No'    // Otherwise (if any count is not 1), output 'No'.
    );

}   // End of the 'main' function.


// This section handles the execution of the script.
// It reads input from standard input and passes it to the 'main' function.
main (
       require ( 'fs' )   // Accesses the Node.js 'fs' (file system) module.
         . readFileSync (   // Calls the 'readFileSync' method to synchronously read a file.
           '/dev/stdin',   // Specifies the file path for standard input.
           'utf8'          // Specifies the encoding for reading the file content.
         )
); // The 'main' function is invoked with the content read from stdin.