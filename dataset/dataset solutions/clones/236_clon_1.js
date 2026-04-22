/*
 *  This JavaScript program reads coordinate data to determine
 *  if pairs of line segments are perpendicular.
 *
 *  It processes each line of input independently,
 *  calculating slopes and checking perpendicularity conditions.
 */

//  Require the 'fs' (file system) module for input operations.
//  Reads the entire content of '/dev/stdin' as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


//  Process the raw input string:
//  1.  Remove any leading/trailing whitespace using .trim().
//  2.  Split the cleaned string into an array of lines, using newline characters as delimiters.
var Arr = ( input . trim () ) . split ( "\n" ) ;


//  Begin iterating through each line of the processed input array.
//  The loop variable 'i' is intentionally left undeclared (global scope) as in the original.
for ( i = 0 ; i < Arr . length ; i ++ )
{
    //  For the current line in 'Arr':
    //  1.  Split the string by spaces to get individual coordinate strings.
    //  2.  Map each string element to its numerical representation using the Number constructor.
    //  This results in an array of 8 numbers: [x1, y1, x2, y2, x3, y3, x4, y4].
    var arr = Arr [ i ] . split ( " " ) . map ( Number ) ;


    //  Define an Immediately Invoked Function Expression (IIFE)
    //  to encapsulate the logic for checking perpendicularity for one set of coordinates.
    //  The coordinates from 'arr' will be passed as arguments to this function.
    ( function ( x1 , y1 , x2 , y2 , x3 , y3 , x4 , y4 )
    {
        //  Declare variables to hold the slopes of the two line segments.
        var k1 ; // Slope of the first segment (connecting (x1,y1) and (x2,y2))
        var k2 ; // Slope of the second segment (connecting (x3,y3) and (x4,y4))

        //  Calculate the slope of the first line segment.
        //  Special handling for vertical lines where the denominator (x2 - x1) would be zero.
        if ( x2 - x1 !== 0 )
        {
            k1 = ( ( y2 - y1 ) / ( x2 - x1 ) ) ; // Standard slope formula: (delta Y) / (delta X)
        }
        else
        {
            k1 = Infinity ; // A vertical line has an undefined (infinite) slope.
        }

        //  Calculate the slope of the second line segment.
        //  Similar special handling for vertical lines for the second segment.
        if ( x4 - x3 !== 0 )
        {
            k2 = ( y4 - y3 ) / ( x4 - x3 ) ; // Standard slope calculation for the second segment.
        }
        else
        {
            k2 = Infinity ; // The second line segment is vertical.
        }

        //  Initialize the answer string. Default assumption is "NO" (not perpendicular).
        var ans = "NO" ;

        //  Check for perpendicularity conditions:

        //  Condition 1: One line is perfectly horizontal (slope 0) and the other is perfectly vertical (slope Infinity).
        if ( k1 == 0 && k2 == Infinity )
        {
            ans = "YES" ;
        }

        //  Condition 2: The opposite of Condition 1 - second line horizontal, first line vertical.
        if ( k2 == 0 && k1 == Infinity )
        {
            ans = "YES" ;
        }

        //  Condition 3: For non-vertical/non-horizontal lines, two lines are perpendicular
        //  if the product of their slopes is -1.
        //  Using a small epsilon (1.0e-8) for floating-point comparison to account for precision errors.
        if ( k1 * k2 + 1 < 1.0e-8 )
        {
            ans = "YES" ;
        }

        //  Output the final determination ("YES" or "NO") to the console.
        console . log ( ans ) ;

    } ) . apply ( null , arr ) ; // Execute the IIFE, passing the 'arr' elements as arguments.
}