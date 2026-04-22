/* This JavaScript module is designed to process time-series data
 * from standard input, identifying specific temporal gaps.
 * It's structured to handle multiple blocks of input data sequentially.
 */

// Aquire the file system module to interact with input/output streams.
var rawSystemInput = require ('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Pre-process the acquired raw input text:
// 1. Remove leading/trailing whitespace.
// 2. Divide the entire string into an array of individual line fragments.
var processedDataLines = (rawSystemInput . trim ()) . split ( "\n" ) ;

// Begin the primary data processing cycle.
// This loop continues as long as there are lines remaining in the input queue.
while ( processedDataLines . length  >  0 )
{
    // Initialize a dynamic array to accumulate the results for the current data block.
    let  calculatedOutputRecords  =  [ ] ;

    // Declare variables that need to persist their values across iterations of the inner loop.
    // Using 'var' here ensures function-level scope, mimicking the original code's hoisting behavior.
    var  lastRecordedEndTimeInMinutes ;
    var  associatedTextualLabel ;

    /*
     * Extract and parse configuration parameters from the very first line of the current block.
     *   - The line is first retrieved and removed from the queue (`processedDataLines.shift()`).
     *   - It's then segmented by spaces (`.split(" ")`).
     *   - Finally, each segment is converted into a numeric value (`.map(Number)`).
     * The first element typically defines the count of subsequent data entries,
     * and the second defines a minimum time difference threshold.
     */
    const  operationalParameters  =  ( processedDataLines . shift () ) . split ( " " ) . map ( Number ) ;

    // Iterate through the specified number of data entries within the current block.
    // The iteration count is determined by the first operational parameter.
    for ( let  currentIterationIndex  =  0 ;  currentIterationIndex  <  operationalParameters [ 0 ] ;  currentIterationIndex++ )
    {
        // Obtain the next line of time-related data and break it down into its constituent parts.
        let  individualTimeComponents  =  ( processedDataLines . shift () ) . split ( " " ) ;

        /*
         * Parse the initial time string (found at index 0) into its hour and minute integers.
         * For instance, "09:45" would be transformed into an array like `[9, 45]`.
         */
        let  currentEntryStartTimeParts  =  individualTimeComponents [ 0 ] . split ( ":" ) . map ( function ( timeStringSegment )
        {
            // Convert the string segment to an integer, specifying base 10 for clarity.
            return  parseInt ( timeStringSegment , 10 ) ;
        } ) ;

        // Conditional check: This block executes only if we have a previous entry to compare against.
        if ( currentIterationIndex  >  0 )
        {
            // Compute the total minutes from midnight for the current entry's start time.
            let  totalCurrentEntryMinutes  =  currentEntryStartTimeParts [ 0 ] * 60  +  currentEntryStartTimeParts [ 1 ] ;

            // Compute the total minutes from midnight for the previously stored end time.
            let  totalPreviousEntryMinutes  =  lastRecordedEndTimeInMinutes [ 0 ] * 60  +  lastRecordedEndTimeInMinutes [ 1 ] ;

            // Calculate the time span (in minutes) between the previous end and current start.
            let  timeGapDuration  =  totalCurrentEntryMinutes  -  totalPreviousEntryMinutes ;

            // Evaluate if the calculated time gap meets or exceeds the predefined threshold.
            if ( timeGapDuration  >=  operationalParameters [ 1 ] )
            {
                // If the condition is met, append a new record to the output list.
                // This record combines the associated label with the significant time gap.
                calculatedOutputRecords . push ( associatedTextualLabel  +  " "  +  ( timeGapDuration ) ) ;
            }
        }

        /*
         * Parse the ending time string (from index 2) into hour and minute integers.
         * This processed value is retained for comparison with the *next* entry's start time.
         */
        lastRecordedEndTimeInMinutes  =  individualTimeComponents [ 2 ] . split ( ":" ) . map ( function ( componentValue )
        {
            // Ensure proper integer conversion.
            return  parseInt ( componentValue , 10 ) ;
        } ) ;

        // Extract the descriptive label string (from index 3).
        // This label is also stored for potential use with the *next* entry.
        associatedTextualLabel  =  individualTimeComponents [ 3 ] ;

    } // End of the inner loop processing individual data entries.

    // After processing all entries in the current block, output the total count of significant records found.
    console . log ( calculatedOutputRecords . length ) ;

    // Iterate through each identified outcome and print it to the standard output.
    calculatedOutputRecords . forEach ( function ( singleResultItem )
    {
        console . log ( singleResultItem ) ;
    } ) ;

} // End of the main while loop, signaling completion of all data blocks.