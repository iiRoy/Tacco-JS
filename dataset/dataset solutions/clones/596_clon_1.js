var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // This line reads input from standard input

    var arr = input . trim ( ) . split ( "\n" ) ; // The input string is trimmed and split into an array of lines

var mn = arr . shift ( ) . split ( " " ) . map ( Number ) ; // The first line contains two numbers, m and n

    var m = mn [ 0 ] ; // Extract the value for m
    var n = mn [ 1 ] ; // Extract the value for n

var si = [ ] ; // Initialize an empty array named si

    // Loop to populate the si array
    for ( var i = 0 ; i < m - 1 ; i ++ )
    {
        si . push ( arr . shift ( ) - 0 ) ; // Each subsequent line is converted to a number and added to si
    }


var ai = [ ] ; // Initialize an empty array named ai

    // Loop to populate the ai array
    for ( var i = 0 ; i < n ; i ++ )
    {
        ai . push ( arr . shift ( ) - 0 ) ; // Lines after si data are converted to numbers and added to ai
    }


var sum = 0 ; // Initialize the sum variable to zero
var i = 0 ; // Initialize a counter 'i' to track position in 'si' array


// Iterate over each element 'v' in the 'ai' array
ai . forEach ( function ( v )
{
    var k = ( v > 0 ) ? 1 : -1 ; // Determine direction: 1 for positive v, -1 for negative v
    var v = Math . abs ( v ) ; // Use the absolute value of v for the loop count

    // Loop 'v' times
    while ( v -- )
    {
        if ( k == 1 ) // If moving forward (k is 1)
        {
            sum += si [ i ] ; // Add the current si element to sum
        }

        i = i + k ; // Update the index 'i' by adding 'k' (move forward or backward)

        if ( k == -1 ) // If moving backward (k is -1)
        {
            sum += si [ i ] ; // Add the new si element (after moving) to sum
        }
    }
} ) ;


console . log ( sum % 100000 ) ; // Print the final sum modulo 100000 to standard output