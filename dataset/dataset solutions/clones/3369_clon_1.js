/*
 * This JavaScript code processes input data.
 * It's a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

function   Main  (  input  )
{
    // The main function where all processing happens.
    // The 'input' parameter contains the raw string data.

    input   =   input . split (  '\n'  ) ;
    /*
     * The input string is split by newline characters.
     * Each line then becomes an element in the 'input' array.
     * For example, the first line is input[0], the second is input[1], and so on.
     */


    let   h   =   input [ 0 ] . split (  " "  ) [ 1 ] ;
    // 'h' is initialized with the second space-separated value from the first line of input.

    var   w   =   input [ 0 ] . split (  " "  ) [ 2 ] ;
    // 'w' is initialized with the third space-separated value from the first line of input.

    var   ans   =   0 ;
    // 'ans' is a counter, initialized to zero. It will store the final result.

    // A loop iterates through the input lines, starting from the second line (index 1).
    for   (   var   i   =   1   ;   i   <   input . length   ;   i ++   )
    {
        /*
         * Inside the loop, for each subsequent line of input:
         * We extract two values, 'th' and 'tw'.
         */

        var   th   =   input [ i ] . split (  " "  ) [ 0 ] ;
        // 'th' gets the first space-separated value from the current line.

        var   tw   =   input [ i ] . split (  " "  ) [ 1 ] ;
        // 'tw' gets the second space-separated value from the current line.


        // This conditional statement checks if specific criteria are met.
        if   (   -1   <   (   th   -   h   )   &&   -1   <   (   tw   -   w   )   )
        {
            // If both conditions are true, increment the 'ans' counter.
            ans ++ ;
        }
    }

    /*
     * After the loop completes, the final count stored in 'ans'
     * is printed to the console.
     */
    console . log (  ans  ) ;
}

// The Main function is called with the content of '/dev/stdin'.
// The 'fs' module is used to read the file synchronously.
Main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,   'utf8'  )  ) ;