// This JavaScript code is a Type I clone, designed to process competitive programming input.
// It reads data, performs comparisons, and calculates scores for two entities, 'a' and 'b'.
// All identifiers, operators, and expressions are preserved exactly as in the original.

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Synchronously read the entire standard input.

var Arr = ( input . trim ( ) ) . split ( "\n" ) ; // Trim any leading/trailing whitespace and split the input string into an array of lines.

// The first line of input specifies the number of data sets or rounds to follow.
var n = Arr . shift ( ) - 0 ; // Extract the first element, convert it to a number (the '- 0' forces numeric conversion), and remove it from Arr.

var a = 0 ; // Initialize the score for entity 'a' to zero.
var b = 0 ; // Initialize the score for entity 'b' to zero.

// Iterate 'n' times, processing one round of data in each iteration.
for ( var i = 0 ; i < n ; i ++ )
{
    // Retrieve the current line (round data) from the array.
    var v = Arr . shift ( ) ; // Get the next line and remove it from the start of the array.

    // Split the current line by spaces and convert each part into a number.
    var arr = v . split ( " " ) . map ( Number ) ;

    // Compare the two numbers obtained from the current line.
    if ( arr [ 0 ] > arr [ 1 ] )
    {
        // If the first number is greater, add the sum of both numbers to 'a'.
        a += arr [ 0 ] + arr [ 1 ] ;
    }

    if ( arr [ 0 ] < arr [ 1 ] )
    {
        // If the second number is greater, add the sum of both numbers to 'b'.
        b += arr [ 0 ] + arr [ 1 ] ;
    }

    if ( arr [ 0 ] == arr [ 1 ] )
    {
        // If both numbers are equal, assign the first number to 'a' and the second to 'b'.
        // This effectively resets 'a' and 'b' to these values for this specific case.
        a = arr [ 0 ] ;
        b = arr [ 1 ] ;
    }
}

// After processing all rounds, print the final scores of 'a' and 'b', separated by a space.
console . log ( a + " " + b ) ;