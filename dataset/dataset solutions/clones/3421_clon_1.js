/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates how to modify whitespace and add comments
 * without altering the core logic or structure.
 */

// Define the main function that processes the input
function   main(   input   )
{
    // Declare a constant variable X
    // Parse the input string into an integer with base 10
    const   X   =   parseInt(   input   ,   10   )   ;

    // Check if X is equal to 3, or if the number 5 is truthy, or if the number 7 is truthy.
    // Note: The original condition `if(X==3||5||7)` is a common JavaScript pitfall.
    // It evaluates as `if((X==3) || (5) || (7))`. Since 5 and 7 are truthy,
    // this condition will *always* be true, regardless of X's value.
    // However, for a Type I clone, we must preserve this exact logic,
    // even if it's functionally flawed from a typical "check if X is 3, 5, or 7" perspective.
    if  (   X   ==   3   ||   5   ||   7   )
    {
        // If the condition is met, print "YES" to the console
        console.log   (   "YES"   )   ;
    }
    else
    {
        // This 'else' block will practically never be reached due to the truthiness of 5 and 7
        // in the 'if' condition.
        console.log   (   "NO"   )   ; // Output for the 'else' branch
    }
}


// Call the main function with input from standard input.
// This part reads the entire content of /dev/stdin as a UTF-8 string.
main(   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of file.