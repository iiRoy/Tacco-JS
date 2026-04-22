/*
 * This JavaScript program processes geometric data to determine
 * if pairs of line segments are parallel. It reads input
 * from standard input, performing calculations for multiple
 * test cases as specified by the initial input value.
 *
 * This implementation focuses on precise floating-point comparisons
 * for slope equivalence by using toFixed(12) to handle potential
 * precision issues.
 */

var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ; // Reads the entire input from stdin as a UTF-8 string.
var lines = input . split( '\n' ) ;                                    // Splits the input string into an array of lines.


// The first line of input contains an integer 'n',
// which represents the total number of test cases to process.
var n = +lines . shift( ) ; // Converts the first line to a number and removes it from the 'lines' array.


// Iterate through each of the 'n' test cases.
for ( var i = 0 ; i < n ; i++ ) {

    // For each test case, read the next line from input.
    // This line contains eight space-separated floating-point numbers
    // representing the coordinates of two line segments:
    // (x1, y1) -> (x2, y2) and (x3, y3) -> (x4, y4).
    var nums = lines . shift( ) . split( ' ' ) ;


    // Parse the coordinates for the first point of the first line segment.
    var x1 = +nums[ 0 ] ;
    var y1 = +nums[ 1 ] ;

    // Parse the coordinates for the second point of the first line segment.
    var x2 = +nums[ 2 ] ;
    var y2 = +nums[ 3 ] ;


    // Parse the coordinates for the first point of the second line segment.
    var x3 = +nums[ 4 ] ;
    var y3 = +nums[ 5 ] ;

    // Parse the coordinates for the second point of the second line segment.
    var x4 = +nums[ 6 ] ;
    var y4 = +nums[ 7 ] ;


    /*
     * Determine if the two line segments are parallel.
     * Two lines are parallel if their slopes are equal.
     * Slope of line 1 = (y2 - y1) / (x2 - x1)
     * Slope of line 2 = (y4 - y3) / (x4 - x3)
     *
     * To avoid division by zero (for vertical lines) and simplify comparison,
     * we can cross-multiply:
     * (y2 - y1) * (x4 - x3) == (y4 - y3) * (x2 - x1)
     *
     * We use .toFixed(12) to compare floating-point results with a fixed
     * precision, which helps in robustly determining equality.
     */
    if ( ( ( x2 - x1 ) * ( y4 - y3 ) ) . toFixed( 12 ) == ( ( x4 - x3 ) * ( y2 - y1 ) ) . toFixed( 12 ) )
    {
        // If the calculated values are equal (meaning the slopes are equal),
        // the lines are parallel.
        console . log( 'YES' ) ;
    }
    else
    {
        // If the calculated values are not equal, the lines are not parallel.
        console . log( 'NO' ) ;
    }

} // End of the loop iterating through test cases.