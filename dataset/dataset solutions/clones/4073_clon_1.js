/*
 * This JavaScript program processes a given input dataset.
 * The 'input' variable is expected to contain all raw input data.
 */
function Main ( input )
{
    // Split the entire input string by newline characters into an array of lines.
    var args = input . split ( "\n" ) ;

    // Parse the first element of the 'args' array as an integer N.
    // N typically represents the number of subsequent data entries.
    var N = parseInt ( args [ 0 ] , 10 ) ;

    // Extract the historical data records from the 'args' array.
    // This slice includes records from the second line up to N lines after that.
    var history = args . slice ( 1 , N + 1 ) ;

    var answer ; // This variable will hold the final "YES" or "NO" determination.
    var flg ;    // A flag variable; it will be set to 1 if the condition is met.

    // Iterate through the historical records, comparing each record with its successor.
    // The loop runs N-1 times to compare N pairs of adjacent records.
    for ( var i = 0 ; i < N - 1 ; i ++ )
    {
        // Parse the current historical record (at index i) into its time and coordinates.
        var [ t1 , x1 , y1 ] = parser ( history [ i ] ) ;
        // Parse the next historical record (at index i+1).
        var [ t2 , x2 , y2 ] = parser ( history [ i + 1 ] ) ;

        // Calculate the time difference between the two consecutive records.
        var dt = t2 - t1 ;

        // Calculate the Manhattan distance (L1 distance) between the two points.
        // The formula is |x2 - x1| + |y2 - y1|, which is equivalent to |(x2+y2) - (x1+y1)|
        var distance = Math . abs ( x2 + y2 - x1 - y1 ) ;

        // Check if the calculated distance is less than or equal to the available time difference.
        if ( distance <= dt )
        {
            // If reachable, further check if the parity of the distance matches the parity of the time difference.
            // This condition is crucial for determining if the path is physically possible in discrete steps.
            if ( distance % 2 == dt % 2 )
            {
                flg = 1 ; // If both conditions are met, set the flag to 1.
            }
        }
    }

    // Based on the final state of the 'flg' variable, determine the answer.
    // If 'flg' is 1 (truthy), answer is "YES", otherwise "NO".
    answer = flg ? "YES" : "NO" ;

    // Output the final answer to the standard console.
    console . log ( answer ) ;
}


/*
 * This utility function parses a single record string into its constituent parts.
 * A record string is expected to be space-separated, e.g., "time x_coord y_coord".
 */
function parser ( record )
{
    var args = record . split ( " " ) ; // Split the input record string by space.

    // Parse the first part as an integer for time (base 10).
    var t = parseInt ( args [ 0 ] , 10 ) ;
    // Parse the second part as an integer for the x-coordinate.
    var x = parseInt ( args [ 1 ] , 10 ) ;
    // Parse the third part as an integer for the y-coordinate.
    var y = parseInt ( args [ 2 ] , 10 ) ;

    // Return the parsed time, x, and y values as an array.
    return [ t , x , y ] ;
}


/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;