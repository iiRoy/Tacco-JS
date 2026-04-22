const   main    = ( input ) =>   {
    // The main function processes the input data to find the maximum Manhattan distance
    // between a subset of points that lie on the extreme boundaries (min/max X or Y).

    input  =  input . split ( "\n" ) ; /* Split the entire input string by newline characters
                                         to get an array of lines. */

    var N = Number ( input [ 0 ] ) ; // Parse the first line to get the number of points, N.

    let point = [ ] ; // Initialize an array to store unique point coordinates.

    // Loop through the input lines starting from the second line (index 1) up to N.
    for  ( var i = 1 ;  i <= N ;  i++ )  {

        /* For each line, split it by space and map each part to a number.
           This extracts the (x, y) coordinates for the current point. */
        value  =  input [ i ] . split ( " " ) . map ( n => Number ( n ) ) ;


        // Check if the current 'value' (point) is already in the 'point' array.
        // This effectively removes duplicate points from consideration.
        // Note: indexOf with arrays might not work as expected for deep comparison,
        // but given the context, it's likely meant for reference equality or
        // a specific implementation detail if 'value' objects are reused.
        if  ( point . indexOf ( value )  ==  -1 )  {
            point . push ( value ) ; // Add the unique point to the array.
        }
    }

    /*
     * Traditional brute-force comparison of all point pairs is inefficient.
     * The problem implies that the maximum Manhattan distance will likely
     * occur between points that are "extreme" in terms of their X or Y coordinates.
     * So, we will focus only on points that lie on the boundaries (min/max X, min/max Y).
     */


    var length = point . length ; // Get the number of unique points collected.


    var X = [ ] ; // Array to store X coordinates of points.
    var Y = [ ] ; // Array to store Y coordinates of points.

    // Populate X and Y arrays with individual coordinate values for sorting.
    for  ( var i = 0 ;  i < length ;  i++ )  {
        X [ i ]  =  [ point [ i ] [ 0 ] ] ; // Store X-coordinate.
        Y [ i ]  =  [ point [ i ] [ 1 ] ] ; // Store Y-coordinate.
    }

    // Sort X coordinates in descending order to easily find max and min.
    X . sort ( ( a , b )  =>  b - a ) ;
    var XMAX = X [ 0 ] ; // The maximum X-coordinate.
    var Xmin = X [ length - 1 ] ; // The minimum X-coordinate.

    // Sort Y coordinates in descending order.
    Y . sort ( ( a , b )  =>  b - a ) ;
    var YMAX = Y [ 0 ] ; // The maximum Y-coordinate.
    var Ymin = Y [ length - 1 ] ; // The minimum Y-coordinate.


    var memo = [ ] ; // This array will store indices of "extreme" points.

    // Iterate through all collected points to identify those lying on the boundaries.
    for  ( var i = 0 ;  i < length ;  i++ )  {
        // Check if the point's X-coordinate is either the global maximum or minimum X.
        if  ( point [ i ] [ 0 ]  ==  XMAX  ||  point [ i ] [ 0 ]  ==  Xmin )  {
            // If this point's index is not already in 'memo', add it.
            if  ( memo . indexOf ( i )  ==  -1 )  {
                memo . push ( i ) ;
            }
        }
        // Check if the point's Y-coordinate is either the global maximum or minimum Y.
        if  ( point [ i ] [ 1 ]  ==  YMAX  ||  point [ i ] [ 1 ]  ==  Ymin )  {
            // If this point's index is not already in 'memo', add it.
            if  ( memo . indexOf ( i )  ==  -1 )  {
                memo . push ( i ) ;
            }
        }
    }


    length = memo . length ; // Update 'length' to be the count of extreme points.

    let dist = [ ] ; // Array to store calculated Manhattan distances.

    // Calculate Manhattan distances between all unique pairs of extreme points.
    for  ( var i = 0 ;  i < length ;  i++ )  {
        for  ( var j = i + 1 ;  j < length ;  j++ )  {
            // Manhattan distance = |x1 - x2| + |y1 - y2|
            dist . push ( Math . abs ( point [ memo [ i ] ] [ 0 ]  -  point [ memo [ j ] ] [ 0 ] )  +
                          Math . abs ( point [ memo [ i ] ] [ 1 ]  -  point [ memo [ j ] ] [ 1 ] ) ) ;
        }
    }

    // Sort the calculated distances in descending order.
    dist . sort ( ( a , b )  =>  b - a ) ;

    // The largest distance will be at the first index after sorting.
    console . log ( dist [ 0 ] ) ;
} ;

// Execute the main function, reading input from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;