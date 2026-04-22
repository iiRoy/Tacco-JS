/*
 * This is a Type I clone of an existing JavaScript program.
 * It processes input data to count occurrences.
 *
 * Changes are strictly limited to whitespace and comments,
 * ensuring logical and structural equivalence to the original.
 */
function Main ( input )
{
    // First, we process the raw input string.
    // It's expected to be a multi-line string.
    input  =  input.split ( "\n" ) ;

    // Parse the first number from the input, which represents 'n'.
    var   n   =   parseInt ( input [ 0 ] ,   10 ) ;

    // Parse the third number from the input, which represents 'q'.
    var   q   =   parseInt ( input [ 2 ] ,   10 ) ;


    // Split the second line of input by spaces to get an array of strings.
    input [ 1 ]   =   input [ 1 ].split ( " " ) ;

    // Split the fourth line of input by spaces to get another array of strings.
    input [ 3 ]   =   input [ 3 ].split ( " " ) ;

    // Declare two arrays, 's' and 't', with sizes 'n' and 'q' respectively.
    var   s   =   Array ( n ) ,   t   =   Array ( q ) ;

    /*
     * Populate array 's' by parsing integers from the second line of input.
     * This loop iterates 'n' times.
     */
    for ( var   i   =   0 ;   i   <   n ;   i ++ )
    {
        s [ i ]   =   parseInt ( input [ 1 ] [ i ] ,   10 ) ;
    }

    // A blank line for visual separation.

    /*
     * Populate array 't' by parsing integers from the fourth line of input.
     * This loop iterates 'q' times.
     */
    for ( var   i   =   0 ;   i   <   q ;   i ++ )
    {
        t [ i ]   =   parseInt ( input [ 3 ] [ i ] ,   10 ) ;
    }

    // Initialize a counter variable. This will store the final result.
    var   count   =   0 ;


    // Main processing loop: iterate through each element in array 't'.
    for ( var   i   =   0 ;   i   <   q ;   i ++ )
    {
        // Declare a loop counter 'j' for the inner loop.
        var   j ;

        // Inner loop: search for the current element of 't' in array 's'.
        for ( j   =   0 ;   j   <   n ;   j ++ )
        {
            // If a match is found, we break out of the inner loop.
            if ( s [ j ]   ==   t [ i ] )
                 break ; // Exit inner loop
        }

        // After the inner loop, check if 'j' is less than 'n'.
        // If it is, it means a match was found (because 'break' was executed).
        if ( j   <   n )
            count ++ ; // Increment the counter if a match was found.
    }

    // Finally, print the total count to the console.
    console.log ( count ) ;
}

// Invoke the Main function with input read from standard input.
Main ( require ( "fs" ).readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;
/* End of file */