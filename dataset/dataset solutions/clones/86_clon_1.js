/*
 * This JavaScript code reads input from standard input,
 * processes each line, and determines if two line segments
 * defined by coordinates are parallel.
 *
 * Each line of input is expected to contain eight space-separated numbers
 * representing the coordinates:
 * (ax, ay) for the first point of the first segment
 * (bx, by) for the second point of the first segment
 * (cx, cy) for the first point of the second segment
 * (dx, dy) for the second point of the second segment
 *
 * The program calculates the slopes of these two segments.
 * If both segments are non-vertical and their slopes are equal,
 * it outputs "YES". Otherwise, it outputs "NO".
 *
 * Note: Coordinate values are internally multiplied by 100000.
 * This scaling does not affect slope comparison as the factor cancels out.
 */

// Import the built-in 'fs' (file system) module to handle file operations,
// specifically for reading from standard input.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Process the raw input string:
// 1. Trim any leading or trailing whitespace.
// 2. Split the string into an array of lines based on the newline character.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Remove the first line from the array. In many competitive programming
// scenarios, the first line might contain metadata like the number of test cases,
// which is discarded here.
Arr . shift ( ) ;


// Iterate over each remaining line in the 'Arr' array.
// Each 'v' represents a single line of coordinate data.
Arr . forEach ( function ( v ) {

    // Split the current line 'v' by spaces and convert each resulting string
    // into a numerical value using the 'Number' constructor.
    var arr = v . split ( " " ) . map ( Number ) ;

    // Apply a transformation to each number in the 'arr' array:
    // multiply it by 100000. This might be for precision handling or
    // to avoid floating-point issues, though for slope comparison,
    // the scaling factor cancels out.
    arr = arr . map ( function ( v ) { return v * 100000 } ) ;


    // Extract individual coordinate values from the processed 'arr'.
    // These represent the two segments: (ax,ay)-(bx,by) and (cx,cy)-(dx,dy).
    var ax = arr [ 0 ] ; // x-coordinate of point A
    var ay = arr [ 1 ] ; // y-coordinate of point A
    var bx = arr [ 2 ] ; // x-coordinate of point B
    var by = arr [ 3 ] ; // y-coordinate of point B
    var cx = arr [ 4 ] ; // x-coordinate of point C
    var cy = arr [ 5 ] ; // y-coordinate of point C
    var dx = arr [ 6 ] ; // x-coordinate of point D
    var dy = arr [ 7 ] ; // y-coordinate of point D


    // Initialize a result variable 'x' to "NO". This will be changed to "YES"
    // if the conditions for parallel segments are met.
    var x = "NO" ;

    // Check if both segments are non-vertical.
    // A segment is vertical if its change in x (denominator for slope) is zero.
    // We only proceed with slope comparison if neither segment is vertical.
    if ( ( bx - ax ) != 0 && ( dx - cx ) != 0 ) {
        // Calculate the slope of the first segment (AB).
        // Slope = (change in y) / (change in x)
        var ab = ( by - ay ) / ( bx - ax ) ;

        // Calculate the slope of the second segment (CD).
        var cd = ( dy - cy ) / ( dx - cx ) ;

        // Compare the slopes. If they are equal, the segments are parallel.
        if ( ab == cd ) {
            x = "YES" ; // Update the result to "YES"
        }
    }
    // If either segment is vertical (bx-ax == 0 or dx-cx == 0),
    // the 'if' condition above is false, and 'x' remains "NO".
    // This implies vertical lines are not considered parallel by this logic
    // or are handled as a distinct case (which results in "NO" here).


    // Output the final determination ("YES" or "NO") for the current line of input.
    console . log ( x ) ;

} ) ; // End of the Arr.forEach loop.