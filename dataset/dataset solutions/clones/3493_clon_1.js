/*
 * This is the main function responsible for processing the input
 * and finding the correct coordinates and height.
 */
function Main ( input )
{
    // Split the input string into an array of lines.
    var a = input.split( "\n" ) ;

    // Iterate through possible X coordinates from 0 to 100.
    for ( var X = 0 ; X <= 100 ; X++ )
    {
        // For each X, iterate through possible Y coordinates from 0 to 100.
        for ( var Y = 0 ; Y <= 100 ; Y++ )
        {
            // Check if the current (X, Y) pair is valid.
            var valid = isValid( a , X , Y ) ;

            // If a valid combination is found, return the result.
            if ( valid )
            {
                return "" + X + " " + Y + " " + valid ;
            }
        }
    }
}


/**
 * Determines if a given (X, Y) coordinate pair is valid
 * based on the provided height data.
 * @param {Array<string>} a - The input array of strings, where a[0] is N, and subsequent elements are x y h.
 * @param {number} X - The candidate X coordinate.
 * @param {number} Y - The candidate Y coordinate.
 * @returns {number|boolean} The calculated height H if valid, otherwise false.
 */
function isValid ( a , X , Y )
{
    // The first element of the array 'a' contains N, the number of data points.
    var N = a[0] ;

    // Initialize H (the common height) to 0.
    var H = 0 ;

    // Loop through each data point provided in the input.
    for ( var n = 1 ; n <= N ; n++ )
    {
        // Split the current data point line into its components: x, y, h.
        var b = a[ n ].split( " " ) ;

        // Parse x coordinate, ensuring it's a number.
        var x = b[ 0 ] * 1 ;

        // Parse y coordinate, ensuring it's a number.
        var y = b[ 1 ] * 1 ;

        // Parse h (height) value, ensuring it's a number.
        var h = b[ 2 ] * 1 ;

        // Only process data points where the given height 'h' is not zero.
        if ( h != 0 )
        {
            // Calculate the expected height (mh) for the current data point
            // based on the candidate (X, Y) and its (x, y, h).
            var mh = h + Math.abs( X - x ) + Math.abs( Y - y ) ;

            // If H is still 0, this is the first non-zero height point encountered.
            if ( H == 0 )
            {
                // Set H to the calculated expected height.
                H = mh ;
            }
            else
            {
                // If H is not 0, compare it with the newly calculated expected height (mh).
                // If they don't match, the candidate (X, Y) is invalid.
                if ( H != mh )
                {
                    return false ; // Return false, indicating invalidity.
                }
            }
        }
    }
    // If all non-zero height points are consistent, return the common height H.
    return H ;
}

// Read input from stdin, pass it to the Main function, and print the result to stdout.
console.log( Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ) ;