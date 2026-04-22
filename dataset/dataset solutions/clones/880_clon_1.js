/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace (spaces, tabs, newlines) and comments have been modified
 * to create a visually distinct, yet functionally equivalent, version.
 */

// Import the 'fs' (file system) module for reading input.
var input    = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


/*
 * Process the raw input:
 * 1. Trim any leading/trailing whitespace.
 * 2. Split the input string by newline characters to get an array of lines.
 */
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Main processing loop: Continue as long as there are lines in the array.
while (   Arr . length   !=   0   )
{

    // Initialize an empty array to store results for the current test case.
    var   result   =   [ ] ;


    /*
     * Extract the first line, which contains N (number of entries) and T (time difference threshold).
     * 1. Remove the first element from 'Arr' (shift).
     * 2. Split it by space.
     * 3. Convert each part to a number using the 'Number' constructor.
     */
    var   NT   =   ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

    // Loop N times, where N is the first element of NT (NT[0]).
    for (   var   i   =   0   ;   i   <   NT [ 0 ]   ;   i ++   )
    {

        // Get the next line of data, representing a record.
        var   arr   =   ( Arr . shift ( ) ) . split ( " " ) ;

        // Parse the start time (arr[0]) into hours and minutes.
        // The time is in "HH:MM" format.
        var   a   =   arr [ 0 ] . split ( ":" ) . map (
            function ( v )
            {
                // Convert string parts to integers with base 10.
                return   parseInt ( v ,   10 ) ;
            }
        ) ;


        /*
         * Check if this is not the first entry (i > 0).
         * Comparisons are only made between consecutive entries.
         */
        if (   i   >   0   )
        {

            // Calculate total minutes for the current entry's start time.
            var   A   =   a [ 0 ]   *   60   +   a [ 1 ] ;

            // Calculate total minutes for the previous entry's end time.
            var   B   =   b [ 0 ]   *   60   +   b [ 1 ] ;

            // If the time difference is greater than or equal to the threshold NT[1],
            // record the entry's identifier and the time difference.
            if (   A   -   B   >=   NT [ 1 ]   )
                result . push (   c   +   " "   +   ( A   -   B )   ) ;

        } // End of if (i > 0) block


        // Parse the end time (arr[2]) for the current entry.
        // This 'b' variable will be used in the *next* iteration's comparison.
        var   b   =   arr [ 2 ] . split ( ":" ) . map (
            function (   v   )
            {
                return   parseInt ( v ,   10 ) ;
            }
        ) ;

        // Store the identifier (arr[3]) for the current entry.
        // This 'c' variable will be used in the *next* iteration if a match is found.
        var   c   =   arr [ 3 ] ;

    } // End of for loop


    // Output the total number of matching entries found for the current test case.
    console . log ( result . length ) ;

    // Iterate through the 'result' array and print each recorded item.
    result . forEach (
        function (   v   )
        {
            // Print each result entry.
            console . log ( v ) ;
        }
    ) ;

} // End of while loop