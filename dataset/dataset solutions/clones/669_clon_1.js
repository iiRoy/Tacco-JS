/*
 * This is a Type I clone generated from an original JavaScript source.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * All identifiers, operators, and expressions remain unchanged.
 * Only whitespace and comments have been modified.
 */

// Importing the 'fs' (file system) module to read input.
var input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


/*
 * Process the raw input string.
 * First, remove any leading/trailing whitespace using trim().
 * Then, split the string into an array of lines based on the newline character.
 */
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// The main processing loop continues until a specific condition is met.
while ( true )
{
    // Extract the first element from the 'Arr' array, convert it to a number, and assign to 'n'.
    // The '-0' is a common trick in JavaScript to explicitly convert to a number.
    var n = Arr . shift ( ) - 0 ;

    // If 'n' is zero, it signifies the end of input for this session.
    if ( n == 0 )
        break ; // Exit the infinite loop.


    // Initialize an empty array 's' to store processed data.
    var s = [ ] ;

    // Initialize a variable 'sum' to accumulate values, starting at zero.
    var sum = 0 ;

    /*
     * This loop iterates 'n' times to process 'n' sets of data.
     * 'i' is the loop counter, starting from 0.
     */
    for ( var i = 0 ; i < n ; i ++ )
    {
        // Take the next line from 'Arr', split it by space, and convert each part to a Number.
        var arr = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

        // Add the newly processed array 'arr' to the 's' array.
        s . push ( arr ) ;

        // Add the first element of 'arr' to the 'sum'.
        sum += arr [ 0 ] ;
    } // End of data input loop.


    // Sort the 's' array based on a custom comparison function.
    // The comparison is done on the second element (index 1) of each sub-array, in descending order.
    s . sort ( function ( a , b )
    {
        // Extract the second element of 'a' and 'b' for comparison.
        a = a [ 1 ] ;
        b = b [ 1 ] ;

        // Return b - a for descending order. (If a - b, it would be ascending).
        return b - a ;
    } ) ; // End of sort function call.


    // Initialize the 'result' string to "Yes". This will be changed to "No" if a condition is not met.
    var result = "Yes" ;

    /*
     * Iterate through the sorted 's' array to perform the final check.
     * 'i' is the loop counter, going from 0 up to (but not including) s.length.
     */
    for ( var i = 0 ; i < s . length ; i ++ )
    {
        // Get the current sub-array from 's'.
        var v = s [ i ] ;

        // Check the condition: if 'sum' is greater than the second element of 'v'.
        if ( sum > v [ 1 ] )
        {
            // If the condition is true, set 'result' to "No".
            result = "No" ;
            break ; // Exit this loop immediately as the condition is failed.
        }

        // Subtract the first element of 'v' from 'sum'.
        sum -= v [ 0 ] ;
    } // End of final check loop.


    // Output the final 'result' to the console.
    console . log ( result ) ;

} // End of main while loop.