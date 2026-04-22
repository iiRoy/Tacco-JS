const processInputData = ( rawDataString ) => {
    /*
     * This function serves as the primary entry point for processing textual input.
     * It parses the input, extracts specific parameters, and then filters data records
     * based on a weighted sum condition, finally outputting the count of matching records.
     */

    // First, split the entire input content into an array of individual text lines.
    let dataLines = rawDataString.split ( '\n' );

    // The initial line often contains configuration or metadata.
    // We parse it here by splitting on spaces, though it's not used in the subsequent filtering logic.
    // Its inclusion ensures structural similarity with the original program.
    const initialParameters = dataLines[ 0 ] . split ( ' ' );

    // The second line is interpreted as a collection of numerical coefficients or weights.
    // These values will be used in the weighted sum calculation for each data record.
    const multiplierArray = dataLines[ 1 ] . split ( ' ' );

    // After extracting the first two lines for parameters and multipliers,
    // the remaining lines in the 'dataLines' array are the actual records to be processed.
    dataLines = dataLines . slice ( 2 );

    // The final step involves filtering the data records and reporting the count of those
    // that satisfy a specific condition.
    console . log (
        dataLines . filter (
            // For each individual data record string (e.g., "10 20 30"),
            // we apply a test to see if its weighted sum is positive.
            ( recordEntry ) => {
                // Split the current record entry into its constituent string tokens.
                return recordEntry . split ( ' ' ) . reduce (
                    ( runningTotal , tokenValue , position ) => {
                        // Convert each token string to a number and multiply it by the
                        // corresponding multiplier from 'multiplierArray' based on its position.
                        // The products are then accumulated into 'runningTotal'.
                        return runningTotal + ( tokenValue * multiplierArray[ position ] );
                    },
                    0 // Initialize the running total for the sum to zero.
                ) > 0; // The condition: is the final accumulated weighted sum greater than zero?
            }
        ) . length // Count the total number of records that passed the filtering condition.
    );
};

// Execution starts here: Read the entire content from standard input synchronously,
// using UTF-8 encoding, and then pass it to the 'processInputData' function.
processInputData (
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
);