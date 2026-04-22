/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive modifications to whitespace and comments,
 * while preserving the exact logical structure and identifiers.
 *
 * The purpose of this script is to read sequences of numbers from standard input,
 * calculate the maximum subarray sum for each sequence,
 * and then output these maximum sums to the console.
 */

function main()
{
    /* Declare all necessary variables at the beginning of the function.
     * These variables will be used for loop control, array indexing,
     * storing sequence data, and tracking sums and maximums.
     *
     * - i: Serves as an outer loop counter and general index for the global 'input' array.
     * - j: Used as an inner loop counter, primarily for indexing within the 'seq' array.
     * - k: An innermost loop counter, specifically for iterating through subarrays
     *      during the maximum subarray sum calculation.
     * - n: Stores the length of the current sequence of numbers being processed.
     * - seq: An array that will hold the current sequence of numbers.
     * - max: Stores the maximum subarray sum found so far for the current sequence.
     * - sum: Stores the current subarray sum during the calculation process.
     */
    var
        i,
        j,
        k,
        n,
        seq,
        max,
        sum;

    // The main loop continues as long as 'n' (the sequence length) is a valid, non-zero number.
    // The 'i' variable is incremented *after* its value is used to access 'input[i]'
    // for reading the sequence length.
    for ( i = 0 ; n = parseInt( input[i++] , 10 ) ; )
    {
        // Initialize an empty array to store the current sequence of numbers.
        // This array will be re-populated for each new 'n'.
        seq = [ ] ;

        /* This loop populates the 'seq' array with 'n' numbers from the global 'input' array.
         * The 'parseInt' function is crucial here to convert the string representations
         * from the input into actual integer numbers. The radix '10' is specified
         * to ensure correct parsing of decimal numbers.
         * The index 'i + j' correctly offsets into the global 'input' array
         * to read the sequence elements following the 'n' value. */
        for ( j = 0 ; j < n ; j++ )
        {
            seq[j] = parseInt( input[ i + j ] , 10 ) ;
        }

        // After processing 'n' numbers for the current sequence,
        // advance the 'i' pointer in the global 'input' array by 'n' positions.
        // This ensures that the next iteration of the outer loop starts at the
        // correct position to read the next 'n' value.
        i += n ;

        // Initialize 'max' to negative infinity. This ensures that any valid
        // sum (even a negative one, if all numbers are negative) will be
        // greater than the initial 'max' and thus correctly captured.
        max = -Infinity ;

        /* This block of nested loops implements a brute-force approach
         * to find the maximum subarray sum within the 'seq' array.
         *
         * The outer 'j' loop iterates through all possible starting points
         * of a subarray within the current sequence. */
        for ( j = 0 ; j < n ; j++ )
        {
            // For each new starting point 'j', the 'sum' for the current subarray
            // is reset to zero.
            sum = 0 ;

            /* The inner 'k' loop extends from the current starting point 'j'
             * to the end of the sequence 'n'. It calculates the sum of all
             * subarrays that begin at index 'j'. */
            for ( k = j ; k < n ; k++ )
            {
                // Add the current element 'seq[k]' to the running sum of the subarray.
                sum += seq[k] ;

                // Compare the current subarray 'sum' with the overall 'max' found so far.
                // If the current 'sum' is greater, update 'max'.
                if ( sum > max )
                {
                    max = sum ;
                }
            }
        }

        // Once the maximum subarray sum for the current sequence has been determined,
        // print this value to the console, followed by a newline.
        console.log ( max ) ;
    }
}


/* Global variable 'input' to store the raw data read from standard input.
 * It is initialized as an empty string and later populated by chunks of data. */
var
    input = '' ;


// Resume the standard input stream. This is necessary to start listening for data.
process.stdin.resume ( ) ;

// Set the encoding for the standard input stream to 'utf8'.
// This ensures that characters are correctly interpreted.
process.stdin.setEncoding ( 'utf8' ) ;

/* Event listener for the 'data' event on the standard input stream.
 * This function is called whenever a chunk of data is received.
 * The 'chunk' argument contains the received data. */
process.stdin.on ( 'data' , function ( chunk )
{
    // Append the received 'chunk' of data to the global 'input' string.
    input += chunk ;
} ) ;

/* Event listener for the 'end' event on the standard input stream.
 * This function is executed when there is no more data to be read from stdin.
 * It typically signifies the end of the input stream. */
process.stdin.on ( 'end' , function ( )
{
    // After all input has been received, split the accumulated 'input' string
    // by newline characters. This converts the single string into an array
    // where each element corresponds to a line from the input.
    input = input.split ( '\n' ) ;

    // Finally, call the 'main' function to begin the core logic of the program,
    // processing the now-structured input data.
    main ( ) ;
} ) ;