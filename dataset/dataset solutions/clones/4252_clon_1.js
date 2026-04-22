/*
 * This is a demonstration of a Type I code clone.
 * It maintains exact structural and logical equivalence,
 * only varying in whitespace and comments.
 *
 * The purpose is to show how extensive changes to non-semantic elements
 * can make code look different while being functionally identical.
 */

// Define the primary function responsible for processing the input.
// This function takes a single argument, 'input', which is expected to be a string.
function   main (   input   )
{

    // Declare a constant variable named 'a'.
    // It stores the result of processing the 'input' string:
    // 1. Trimming leading/trailing whitespace.
    // 2. Splitting the string into an array of lines based on the newline character.
    const   a    =    input . trim ( ) . split ( '\n' ) ;


    // Declare another constant variable named 'ｂ' (note: this is a full-width 'b' character).
    // It stores the result of processing the 'input' string differently:
    // 1. Trimming leading/trailing whitespace.
    // 2. Splitting the string into an array of individual characters.
    const   ｂ    =    input . trim ( ) . split ( '' ) ;

    // Start a conditional block.
    // The condition checks if the value of 'a' is strictly equal to
    // the result of reversing the array 'ｂ' and then joining its elements back into a string.
    if (   a   ==   ｂ . reverse ( ) . join ( "" )   )
    {

        // If the condition evaluates to true, print 'YES' to the console.
        console . log ( 'YES' ) ;

    }   else   { // If the condition is false, execute the 'else' block.

        // Print 'NO' to the console.
        console . log ( 'NO' ) ;

    }

} // End of the 'main' function definition.


// This line executes the 'main' function immediately.
// It reads the entire content of the standard input stream ('/dev/stdin').
// The 'fs' module is used for file system operations, and 'readFileSync' reads the file synchronously.
// The content is read as a UTF-8 encoded string and passed as the 'input' argument to 'main'.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;