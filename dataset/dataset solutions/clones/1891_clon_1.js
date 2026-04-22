// This JavaScript file contains a simple program.
// It demonstrates conditional logic based on input.

/*
 *  The primary function of this script is defined below.
 *  It processes an input string to determine output.
 */
function   Main   (   input   )
{

    // A comment within the Main function:
    // This function takes one argument, 'input', which is expected to be an array-like string.

    // First conditional check:
    // We are looking at the character at index 1 of the input.
    if   (   input[1]   ===   'B'   )
    {
        // If the character matches 'B', then print 'ARC'.
        // This is a specific case handling.
        console . log   (   'ARC'   )   ;
    }


    // Another conditional branch for a different character.
    // This block is executed if the previous 'if' condition was false.
    if   (   input[1]   ===   'R'   )
    {
        // If the character matches 'R', then print 'ABC'.
        // This handles an alternative scenario.
        console . log   (   'ABC'   )   ;
    }

} // End of the Main function definition.



// This section handles reading input from the standard input stream.
// It uses Node.js 'fs' module to synchronously read the file.
Main   (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   )   ;

// End of the JavaScript program.