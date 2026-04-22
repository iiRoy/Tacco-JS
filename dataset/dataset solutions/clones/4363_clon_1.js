/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered significantly.
 */
function     main   (   input   )
{
    // The main function begins here.
    // It takes a single string argument, 'input'.

    /*
     * First, we trim any leading or trailing whitespace
     * from the input string to ensure clean processing.
     */
    input    =    input.trim();


    // Now, we process the input string.
    // It's expected to be two numbers separated by a space.
    // We split it by space and then map each part to a Number.
    const   a    =    input.split(" ")    .map(Number)    ;


        /*
         * This is the core logic.
         * We check if the first element (a[0]) is 9
         * OR if the second element (a[1]) is 9.
         */
    if   (   a[0]   ==   9    ||    a[1]   ==   9   )
    {
        // If either condition is true, we print 'Yes'.
        console.log   (   'Yes'   )   ;
    }
        else
        {
            // Otherwise, if neither condition is met, we print 'No'.
            console.log   (   'No'   )   ;
        }

} // End of the main function definition.


/*
 * This section handles the execution of the main function.
 * It reads input from standard input (/dev/stdin) using Node.js's 'fs' module.
 * The input is read as UTF-8 encoded text.
 */
main   (   require("fs")   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of the program.