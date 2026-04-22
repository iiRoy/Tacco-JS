/* This directive enables strict mode for the entire script. */ "use strict" ;

// Define the main function that processes the input.
function Main ( input )
{

    /* Declare a variable to store input lines. */ let lines = input . split ( "\n" ) ; // Split the input string by newline characters.


    let    ab   =    [ ] ; /* Initialize an empty array to hold parsed number pairs. */

    // Loop three times to process three lines of input.
    for ( let n = 0 ; n < 3 ; n ++ )
    {
        /* For each line, split by whitespace, convert parts to numbers, and push to 'ab'. */
        ab . push ( lines[n] . split ( /\s/ ) . map ( ( v ) => v - 0 ) ) ;
    } // End of the first processing loop.


    // Initialize a counter array for numbers 1 through 5 (index 0 unused, or just padding).
    let cnt = [ 0 , 0 , 0 , 0 , 0 ] ;


    /* Second loop: iterate through the 'ab' array to populate counts. */
    for ( let n = 0 ; n < 3 ; n ++ )
    {
        // Increment count for the first number in the pair.
        cnt [ ab [ n ] [ 0 ] ] += 1 ;

        cnt [ ab [ n ] [ 1 ] ] += 1 ; /* Increment count for the second number in the pair. */
    } // End of the second counting loop.


    // Check if no count is exactly 3, then print "YES", otherwise "NO".
    console . log ( cnt . every ( function ( value ) { return value != 3 ; } ) ? "YES" : "NO" ) ;
} // End of Main function definition.

// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;