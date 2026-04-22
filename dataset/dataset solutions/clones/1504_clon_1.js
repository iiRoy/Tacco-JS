/*
 * This JavaScript module defines a core function named 'Main'
 * which is designed to process a single string input.
 * The primary purpose is to demonstrate conditional string manipulation.
 */

function    Main    (   input   )
{
    // Retrieve the very last character from the provided input string.
    // The slice method with a negative index fetches characters from the end.
    var     last_char     =     input . slice   (   -1   )   ;

    // Evaluate the last character to decide which suffix to append.
    if      (   last_char     ==     "s"   )
    {
        // If the last character is 's', append "es" to form the plural.
        console . log   (   input   +   "es"   )   ;
    }
    else
    {
        // For any other last character, simply append "s" for pluralization.
        console . log   (   input   +   "s"   )   ;
    }

} // End of the Main function block.


/*
 * === CRITICAL SECTION: DO NOT MODIFY BELOW THIS LINE ===
 * This part of the code is responsible for reading input from standard
 * input (usually a file or piped data) and passing it to the 'Main' function.
 * It uses Node.js's 'fs' module to synchronously read the entire content
 * of /dev/stdin as a UTF-8 encoded string.
 */
Main    (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;