/*
 * This script reads input from the standard input stream, processes it line by line,
 * and then outputs a letter grade based on a set of scoring rules.
 * It's designed to handle multiple score entries until a specific termination condition is met.
 */


var input = ""; // Declares and initializes an empty string variable to accumulate all input data.

// Resumes the standard input stream, making it ready to receive data.
process.stdin.resume();

// Sets the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding( 'utf-8' );


/*
 * Attaches an event listener to the 'data' event of the standard input stream.
 * This function is called whenever a chunk of data is received.
 * The received 'chunk' is appended to the 'input' string.
 */
process.stdin.on( 'data', function( chunk )
{
    input += chunk; /* Appends the current data chunk to the 'input' string. */
} );


/*
 * Attaches an event listener to the 'end' event of the standard input stream.
 * This function is executed once the input stream has ended (e.g., EOF is received).
 * All accumulated input is then processed within this callback.
 */
process.stdin.on( 'end', function() {
    // Splits the accumulated input string into an array of lines, using the newline character as a delimiter.
    input = input.split( "\n" );

    // Initializes a loop counter 'i'. This variable is implicitly global.
    i = 0;

    /*
     * Begins a while loop that iterates through the input array.
     * The loop continues as long as the current line's value is not '0'.
     * '0' acts as a sentinel value to signal the end of valid data entries.
     */
    while ( input[ i ] != 0 )
    {
        // Splits the current input line into an array of strings ('arr') using a space as the delimiter.
        arr = input[ i ].split( " " );

        /*
         * Checks for a specific termination condition:
         * If all three elements of the 'arr' array are -1, it indicates the end of data.
         * In this case, the loop is terminated using 'break'.
         */
        if ( arr[0] == -1 && arr[1] == -1 && arr[2] == -1 )
        {
            break; // Exits the 'while' loop immediately.
        }

        // If the first score (arr[0]) is -1, it is re-assigned to 0.
        if ( arr[0] == -1 )
        {
            arr[0] = 0;
        }

        // If the second score (arr[1]) is -1, it is re-assigned to 0.
        if ( arr[1] == -1 )
        {
            arr[1] = 0;
        }

        // Calculates the sum of the first two scores.
        // parseInt is used to convert string elements to integers, with base 10 specified.
        sum = parseInt( arr[0], 10 ) + parseInt( arr[1], 10 );


        /*
         * A series of conditional statements to determine the final grade based on the 'sum'
         * and, in one specific case, the third score (arr[2]).
         */
        if ( sum >= 80 )
        {
            console.log( "A" ); // Prints 'A' for a sum of 80 or more.
        }
        else if ( sum >= 65 )
        {
            console.log( "B" ); // Prints 'B' for a sum between 65 and 79.
        }
        else if ( sum >= 50 )
        {
            console.log( "C" ); // Prints 'C' for a sum between 50 and 64.
        }
        else if ( sum >= 30 )
        {
            // If sum is between 30 and 49, an additional check on the third score is performed.
            if ( arr[2] >= 50 )
            {
                console.log( "C" ); // Prints 'C' if the third score is 50 or more.
            }
            else
            {
                console.log( "D" ); // Prints 'D' if the third score is less than 50.
            }
        }
        else
        {
            console.log( "F" ); // Prints 'F' for a sum less than 30.
        }

        i++; // Increments the loop counter to move to the next line of input.
    }
} );