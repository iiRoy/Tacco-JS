/*
 * This file processes input data to perform a specific calculation.
 * It reads from standard input, parses numbers, and then prints results.
 * The primary function `main` orchestrates this process.
 */
function main( input )
{
    // Declare a temporary array to hold lines from the input string.
    var temp = input.split( '\n' ) ;

    /*
     * The first line of input is expected to contain two space-separated numbers:
     * representing the height (h) and width (w) of a matrix.
     */
    var foo = temp[0].split( ' ' ) ;
    var h = parseInt( foo[0] ) ; // Parse the height value.
    var w = parseInt( foo[1] ) ; // Parse the width value.

    // Remove the first line from the temporary array as it has been processed.
    temp.shift() ;

    var arr = [] ; // Initialize an array to store the 2D matrix data.

    // Loop 'h' times to populate the 'arr' matrix with data from subsequent lines.
    for ( var i = 0 ; i < h ; i++ )
    {
        // Each line is split by space and its elements are converted to numbers.
        arr[i] = temp[i].split( ' ' ).map( Number ) ;
    }


    var c = [] ; // This array 'c' will store the coefficient values.

    // This loop populates the 'c' array with coefficient values.
    // The coefficients are located after the matrix data in the 'temp' array.
    for ( var j = 0 ; j < ( temp.length - h - 1 ) ; j ++ )
    {
        // Convert the string representation of the coefficient to an integer and add it to 'c'.
        c.push( parseInt( temp[ ( j + h ) ] ) ) ;
    }

    // Now, iterate through each row of the 'arr' matrix to perform the calculation.
    for ( var k = 0 ; k < arr.length ; k++ )
    {
        var line = 0 ; // Initialize an accumulator for the sum of products for the current row.

        // For each element in the current row, multiply it by its corresponding coefficient.
        for ( var l = 0 ; l < w ; l++ )
        {
            line += arr[k][l] * c[l] ; // Perform multiplication and add to the running total.
        }
        // Output the calculated sum for the current row to the console.
        console.log( line ) ;
    }
}

// This part of the code handles reading input from standard input and invoking the main processing function.
var x = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf-8' ) ;
main( x ) ; // Call the primary function 'main' with the content read from standard input.