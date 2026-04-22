/* This is the main function that processes input lines,
 * designed to calculate combinations of numbers that sum up to a target value.
 * It reads input from an array of strings. */
function   main (   lines   )
{

    // Initialize a loop to iterate through each line of input.
    // The loop continues indefinitely until a specific sentinel value is encountered.
    for  ( var   i   =   0;   ;   i++ )
    {


        // Check if the current line matches the termination sentinel '0 0'.
        // If it does, the processing for this set of inputs is complete.
        if   (   lines[ i ]   ==   '0 0'   )
        {
            break ; // Exit the loop, as the sentinel indicates no more data to process.
        }


        // The current line contains two space-separated numbers.
        // First, split the line into an array of strings based on whitespace.
        var   nums   =   lines[ i ] .   split (   /\\s+/   ) ;


        // Parse the first number as an integer, representing 'n'.
        // This 'n' defines the upper limit for numbers to be considered in combinations.
        var   n   =   parseInt (   nums[ 0 ] ,   10   ) ;


        // Parse the second number as an integer, representing 'x'.
        // This 'x' is the target sum for the combinations.
        var   x   =   parseInt (   nums[ 1 ] ,   10   ) ;


        // Initialize a counter to keep track of the number of valid combinations found.
        var   noways   =   0 ;


        // Start a triple-nested loop structure to find combinations of three distinct numbers (n1, n2, n3).
        // Each number must be between 1 and 'n', and n1 < n2 < n3 to ensure distinct combinations.
        for   ( var   n1   =   1   ;     n1   <=   n   ;   n1++   )
            for   ( var   n2   =   n1 + 1 ;   n2   <=   n   ;   n2++   )
                for   ( var   n3   =   n2 + 1 ;   n3   <=   n   ;   n3++   )
                {
                    // Check if the sum of the three selected numbers equals the target 'x'.
                    if   (   n1   +   n2   +   n3   ==   x   )
                    {
                        noways++ ; // If the sum matches, increment the counter.
                    }
                } // End of the innermost loop (n3)


        // After checking all possible combinations for the current line's 'n' and 'x',
        // print the total count of valid combinations found.
        console .   log (   noways   ) ;

    } // End of the main processing loop for input lines


} // End of the 'main' function definition



// --- Input Handling Mechanism ---

// Declare a global array to accumulate data chunks received from standard input.
// This array will store parts of the input until the 'end' event is fired.
var   chunks   =   [ ] ;


// Set up an event listener for the 'data' event on the standard input stream.
// This function is called every time new data is available.
process .   stdin .   on (   'data' ,   function (   chunk   )
    {
        chunks .   push (   chunk   ) ; // Append each incoming data 'chunk' to the 'chunks' array.
    }   ) ;


// Set up an event listener for the 'end' event on the standard input stream.
// This function is called once all input data has been received.
process .   stdin .   on (   'end' ,   function (   )
    {

        // Once all chunks are received, join them into a single string.
        // Then, split this string by newline characters to get an array of individual lines.
        var   lines   =   chunks .   join (   ''   ) .   split (   '\n'   ) ;


        // Finally, call the 'main' function with the array of processed lines.
        // This initiates the primary logic of the program.
        main (   lines   ) ;

    }   ) ;