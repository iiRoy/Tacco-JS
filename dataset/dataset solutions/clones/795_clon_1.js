/*
 * This JavaScript code processes a series of time intervals to determine
 * the minimum number of "trains" (resources) required to handle all intervals
 * without any overlaps, assuming a train can be reused once its current
 * interval ends. This is a classic activity selection problem variant.
 *
 * Input is read from standard input, typically `/dev/stdin`.
 * Each test case starts with an integer `n` indicating the number of intervals.
 * `n=0` signifies the end of input.
 * Following `n` are `n` lines, each containing two time strings (HH:MM:SS)
 * representing the start and end times of an interval, separated by a space.
 *
 * The algorithm sorts intervals by their start times. Then, it iterates
 * through the sorted intervals, maintaining a list of end times for currently
 * active trains. If an existing train can finish before or at the start of
 * the current interval, it's reused. Otherwise, a new train is required.
 *
 * Author: Expert Code Cloner
 * Date: 2023-10-27
 * Version: 1.0 (Type I Clone)
 */

/*
 * Module imports and initial input processing.
 * Reads the entire standard input as a string and prepares it for parsing.
 */
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace from input and split it into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;


/*
 * Main processing loop for multiple test cases.
 * Continues until a test case with n = 0 is encountered.
 */
while ( true ) {

    // Read the number of intervals for the current test case.
    // `shift()` removes the first element from `arr` and returns it.
    // `-0` converts the string to a number.
    var n = arr . shift ( ) - 0 ;

    // If n is 0, it indicates the end of input, so break the loop.
    if ( n == 0 ) break ;


    // Initialize an array to store parsed time intervals.
    var ary = [ ] ;

    /*
     * Loop to read and parse `n` time intervals.
     * `n--` acts as a decrementing counter for the loop.
     */
    while ( n -- ) {

        // Read the next line, which contains start and end time strings.
        // Split the line by space to separate start and end times.
        var hms = arr . shift ( ) . split ( " " ) ;

        // Parse the start time string (HH:MM:SS) into an array of numbers [H, M, S].
        var start = hms [ 0 ] . split ( ":" ) . map ( Number ) ;

        // Parse the end time string (HH:MM:SS) into an array of numbers [H, M, S].
        var end = hms [ 1 ] . split ( ":" ) . map ( Number ) ;


        // Convert start time from [H, M, S] to total seconds from midnight.
        // H * 3600 (seconds in an hour) + M * 60 (seconds in a minute) + S.
        start = start [ 0 ] * 60 * 60 + start [ 1 ] * 60 + start [ 2 ] ;

        // Convert end time from [H, M, S] to total seconds from midnight.
        end = end [ 0 ] * 60 * 60 + end [ 1 ] * 60 + end [ 2 ] ;

        // Push the calculated start and end times (in seconds) as a pair into `ary`.
        ary . push ( [ start , end ] ) ;
    }

    // Sort the array of intervals based on their start times in ascending order.
    ary . sort ( function ( a , b ) { return a [ 0 ] - b [ 0 ] ; } ) ;


    // Initialize an array to keep track of the end times of currently active trains.
    var train = [ ] ;

    // Initialize a counter for the minimum number of trains required.
    var cnt = 0 ;

    /*
     * Iterate over each sorted interval to assign it to a train.
     * This uses a greedy approach.
     */
    ary . forEach ( function ( v ) {

        // Check if there are any active trains.
        if ( train . length == 0 ) {
            // If no trains are active, a new train is definitely needed.
            cnt ++ ;
            // Add the end time of the current interval to the `train` array.
            train . push ( v [ 1 ] ) ;
        } else {
            // If there are active trains, sort them by their end times.
            // This allows us to quickly find the train that finishes earliest.
            train . sort ( function ( a , b ) { return a - b ; } ) ;

            // Check if the earliest finishing train (train[0]) can be reused
            // for the current interval (v[0] is its start time).
            if ( train [ 0 ] <= v [ 0 ] ) {
                // If it can be reused, remove its old end time.
                train . shift ( ) ;
                // Add the end time of the current interval, effectively reusing the train.
                train . push ( v [ 1 ] ) ;
            } else {
                // If no existing train can be reused (all active trains finish too late),
                // a new train is required.
                cnt ++ ;
                // Add the end time of the current interval to the `train` array.
                train . push ( v [ 1 ] ) ;
            }
        }
    } ) ;

    // Output the minimum number of trains required for the current test case.
    console . log ( cnt ) ;
}

// End of program.