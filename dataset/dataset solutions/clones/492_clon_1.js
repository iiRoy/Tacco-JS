/*
 * This JavaScript file processes input data to determine a 'flag' status.
 * It reads data from standard input, parses it, and performs calculations.
 * The core logic involves managing cumulative sums and checking against a threshold.
 */

var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read all input from stdin as a UTF-8 string.

var Arr = ( input . trim ( ) ) . split ( "\n" ) ; // Trim whitespace from input and split it into an array of lines.

// Main processing loop: continues until a specific condition is met.
while ( true )
{
    // Extract the first number from the array, converting it to an integer.
    var N = Arr . shift ( ) - 0 ; // Shift removes the first element and returns it. '- 0' ensures numeric conversion.

    // If N is 0, it signifies the end of input or a termination condition.
    if ( N == 0 )
    {
        break ; // Exit the loop.
    }

    /*
     * Initialize an empty array 'pm' to store processed pairs of data.
     * This array will later be sorted and iterated through.
     */
    var pm = [ ] ;

    // Loop N times to process N sets of data for the current block.
    for ( var i = 0 ; i < N ; i ++ )
    {
        // Read the next line, split by space, and map to numbers.
        var arr = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

        var m = arr [ 0 ] ; // Assign the first element to 'm'.
        var a = arr [ 1 ] ; // Assign the second element to 'a'.
        var b = arr [ 2 ] ; // Assign the third element to 'b'.

        // Push two entries into the 'pm' array for each processed line.
        // These represent events with associated values.
        pm . push ( [ a , m ] ) ;            // Event at 'a' with value 'm'.
        pm . push ( [ b - 0.1 , -1 * m ] ) ; // Event just before 'b' with value '-m'.
    }

    /*
     * Sort the 'pm' array. The sorting function compares the first elements of the inner arrays.
     * This ensures events are processed in chronological order.
     */
    pm . sort ( function ( a , b )
    {
        a = a [ 0 ] ; // Get the first element of array 'a'.
        b = b [ 0 ] ; // Get the first element of array 'b'.

        return a - b ; // Sort in ascending order based on these values.
    } ) ;

    var flag = "OK" ; // Initialize the status flag to "OK".
    var sum = 0 ;     // Initialize a running sum.

    // Iterate through the sorted 'pm' array to calculate cumulative sums.
    for ( var i = 0 ; i < pm . length ; i ++ )
    {
        sum += pm [ i ] [ 1 ] ; // Add the second element (value) of the current event to the sum.

        // Check if the cumulative sum exceeds a threshold.
        if ( sum > 150 )
        {
            flag = "NG" ; // If over threshold, set flag to "NG".
            break ;       // No need to check further, break the loop.
        }
    }

    console . log ( flag ) ; // Output the final status flag for the current block of data.
}