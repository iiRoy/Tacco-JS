/* This script processes input data from standard input.
   It reads lines, parses numerical data, and performs calculations.
   The main goal is to identify qualified entries based on accumulated amounts. */
process.stdin.resume( ); // Ensure the standard input stream stays open for data reception.
process.stdin.setEncoding( 'utf8' ); // Set the character encoding for incoming data to UTF-8.

// This is the core event listener for incoming data.
// The 'data' event fires when there is data available to read from stdin.
process.stdin.on ( 'data' , function ( input ) {


    /*
     * The input is a string that might contain multiple lines.
     * First, remove leading/trailing whitespace, then split into an array of lines.
     */
    var   line   =   input . trim ( ) . split ( "\n" ) ;


    // Initialize a loop counter for iterating through the 'line' array.
    var   i   =   0   ;


    // Main processing loop: continues as long as there are lines to process.
    for ( i = 0 ; i < line . length ; )
    {
        // Read the next line, parse it as an integer, and store it in N.
        // The 'i++' increments the line counter after use.
        var   N   =   parseInt ( line [ i ++ ] . trim ( ) ) ;


        // Check if the parsed value N is zero. A zero value signals the end of input or a batch.
        if (   N   ===   0   ) {
            // If N is 0, exit the loop.
            break ;
        }
        else // If N is not zero, proceed with data processing for this batch.
        {
            // Declare several variables that will be used within this block.
            var   found ,   len ,   k ,   res ;

            // Initialize two arrays: 'qualified' to store identifiers, 'amount' to store corresponding sums.
            var   qualified   =   [ ] ,   amount   =   [ ] ;


            // Loop N times, processing N datasets for the current batch.
            for ( var   j = 0 ;   j < N ;   ++ j ) {
                // Read the next line, trim it, and split it by spaces to get individual data points.
                var   dataset   =   line [ i ++ ] . trim ( ) . split ( " " ) ;

                // Calculate 'res' by multiplying the second and third elements of the dataset (parsed as integers).
                res   =   parseInt ( dataset [ 1 ] )   *   parseInt ( dataset [ 2 ] ) ;

                // Get the current length of the 'qualified' array.
                len   =   qualified . length ;


                // Reset 'found' flag for the current dataset.
                found   =   0 ;

                // Re-get the length (redundant but allowed for Type I clone).
                len   =   qualified . length ;


                // Iterate through the already collected qualified entries.
                for ( k = 0 ;   k < len ;   ++ k ) {
                    // Check if the current dataset's identifier (first element) matches an existing qualified entry.
                    if (   qualified [ k ]   ==   dataset [ 0 ]   ) {
                        // If a match is found, set 'found' flag to 1.
                        found   =   1 ;
                        // Add 'res' to the existing amount for this qualified entry.
                        amount [ k ]   =   amount [ k ]   +   res ;
                        // Exit the inner loop as the entry has been processed.
                        break ;
                    }
                }


                // If the current dataset's identifier was not found in 'qualified' array.
                if (   ! found   ) {
                    // Add the new identifier to the 'qualified' array.
                    qualified . push ( dataset [ 0 ] ) ;
                    // Add its corresponding 'res' amount to the 'amount' array.
                    amount . push ( res ) ;
                }
            } // End of inner loop for processing N datasets.


            // Reset 'found' flag for the final check.
            found   =   0 ;

            // Get the length of the qualified entries array.
            len   =   qualified . length ;


            // Iterate through the collected qualified entries and their amounts.
            for ( k = 0 ;   k < len ;   ++ k ) {
                // Check if the accumulated amount for an entry is greater than or equal to 1,000,000.
                if (   amount [ k ]   >=   1000000   ) {
                    // If it qualifies, print its identifier to the console.
                    console . log ( qualified [ k ] ) ;
                    // Set 'found' flag to 1, indicating at least one qualified entry was found.
                    found   =   1 ;
                }
            }

            // If no qualified entries were found in the current batch (i.e., 'found' is still 0).
            if (   ! found   ) {
                // Print "NA" to the console.
                console . log ( "NA" ) ;
            }
        } // End of else block for N !== 0.
    } // End of main processing loop.

} ) ; // End of 'data' event listener.