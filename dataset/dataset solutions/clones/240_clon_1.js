/*
 * This JavaScript file processes input from standard input.
 * It reads multiple lines, each representing coordinates for two 1D intervals,
 * and determines if these intervals effectively overlap in both dimensions.
 * The problem typically involves checking for intersection of rectangle projections.
 */

//  Declare a variable to store the raw input data.
//  The 'fs' module is used to read the file, specifically '/dev/stdin' for standard input.
var  input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


//  Process the raw input:
//  1.  Remove any leading or trailing whitespace using 'trim()'.
//  2.  Split the cleaned input string into an array of strings,
//      where each string is a line from the input, separated by newline characters.
var   Arr   =   ( input . trim ( ) ) . split ( "\n" ) ;


//  Iterate over each line (which represents a set of coordinates) in the 'Arr' array.
//  The 'forEach' method calls a provided function once for each array element.
Arr . forEach ( function ( v ) {

    //  For the current line 'v':
    //  1.  Split the string by spaces to get an array of coordinate strings.
    //  2.  Use 'map(Number)' to convert each string coordinate into a numerical value.
    //  This 'arr' now holds the numerical coordinates for the two intervals/rectangles.
    var   arr   =   v . split ( " " ) . map ( Number ) ;

    //  Initialize a counter. This will track how many dimensions (X and Y) have overlap.
    var   cnt   =   0 ;

    //  An Immediately Invoked Function Expression (IIFE) is used here.
    //  It takes eight parameters, corresponding to the coordinates:
    //  (xa1, ya1) - bottom-left of rectangle A
    //  (xa2, ya2) - top-right of rectangle A
    //  (xb1, yb1) - bottom-left of rectangle B
    //  (xb2, yb2) - top-right of rectangle B
    ( function ( xa1,   ya1,   xa2,   ya2,   xb1,   yb1,   xb2,   yb2 ) {

        //  Check for overlap along the X-axis.
        //  Overlap exists if rectangle B's rightmost X-coordinate (xb2) is not to the left of
        //  rectangle A's leftmost X-coordinate (xa1), AND
        //  if rectangle B's leftmost X-coordinate (xb1) is not to the right of
        //  rectangle A's rightmost X-coordinate (xa2).
        if ( xb2   >=   xa1   &&   xb1   <=   xa2 )
            cnt ++ ; // Increment the counter if X-dimensions overlap.


        //  Check for overlap along the Y-axis.
        //  Similar logic as for the X-axis, but applied to Y-coordinates.
        if ( yb2   >=   ya1   &&   yb1   <=   ya2 )
            cnt ++ ; // Increment the counter if Y-dimensions overlap.

    } ) . apply ( null ,   arr ) ; //  The 'apply' method calls the IIFE with 'null' as 'this' context,
                                   //  and passes the elements of 'arr' as individual arguments.

    //  Finally, based on the 'cnt' value, print the result.
    //  If 'cnt' is 2, it means both X and Y dimensions overlapped, indicating a full intersection.
    //  Otherwise, there's no full intersection.
    console . log ( ( cnt   ==   2 )   ?   "YES"   :   "NO" ) ;

} ) ;