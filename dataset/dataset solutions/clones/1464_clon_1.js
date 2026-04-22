/*
 * This JavaScript program processes input from standard input.
 * It's designed to read specific lines from the input and perform
 * a comparison operation between sets of numbers.
 *
 * The program expects input containing space-separated numbers on
 * certain lines.
 */

// --- Main execution block ---

// Attach an event listener to the standard input stream ('process.stdin').
// This listener will be triggered whenever data is available from stdin.
process
    . stdin
    . on
    (
        "data" ,
        // The callback function that processes the received data.
        // 'k' represents the data buffer received from stdin.
        function
        (
            k
        )
        {
            // Convert the input buffer 'k' to a string,
            // remove leading/trailing whitespace, and then split it
            // into an array of strings based on newline characters.
            // Each element in the 'k' array will correspond to a line of input.
            k = ( k + "" ) . trim ( ) . split ( "\n" ) ;


            // Initialize an empty object 'o'. This object will be used
            // as a hash map (or set) to store numbers from the first relevant input line.
            var o = { } ;

            // Initialize a counter variable 'c' to zero.
            // This variable will accumulate the count of matching numbers.
            var c = 0 ;


            // Access the second line of input (k[1]), split it by spaces,
            // and then iterate over each resulting string 'a'.
            k [ 1 ]
                . split ( " " )
                . forEach
                (
                    function ( a )
                    {
                        // For each number string 'a' from the first list,
                        // add it as a property to the object 'o' with a value of 1.
                        // This effectively marks 'a' as present in the first list.
                        o [ a ] = 1 ;
                    }
                ) ;


            // Access the fourth line of input (k[3]), split it by spaces,
            // and then iterate over each resulting string 'a'.
            k [ 3 ]
                . split ( " " )
                . forEach
                (
                    function ( a )
                    {
                        // Check if the current number string 'a' from the second list
                        // exists as a property in object 'o'.
                        // If 'o[a]' is truthy (meaning 'a' was found in the first list),
                        // then increment the counter 'c' by the value of 'o[a]' (which is 1).
                        o [ a ] && ( c += o [ a ] ) ;
                    }
                ) ;


            // After processing all relevant input, print the final count 'c'
            // to the standard output (console).
            console . log ( c ) ;
        }
    )
    // The .resume() method ensures that the 'stdin' stream,
    // which starts in a paused state, begins emitting 'data' events.
    . resume ( ) ;

// --- End of script execution ---