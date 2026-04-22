/*
 * This is a JavaScript program designed to determine the era
 * based on a given date input. It parses the date and compares it
 * against a specific timestamp to decide if it falls within the
 * Heisei era or is yet to be determined (TBD).
 */

// Define the main function that processes the input string.
function   Main (   input   )
{
    // The input string is expected in a 'YYYY/MM/DD' format.
    // It is split by the '/' character to extract individual date components.
    input  =  input . split ( '/' ) ;

    // A blank line for visual separation.


    /*
     * Calculate the timestamp in milliseconds since the Unix epoch.
     * The input components (year, month, day) are used to construct
     * a date string which is then parsed by Date.parse().
     * Note: Date.parse might behave differently across environments
     * for non-standard date strings, but this format is generally safe.
     */
    var   ms   =   Date . parse (   `${ input [ 0 ] }-${ input [ 1 ] }-${ input [ 2 ] }`   ) ;


    // Another blank line.


    // Check if the calculated timestamp is less than a specific epoch time.
    // This specific time (1556636400000) corresponds to May 1, 2019 00:00:00 UTC.
    // This is the start of the Reiwa era, so anything before it is Heisei.
    if  (  ms  <  1556636400000  )
    {
        // If the timestamp is before the Reiwa era start, it's Heisei.
        return   console . log (   'Heisei'   ) ;
    }
    else
    {
        // Otherwise, it falls on or after the Reiwa era start (or future dates).
        // For this specific problem, it's labeled as 'TBD' (To Be Determined).
        return   console . log (   'TBD'   ) ;
    }
}


/*
 * This is the entry point of the script when executed.
 * It reads the input from standard input (/dev/stdin) using Node.js's
 * 'fs' module, specifically readFileSync, and decodes it as 'utf8'.
 * The read content is then passed to the Main function for processing.
 */
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;