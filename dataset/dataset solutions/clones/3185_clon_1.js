/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally equivalent file.
 */

// The 'Main' function receives the entire input data as a string.
function   Main ( input )
{

        input   =   input . split ( "\n" ) ;


    var   nm   =   input [ 0 ] . split ( " " ) ;

    // Parse the two initial numbers 'n' and 'm' from the first line of input.
    var   n   =   parseInt ( nm [ 0 ] ,   10 ) ;
    var   m   =   parseInt ( nm [ 1 ] ,   10 ) ;


    var   menu   =   1 ;
    cnt   =   0 ;
    total   =   0 ; // Initialize total counter to zero.

    // Main processing loop: iterates for each 'menu' item, from 1 up to 'm'.
    for   ( menu   =   1 ;   menu   <=   m ;   menu ++ )
    {

            // Inner loop: processes 'n' lines of data for the current 'menu'.
            for   ( var   l   =   1 ;   l   <=   n ;   l ++ )
            {

                // Split the current line 'l' into temporary parts.
                var   tmp   =   input [ l ] . split ( " " ) ;
                var   k   =   parseInt ( tmp [ 0 ] ,   10 ) ;

                // Original comment, kept as is.
                //var Kl = [];

                // Innermost loop: iterates 'k' times for the items on the current line.
                for   ( var   i   =   1 ;   i   <=   k ;   i ++ )
                {
                        var   r   =   parseInt ( tmp [ i ] ,   10 ) ;

                        // Another original comment, preserved.
                        // var menu = 1;cnt=0;

                        // Check if the current item 'r' matches the current 'menu' value.
                        if   ( r   ==   menu )
                        {
                            cnt ++ ; // Increment the counter if there's a match.
                        }
                }
            }

            // After checking all 'n' items for the current 'menu',
            // if 'cnt' equals 'n', it means all 'n' items matched this 'menu'.
            if   ( cnt   ==   n )
            {
                total ++ ; // Increment the overall total.
            }

            // Reset the 'cnt' for the next 'menu' iteration.
            var   cnt   =   0 ;

    } // End of the main 'menu' loop.

    // Output the final calculated total to the console.
    console . log ( total ) ;


} // End of the Main function.


// --- DO NOT MODIFY THE FOLLOWING LINES ---
// This section handles standard input/output operations.
// It reads the entire content from /dev/stdin and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;