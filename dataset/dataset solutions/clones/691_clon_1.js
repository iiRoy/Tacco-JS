/*
 *   This script processes numerical inputs from stdin.
 *   It pre-calculates cubes of integers up to a certain limit.
 */
var    abc   =   [     ]   ; // Declare and initialize an array named 'abc'.

// Populate the 'abc' array with cubes of numbers from 0 to 1111.
for( var   i = 0 ;   i <= 1111 ;   i++ )
{
    abc[ i ] = Math.pow( i , 3 ) ; // Calculate i cubed and store it.
}

// Read the entire standard input as a UTF-8 string.
var input = require( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Process the input string: trim whitespace and split into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;

// Main loop to process each input number.
while ( true )
{
    /*
     *   Extract the first element from 'arr', convert it to a number,
     *   and store it in 'z'. The '- 0' forces numeric conversion.
     */
    var z = arr . shift ( ) - 0 ;

    // If 'z' is 0, it signifies the end of input, so break the loop.
    if ( z == 0 )
    {
        break ;
    }

    // Initialize 'ans' to positive infinity to find the minimum positive value.
    var ans = Infinity ;

    /*
     *   Outer loop: iterates from 'z - 1' down to 1.
     *   'i' represents one of the two numbers whose cubes are subtracted.
     */
    for ( var   i = z - 1 ;   i > 0 ;   i-- )
    {
        /*
         *   Inner loop: iterates from 'i' down to 1.
         *   'j' represents the second number whose cube is subtracted.
         */
        for ( var   j = i ;   j > 0 ;   j-- )
        {
            // Calculate 'x' using the precomputed cube values.
            var x = abc[ z ] - abc[ i ] - abc[ j ] ;

            // If 'x' is positive and smaller than the current 'ans', update 'ans'.
            if ( x > 0   &&   ans > x )
            {
                ans = x ; // Found a new minimum positive difference.
            }
        }
    }

    // Print the calculated minimum positive difference for the current 'z'.
    console . log ( ans ) ;
}
/* End of script execution. */