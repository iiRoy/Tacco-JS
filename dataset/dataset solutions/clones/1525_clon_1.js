/* This is a Type I clone demonstrating extensive whitespace and comment variations. */
"use strict" ; /* Enforce strict mode for cleaner code. */


function Main( input )
{
    // Process the raw input string.
    input = input . trim() . split( "\n" ) ;


    /*
     * The following block parses the initial line of input data.
     * The original comment about 'parseInt' has been removed as it's not directly applied to arr elements here.
     * Values a, b, c, and d will be implicitly coerced to numbers during multiplication.
     */
    const arr = input[0] . split( " " , 4 ) ; // Split the first line by space, limiting to 4 parts.

    let a = arr[0] ; /* Retrieve the first numerical string. */
    let b = arr[1] ; // Get the second value.
    let c = arr[2] ; // Obtain the third value.
    let d = arr[3] ; // Fetch the fourth value.


    let ary = [ ] ; /* Initialize an empty array to store computed products. */

    // Define a utility function for the 'reduce' method to find the maximum value.
    const aryMax = function( a , b )
    {
        return Math . max( a , b ) ;
    } ;


    /*
     * Calculate all four possible products from the input numbers
     * and add them to the 'ary' array.
     */
    ary . push( a * c ) ; // Product of 'a' and 'c'.
    // Debugging console.log calls have been intentionally removed from this clone.
    ary . push( a * d ) ; // Product of 'a' and 'd'.
    /* Original console.log(ary); was here. */
    ary . push( b * c ) ; // Product of 'b' and 'c'.

    ary . push( b * d ) ; // Product of 'b' and 'd'.


    // The commented-out alternative using Math.max.apply has been omitted.
    // We proceed with the array.reduce method as in the original.
    let res = ary . reduce( aryMax ) ;

    // Output the final calculated maximum result to standard output.
    console . log( res ) ;

} /* End of the Main function definition. */

/*
 * Please DO NOT modify the following section of code.
 * It is responsible for reading input from standard input (/dev/stdin)
 * and then invoking the 'Main' function with the retrieved data.
 */
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;