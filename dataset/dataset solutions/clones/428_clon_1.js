// This JavaScript code processes numerical input lines,
// calculating sums and identifying maximums in batches.

// Import the 'fs' (file system) module to read input.
var input = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// Trim any leading/trailing whitespace from the input string,
// then split it into an array of lines based on the newline character.
var Arr = ( input . trim() ) . split ( "\n" ) ;

// Initialize an empty array 'abc' to store the results of calculations.
var abc = [ ] ;

// Begin a loop to iterate through each line of the 'Arr' array.
for ( var i = 0 ; i < Arr . length ; i ++ )
{
    // Check for a specific termination condition:
    // If 'abc' is currently empty AND the current line is exactly "0 0",
    // then break out of the loop, signifying the end of input processing.
    if ( abc . length == 0  &&  Arr [ i ] == "0 0" )
    {
        break ; // Exit the loop.
    }

    // Split the current line (Arr[i]) by spaces,
    // then use the map function to convert each resulting string part into a Number.
    var arr = Arr [ i ] . split ( " " ) . map ( Number ) ;

    // Calculate the sum of the first two numbers from the 'arr' array
    // and push this sum onto the 'abc' array.
    abc . push ( arr [ 0 ] + arr [ 1 ] ) ;

    // After adding a sum, check if the 'abc' array now contains exactly 5 elements.
    if ( abc . length == 5 )
    {
        // If it does, find the maximum value among these 5 elements.
        // The 'reduce' method is used here with Math.max to achieve this.
        var max = abc . reduce ( function ( a , b ) { return Math . max ( a , b ) ; } ) ;

        // Define an array of characters, "A", "B", "C", "D", "E".
        var ABC = "ABCDE" . split ( "" ) ;

        // Find the index of the 'max' value within the 'abc' array,
        // then use that index to select the corresponding character from the 'ABC' array.
        var str = ABC [ abc . indexOf ( max ) ] ;

        // Print the selected character followed by a space and the maximum value to the console.
        console . log ( str + " " + max ) ;

        // Clear the 'abc' array, resetting it to an empty state,
        // to prepare for the next batch of 5 sums.
        abc = [ ] ;
    }
}
// The loop finishes when all lines are processed or the termination condition is met.