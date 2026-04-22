/*
 * This is a JavaScript program.
 * It processes an input string 's'.
 * The goal is to determine if the string 's'
 * conforms to a specific pattern.
 */
function   Main (  s  )
{
    // First, check the initial character of the input string.
    // It must strictly be the uppercase letter 'A'.
    if  (  s [  0  ]   !==   'A'  )
    {
        // If the first character is not 'A',
        // print 'WA' (Wrong Answer) to the console.
        console . log  (  'WA'  ) ;
        // Then, immediately exit the function.
        return ; /* Early exit from Main function */
    }


    // Next, extract a specific substring from the input 's'.
    // This substring starts from index 2 and goes up to
    // the second-to-last character (exclusive).
    var   cutStr   =   s . slice  (  2  ,   -1  ) ;

    /*
     * Now, perform a crucial check on the 'cutStr'.
     * It must contain exactly one occurrence of the character 'C'.
     * We check two conditions:
     * 1. 'C' must be present (indexOf !== -1).
     * 2. Splitting by 'C' should result in exactly two parts,
     *    implying only one 'C' existed to split it into two.
     */
    if  (  cutStr . indexOf  (  'C'  )   ===   -1   ||   cutStr . split  (  'C'  ) . length   !==   2  )
    {
        // If 'C' is not found, or if there are multiple 'C's,
        // print 'WA' to indicate a failure in the pattern.
        console . log  (  'WA'  ) ;
        // And, terminate the function's execution here.
        return ; // Function returns due to invalid 'C' count/presence.
    }


    // If the above checks pass, we proceed to construct a new string.
    // This string 'str' is assembled from several parts:
    // - The second character of the original string 's'.
    // - The part of 'cutStr' before the 'C'.
    // - The part of 'cutStr' after the 'C'.
    // - The last character of the original string 's'.
    var   str   =   s [  1  ]   +   cutStr . slice  (  0  ,   cutStr . indexOf  (  'C'  )  )   +
                  cutStr . slice  (  cutStr . indexOf  (  'C'  )   +   1  )   +   s . slice  (  -1  ) ;


    /*
     * Finally, we apply a regular expression test to the newly formed 'str'.
     * The pattern /^[a-z]+$/ checks if 'str' consists *only* of
     * one or more lowercase English letters (a-z).
     */
    if  (  str . match  (  /^[a-z]+$/  )  )
    {
        // If the string 'str' matches the lowercase letter pattern,
        // print 'AC' (Accepted) to signify a successful validation.
        console . log  (  'AC'  ) ;
        // And, exit the function as the processing is complete and successful.
        return ; // All conditions met, successful path.
    }

    // If the 'str' does not match the lowercase letter pattern,
    // this is the final fallback, and it means the input was invalid.
    console . log  (  'WA'  ) ;
} // End of the Main function definition.


// This part of the script handles input and function invocation.
/*
 * It uses Node.js's 'fs' module to read the entire content
 * of standard input (typically '/dev/stdin' on Linux-like systems).
 * The content is read as a UTF-8 encoded string.
 * This string is then passed as an argument to the 'Main' function.
 */
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,   "utf8"  )  ) ;