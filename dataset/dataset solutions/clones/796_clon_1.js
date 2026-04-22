/*
 * This JavaScript code reads input from /dev/stdin, processes time intervals,
 * and calculates the maximum number of non-overlapping intervals that can be selected.
 * It's designed to solve a specific problem where time ranges are provided.
 */

// Import the 'fs' (file system) module to read from standard input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;

// Split the entire input content by newline characters to get individual lines.
var lines = input.split( '\n' ) ;

// Declare a variable to hold the current line being processed, initialized to null.
var line = null ;

// Start a loop that continues as long as there are lines to process.
// The 'lines.shift()' method removes the first element from the 'lines' array
// and returns it, effectively consuming lines one by one.
while ( ( line = lines.shift() ) )
{
    // Convert the current line (which should be a number) into an integer.
    var num = parseInt( line ) ;

    // If the parsed number is 0, it signifies the end of input for a test case,
    // so break out of the while loop.
    if ( num == 0 )
    {
        break ; // Exit the loop if the input number is zero.
    }

    // Initialize an empty array to store the time intervals for the current test case.
    var arr = [] ;

    // Loop 'num' times to read each time interval.
    for ( var i = 0 ; i < num ; i++ )
    {
        // Get the next line, which contains the start and end times for an interval.
        line = lines.shift() ;

        // Split the line by space to get the start and end time strings.
        // Map each time string to a Date object (using a dummy date to allow time comparison)
        // and then convert it to its numeric timestamp representation using the unary plus operator.
        var args = line . split( ' ' ) . map( function( t )
        {
            // Create a new Date object with a fixed date and the time string.
            // The unary plus operator converts the Date object to its milliseconds since epoch.
            return + ( new Date( '2000-01-01 ' + t ) ) ;
        } ) ;

        // Add the processed start and end time (as timestamps) to the 'arr' array.
        arr . push( args ) ;
    }

    // Initialize 'mainTrain' to 1. This variable will store the maximum number of
    // non-overlapping intervals found in any iteration.
    var mainTrain = 1 ;

    // Iterate through the array of intervals.
    // Each 'val' represents a potential "first" interval in a non-overlapping set.
    for ( var i = 0 ; i < arr . length ; i++ )
    {
        // Get the current interval 'val' at index 'i'.
        var val = arr[ i ] ;

        // Initialize 'train' to 1 for the current 'val'.
        // 'train' will count non-overlapping intervals starting with 'val'.
        var train = 1 ;

        // Initialize an array to store indices of intervals that are selected
        // (or effectively "deleted" from consideration for *this specific 'val' run*).
        var delNum = [] ;

        // Iterate through the remaining intervals starting from 'i + 1'.
        // This inner loop finds intervals that overlap with 'val'.
        for ( var j = i + 1 ; j < arr . length ; j++ )
        {
            // Get the subsequent interval 'sub' at index 'j'.
            var sub = arr[ j ] ;

            // Check for overlap conditions.
            // An overlap occurs if:
            // 1. The end of 'val' is after or at the start of 'sub' AND
            // 2. The start of 'sub' is before or at the end of 'val'.
            // The condition `val[1] <= sub[0] || sub[0] <= val[0]` means they *do not* overlap.
            // If `val[1] <= sub[0]`: val ends before or at sub starts (no overlap)
            // If `sub[0] <= val[0]`: sub starts before or at val starts (no overlap in specific sense, but implies sub is earlier or concurrent)
            // The `else` block is executed when there *is* an overlap.
            if ( ( val[ 1 ] <= sub[ 0 ] ) || ( sub[ 0 ] <= val[ 0 ] ) )
            {
                // No overlap with the current 'val' interval. Do nothing.
            }
            else
            {
                // Overlap detected.
                // Add the index 'j' of the overlapping 'sub' interval to 'delNum'.
                delNum . push( j ) ;

                // Increment the 'train' count, as this 'sub' interval is considered part of the overlapping set.
                train++ ;
            }
        }

        // After checking all subsequent intervals against 'val', mark the overlapping ones as null.
        // This is a common strategy to effectively remove elements during iteration
        // before filtering.
        delNum . forEach( function( k )
        {
            arr[ k ] = null ; // Set the element at index 'k' to null.
        } ) ;

        // Filter out all null elements from 'arr'.
        // This effectively removes the intervals that overlapped with 'val'
        // for the subsequent iterations of the outer loop.
        arr = arr . filter( function( p )
        {
            return p != null ; // Keep elements that are not null.
        } ) ;

        // Update 'mainTrain' with the maximum value between its current value and 'train'.
        // This keeps track of the largest set of overlapping intervals found so far.
        mainTrain = Math . max( mainTrain , train ) ;
    }

    // Print the final result for the current test case.
    console . log( mainTrain ) ;
}

// End of the program.