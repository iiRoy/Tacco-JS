/*
 * This JavaScript script processes input from the standard input stream
 * to calculate a specific numerical result based on three integer values.
 *
 * The script expects a single line of space-separated numbers as input.
 * It then determines how many integers 'i' within a given range [a, b)
 * are exact divisors of a third integer 'c'.
 *
 * The final count is printed to the standard output.
 */

// Ensure the standard input stream remains active for data processing.
process.stdin.resume ( ) ;

// Configure the encoding for the incoming data from stdin to 'utf8'.
process.stdin.setEncoding ( 'utf8' ) ;


// Set up an event listener for the 'data' event on the standard input.
// This function will execute each time a chunk of data is received.
process.stdin.on (
    'data' ,
    function (
        chunk
    )
    {
        // Split the received data chunk by spaces to separate the numbers.
        var   line   =   chunk . split ( ' ' ) ;

        // Convert the first part of the input (index 0) to a number, storing it as 'a'.
        var a = Number ( line [ 0 ] ) ;

        // Convert the second part of the input (index 1) to a number, storing it as 'b'.
        var b = Number ( line [ 1 ] ) ;

        // Convert the third part of the input (index 2) to a number, storing it as 'c'.
        var c = Number ( line [ 2 ] ) ;

        // Initialize a counter variable to keep track of the occurrences.
        var count = 0 ;

        // Begin a loop that iterates from 'a' up to (but not including) 'b'.
        for (
            var i = a ;
            i < b ;
            i ++
        )
        {
            // Check if 'c' is perfectly divisible by the current value of 'i'.
            // The modulo operator (%) returns the remainder of a division.
            if (
                c % i == 0
            )
            {
                // If 'c' is divisible by 'i' with no remainder, increment the counter.
                count ++ ;
            }
        }

        // Output the final calculated count to the console.
        console . log ( count ) ;
    }
) ; // End of the data event handler function.