/* This function processes the entire input data provided. */
function               Main
(
 input
)
{
    /* The input string is expected to be space-separated values. */
    input = input . split ( " " ) ;

    // Using parseInt for converting string parts to decimal integers.
    // The '10' specifies the radix, ensuring a base-10 conversion.
    var   s    =    parseInt ( input [ 0 ] ,   10 ) ;
    var   w    =    parseInt ( input [ 1 ] ,   10 ) ;


    /*
     * Conditional check:
     * If the value of 's' (sheep) is less than or equal to 'w' (wolves),
     * it implies an 'unsafe' condition.
     */
    if   (   s   <=   w   )
    {
        // Outputting the result for the 'unsafe' scenario.
        console.log ( 'unsafe' ) ;
    }
    /*
     * Otherwise, if 's' is strictly greater than 'w',
     * the condition is 'safe'.
     */
    else   if   (   s   >   w   )
    {
        // Outputting the result for the 'safe' scenario.
        console.log ( 'safe' ) ;
    }
}


/*
 * This part of the code is responsible for reading input from standard input
 * and invoking the 'Main' function. It should typically not be modified.
 * It uses Node.js's 'fs' module to read the file at '/dev/stdin' synchronously.
 */
Main   (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   )   ;