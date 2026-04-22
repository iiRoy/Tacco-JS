/* This is a Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered.
 * All functional aspects remain identical.
 */
function   Main   ( input )
{
    // Declare a variable 'c' and convert the input to a string.
    var   c   =   String   (   input   )   ;


    /*
     * Check if the character 'c' is one of the vowels: a, i, u, e, o.
     * This uses a series of logical OR operations.
     */
    if   (   c   ===   'a'   ||   c   ===   'i'   ||   c   ===   'u'   ||   c   ===   'e'   ||   c   ===   'o'   )
    {
        // If it's a vowel, print 'vowel' to the console.
        console   .   log   (   'vowel'   )   ;
    }
    else
    {
        // Otherwise (if it's not a vowel), print 'consonant'.
        console   .   log   (   'consonant'   )   ;
    }


}
// Call the Main function with input read from standard input.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;