/* This is a Type I clone generated for demonstration purposes. */
/* Original author information has been deliberately removed as per cloning rules. */

var fs = require ( 'fs' )
  , length = fs.fstatSync ( process.stdin.fd ).size // Determine the size of the standard input.
  , buffer = new Buffer ( length ) // Create a buffer to hold the input data.
  , bytesRead = fs.readSync ( process.stdin.fd, buffer, 0, length, 0 ) // Read data from stdin into the buffer.
  , input = buffer.toString ( 'utf8', 0, bytesRead ).split ( '\n' ) ; // Convert buffer to UTF-8 string and split into lines.

// The main processing function is called immediately after setup.
main ( ) ;


/**
 * Converts a time string from "HH:MM" format to total minutes past midnight.
 *
 * @param   { string }  t   The time string to be converted.
 * @returns { number }      The total number of minutes.
 */
function transTime ( t )
{
    // Split the time string into hours and minutes parts.
    var temp = t.split ( ':' );

    // Convert string parts to numbers using unary plus operator and calculate total minutes.
    return +temp[ 0 ] * 60 + +temp[ 1 ];
}


/**
 * This is the primary function responsible for processing the input data
 * and generating the required output based on specific conditions.
 */
function main ( )
{
    // Parse the first line of input to extract 'n' (number of entries) and 't' (time threshold).
    var temp = input[ 0 ].split ( ' ' )
      , n = +temp[ 0 ] // 'n' represents the total count of subsequent data entries.
      , t = +temp[ 1 ] ; // 't' is a critical time difference threshold.

    // Process the second line of input to initialize the first set of time and station data.
    temp = input[ 1 ].split ( ' ' ) ;

    // Declare and initialize variables for tracking segment times and station names.
    var time1 = transTime ( temp[ 0 ] ) // The start time of the current segment.
      , sta1 = temp[ 1 ] // The station name associated with time1.
      , time2 = transTime ( temp[ 2 ] ) // The end time of the previous segment.
      , sta2 = temp[ 3 ] // The station name associated with time2.
      , ans = [ ] ; // An array to accumulate the results that meet the criteria.

    // Iterate through the remaining input lines, starting from the third line (index 2).
    for ( var i = 2; i <= n; i++ )
    {
        // Split the current line of input to extract its components.
        temp = input[ i ].split ( ' ' ) ;

        // Update 'time1' with the start time from the current line.
        time1 = transTime ( temp[ 0 ] ) ;

        // Check if the time difference between current 'time1' and previous 'time2'
        // is greater than or equal to the threshold 't'.
        if ( t <= time1 - time2 )
        {
            // If the condition is met, record the 'sta2' (previous station) and
            // the calculated time difference into the 'ans' array.
            ans.push ( [ sta2, time1 - time2 ] ) ;
        }

        // Update 'sta1', 'time2', and 'sta2' for the next iteration of the loop.
        // These values represent the "previous" segment's end for the *next* comparison.
        sta1 = temp[ 1 ] ;
        time2 = transTime ( temp[ 2 ] ) ;
        sta2 = temp[ 3 ] ;

        // The original code had a commented-out console.log here.
        // It has been removed in this Type I clone.
    }

    // Output the total number of results found.
    console.log ( ans.length ) ;

    // Loop through the 'ans' array and print each stored result.
    for ( i = 0; i < ans.length; i++ )
    {
        // Print the station name and the time difference, separated by a space.
        console.log ( ans[ i ][ 0 ] + ' ' + ans[ i ][ 1 ] ) ;
    }
}