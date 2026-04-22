// This is the beginning of the JavaScript program.
// The purpose of this script is to process input data.

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Reads input from standard input asynchronously

/*
 * The 'input' variable now holds the entire content
 * read from /dev/stdin as a UTF-8 encoded string.
 */

var Arr = ( input . trim ( ) ) . split ( "\n" ) ; // Splits the trimmed input string into an array of lines

// Initialize an empty array to store intermediate calculation results.
var abc = [ ] ;


// Loop through each line of the processed input array 'Arr'.
for ( var i = 0 ; i < Arr . length ; i ++ )
{
    // Check for the termination condition: if 'abc' is empty and the current line is "0 0".
    if ( abc . length == 0 && Arr [ i ] == "0 0" )
    {
        break ; // Exit the loop immediately.
    }

    // Check if the 'abc' array has accumulated exactly 5 elements.
    if ( abc . length == 5 )
    {
        // If 5 elements are present, find the maximum value among them using reduce.
        var max = abc . reduce ( function ( a , b ) { return Math . max ( a , b ) ; } ) ;

        // Define a string of characters for mapping the index of the max value.
        var ABC = "ABCDE" . split ( "" ) ;

        // Determine the character corresponding to the index of the maximum value in 'abc'.
        var str = ABC [ abc . indexOf ( max ) ] ;

        // Output the determined character and its maximum value to the console.
        console . log ( str + " " + max ) ;

        // Reset the 'abc' array to an empty state for the next set of inputs.
        abc = [ ] ;
    }
    else
    {
        // If 'abc' does not have 5 elements yet, process the current line of input.
        // Split the line by space, then map each part to a number.
        var arr = Arr [ i ] . split ( " " ) . map ( Number ) ;

        // Add the sum of the first two numbers from the current line to the 'abc' array.
        abc . push ( arr [ 0 ] + arr [ 1 ] ) ;
    }
}
// End of the main processing loop.

/*
 * This marks the end of the script's execution flow.
 * No further operations are performed after the loop concludes.
 */