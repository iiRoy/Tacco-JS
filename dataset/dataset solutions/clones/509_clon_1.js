/* This script processes input data to find a specific pattern.
   It reads lines of numbers and performs calculations to identify
   a particular anomaly based on differences between consecutive values. */
process . stdin . resume ( ) ; // Ensure the standard input stream stays open.

process . stdin . setEncoding ( 'utf8' ) ; // Set the encoding for incoming data.

process . stdin . on ( 'data' , function ( input )
{
    // Declare variables for loop iteration and tracking index.
    var edx , ii ;

    // Split the input into individual lines after trimming whitespace.
    var lines = input . trim ( ) . split ( "\n" ) ;


    // Iterate through each line of input data.
    for ( var i = 0 ; i < lines . length ; ++ i )
    {
        // Declare variables specific to each dataset.
        var n , diffCnt ;
        var dataset , x1 , x2 ;
        var map ;

        // Parse the first number on the line as 'n', then increment 'i'.
        n = parseInt ( lines [ i ++ ] ) ;

        // If 'n' is 0, it signifies the end of input or a termination condition.
        if ( n === 0 )
        {
            break ; // Exit the loop.
        }

        // Initialize an array 'map' to store differences.
        map = new Array ( n + 1 ) ;

        // Get the actual dataset for the current 'n'.
        dataset = lines [ i ] . trim ( ) . split ( " " ) ;

        // Parse the second and first elements of the dataset.
        x2 = parseInt ( dataset [ 1 ] ) ;
        x1 = parseInt ( dataset [ 0 ] ) ;

        // Calculate the first difference and store it in 'map'.
        map [ 1 ] = x2 - x1 ;

        // Initialize anomaly tracking variables.
        edx = 0 ;       // Index where a difference was first detected.
        diffCnt = 0 ;   // Count of detected differences.

        x1 = x2 ;       // Update x1 for the next iteration.

        // Loop through the rest of the dataset to find patterns.
        for ( ii = 2 ; ii < dataset . length ; ++ ii )
        {
            // Parse the current value.
            x2 = parseInt ( dataset [ ii ] ) ;

            // Calculate the difference with the previous value.
            map [ ii ] = x2 - x1 ;

            // Check if the current difference is different from the previous one.
            if ( map [ ii ] != map [ ii - 1 ] )
            {
                edx = ii ;      // Store the index of this new difference.
                ++ diffCnt ;    // Increment the difference count.
            }
            x1 = x2 ; // Update x1 for the next comparison.


            // Check for specific anomaly conditions.
            if ( diffCnt === 3 )
            {
                console . log ( dataset [ edx - 2 ] ) ; // Output the specific element.
                return ; // Terminate execution as the condition is met.
            }
            else if ( diffCnt == 1 && ii - edx > 1 )
            {
                console . log ( dataset [ edx - 2 ] ) ; // Output the specific element.
                return ; // Terminate execution.
            }
        } // End of inner loop for dataset processing.

        // If no specific anomaly triggered a return, output the element at 'edx'.
        console . log ( dataset [ edx ] ) ;
    } // End of outer loop for lines processing.

} ) ; // End of 'data' event listener.