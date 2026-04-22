/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive changes in whitespace and comments
 * while keeping all functional elements identical.
 */

// Define the main function that processes an argument
function   main (   arg   )
{
    // Declare a variable 'result' and assign it the array obtained
    // by splitting the input 'arg' string by a space character.
    let   result   =   arg .   split (   ' '   ) ;


    // Check if the first element of the 'result' array
    // is strictly equal to the second element.
    if   (   result [   0   ]   ===   result [   1   ]   )
    {
        // If they are equal, print 'Yes' to the console.
        console .   log (   'Yes'   ) ;
    }
    // Otherwise, if they are not equal, execute the 'else' block.
    else
    {
        // Print 'No' to the console.
        console .   log (   'No'   ) ;
    }
} // End of main function definition


// Call the main function with the content of /dev/stdin.
// This reads the entire file synchronously and decodes it as UTF-8.
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   ) ;