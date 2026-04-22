/*
 * This is a Type I clone of the original JavaScript code.
 * The purpose is to demonstrate variations in whitespace and comments
 * while maintaining exact logical and structural identity.
 */


// The 'input' variable receives all input data as a single string.
function  Main ( input )   {

    // Parse the first line of input to get the integer 'n'.
    var n  =  parseInt ( input . split ( "\n" ) [0] ) ;

    // Parse the second line of input, split by spaces, to get array 'a'.
    var  a  =  input . split ( "\n" ) [1] . split ( " " ) ;

    // Initialize an array 'list' of size 'n'.
    var list = Array ( n ) ;

    // Initialize an empty array 'b' to store results.
    var  b  =  [ ] ;


    // Loop backwards from 'n' down to 1 (inclusive).
    for ( var  i = n ;  i > 0 ;  i-- ) {

        var cnt = 0 ;  /* Initialize a counter for each iteration of the outer loop. */

        // Inner loop: Iterate 'j' from 2 upwards as long as i*j is less than n.
        for ( var  j = 2 ;  i * j < n ;  j++ ) {

            // Accumulate values from 'list' based on product i*j.
            cnt += list [ i * j ] ;

        } // End of inner loop for 'j'.


        // Calculate the value for list[i-1] based on 'cnt', 'a[i-1]', and modulo 2.
        list [ i - 1 ] = ( cnt + parseInt ( a [ i - 1 ] ) ) % 2 ;

        // If the calculated value is 1, push 'i' into array 'b'.
        if ( list [ i - 1 ] == 1 ) b . push ( i ) ;

    } // End of outer loop for 'i'.


    // Output the length of array 'b'.
    console . log ( b . length ) ;

    // If 'b' is not empty, output its elements joined by spaces.
    if ( b . length ) console . log ( b . join ( " " ) ) ;

} // End of Main function.


/*
 * DO NOT EDIT THE FOLLOWING LINE.
 * This part handles standard input/output and calls the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;