// This JavaScript code processes input data, typically from standard input.
// It reads lines, performs calculations, and identifies a maximum value
// based on a specific accumulation pattern.
// This script is designed to handle a sequence of numerical pairs.

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Synchronously read the entire content of '/dev/stdin' as a UTF-8 string.

var Arr = ( input . trim ( ) ) . split ( "\n" ) ; // Trim leading/trailing whitespace from the input and then split it into an array of lines.

var abc = [ ] ; // Initialize an empty array. This array will temporarily store sums of numbers.


// Begin iterating through each line obtained from the input.
for ( var i = 0 ; i < Arr . length ; i ++ )
{
    // Check for a specific termination condition:
    // If 'abc' array is empty AND the current line is exactly "0 0", then stop processing.
    if ( abc . length == 0  &&  Arr [ i ] == "0 0" )
        break ; // Exit the loop immediately.

    // This block executes when the 'abc' array contains exactly four elements.
    // This signifies a complete set of four sums to be processed.
    if ( abc . length == 4 )
    {
        // Use the 'reduce' method to find the maximum value within the 'abc' array.
        var max = abc . reduce ( function ( a , b ) {
            return Math . max ( a , b ) ;
        } ) ;

        // Create an array of characters 'A', 'B', 'C', 'D' for categorization.
        var ABC = "ABCD" . split ( "" ) ;

        // Find the index of the 'max' value in 'abc' and use it to select the corresponding category character.
        var str = ABC [ abc . indexOf ( max ) ] ;

        // Output the identified category character along with its maximum sum.
        console . log ( str + " " + max ) ;

        // Reset the 'abc' array to an empty state, preparing for the next set of four sums.
        abc = [ ] ;
    }
    else
    {
        // This block executes if 'abc' does not yet have four elements.
        // It processes the current line to add a new sum to 'abc'.

        // Split the current line by space and convert the resulting parts into numbers.
        var arr = Arr [ i ] . split ( " " ) . map ( Number ) ;

        // Calculate the sum of the first two numbers from the current line
        // and push this sum into the 'abc' array.
        abc . push ( arr [ 0 ] + arr [ 1 ] ) ;
    }

} // End of the main processing loop.

// The script concludes after all lines are processed or the break condition is met.