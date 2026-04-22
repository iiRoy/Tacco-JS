/*
 * This JavaScript code processes input data to calculate a specific answer.
 * It demonstrates array manipulation, string operations, and conditional logic.
 */
function Main ( input )
{
    // Initialize the answer variable. Default to -1.
    ans = -1;

    // Process the raw input: trim whitespace and split into lines.
    input = input . trim ( ) . split ( "\n" ) ;

    // Extract N from the first line of input.
    // The first element of the first line is N.
    N = input [ 0 ] . split ( ' ' ) . map ( ( n ) => ( parseInt ( n ) ) ) [ 0 ] ;

    // The rest of the input lines are stored in 'f'.
    f = input . slice ( 1 ) ;

    // Create an answer array, initialized with 'a' characters.
    ansarr = new Array ( N ) . fill ( 'a' ) ;

    // Iterate through the lines in 'f' to populate ansarr.
    for ( i = 0 ; i < f . length ; i ++ )
    {
        // Parse each line into two integers.
        var tmp = f [ i ] . split ( ' ' ) . map ( ( n ) => ( parseInt ( n ) ) ) ;
        // Assign the second integer to the position indicated by the first integer (0-indexed).
        ansarr [ tmp [ 0 ] - 1 ] = tmp [ 1 ] ;
    }

    // Join the array elements into a string.
    // Remove leading 'a's, then replace all remaining 'a's with '0'.
    var c = ansarr . join ( "" ) . replace ( /^a*/ , '' ) . replace ( /a/g , 0 ) ;

    // Convert string 'c' to an integer and then back to a string for comparison.
    var d = parseInt ( c ) . toString ( ) ;

    // Conditional logic to determine the final answer 'ans'.
    if ( c == '00' )
    {
        // Special case: if 'c' is "00", set ans to 100.
        ans = 100 ;
    }
    else if ( c == '0' )
    {
        // Special case: if 'c' is "0", set ans to 10.
        ans = 10 ;
    }
    else if ( c == d )
    {
        // If 'c' (after replacements) is numerically equivalent to its integer form,
        // set ans to that integer value.
        ans = parseInt ( d ) ;
    }

    // Output the final calculated answer to the console.
    console . log ( ans ) ;
}
/*
 *  This section handles standard input/output.
 *  Do not modify anything below this line.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// Main ( require ( 'fs' ) . readFileSync ( './input.txt' , 'utf-8' ) ) ; // Alternative for local testing with a file.