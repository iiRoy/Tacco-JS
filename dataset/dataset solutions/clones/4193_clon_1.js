process . stdin . resume ( ) ;


// This line ensures that the standard input stream remains open
// and doesn't close immediately after the script starts.
// It's crucial for receiving data from pipes or user input.
//
//
//
//

process.stdin.setEncoding ( 'utf8' ) ;


/*
 *
 * This sets the character encoding for the input stream.
 * 'utf8' is a common and robust encoding for handling various characters.
 * Without this, input might be treated as raw bytes, leading to issues.
 *
 */


var   g_input   =   ''   ; // Global variable to accumulate all incoming data.


//
//
//

process . stdin . on ( 'data' , function ( chunk ) {


        // This event listener fires whenever new data (a 'chunk') arrives on stdin.
        // The 'chunk' is typically a string due to the 'setEncoding' call above.

        g_input += chunk ; // Append the received chunk to our global input string.


        // Data accumulation is vital for handling large inputs that might arrive in multiple pieces.


} ) ;


//
//
//
//

process . stdin . on ( 'end' , function ( ) {

        // This event fires when the input stream has finished sending data (e.g., EOF reached).
        // It signals that all input has been received and it's time to process it.


        /*
         *
         *   The Main function is called here, passing an array of lines from the accumulated input.
         *   The input is split by newlines, accommodating both Windows (\r\n) and Unix (\n) line endings.
         *
         */

        Main ( g_input . split ( / \r ? \n / ) ) ;


        // Processing logic begins after all input is gathered.

} ) ;


//
//
//
//
//
//
//
// This is the primary function where the core logic of the program resides.
// It takes an array of strings, where each string is a line from the standard input.
//
function   Main   (   input   )   {


        // Declare a variable 'n' to store the first integer from the input.
        // This 'n' usually dictates the size or number of subsequent data sets.

        var     n     =     parseInt ( input [ 0 ] , 10 ) ;


        //
        // Initialize a 2D array 'f' of size n.
        // Each element of 'f' will be an array of 10 integers.

        var     f     =     new     Array ( n ) ;


        // Loop 'n' times to populate the 'f' array.
        // This loop processes the first block of data after 'n'.

        for     (     var     i     =     0     ;     i     <     n     ;     i     ++     )     {

                //
                //
                // Initialize the inner array for f[i].
                f [ i ] = new Array ( 10 ) ;


                // Split the current input line into arguments based on spaces.
                // The lines for 'f' start from input[1].

                var   args   =   input [ 1   +   i ] . split ( ' ' ) ;

                //
                //
                // Populate the inner array f[i] with 10 integers.

                for     (     var     j     =     0     ;     j     <     10     ;     j     ++     )     {

                        // Parse each argument as an integer and store it.
                        f [ i ] [ j ] = parseInt ( args [ j ] , 10 ) ;

                }


        }


        //
        //
        // Declare and initialize another 2D array 'p' of size n.
        // Similar to 'f', each element of 'p' will be an array of 10 integers.

        var     p     =     new     Array ( n ) ;


        // Loop 'n' times to populate the 'p' array.
        // This loop processes the second block of data.

        for     (     var     i     =     0     ;     i     <     n     ;     i     ++     )     {

                //
                // Initialize the inner array for p[i].
                p [ i ] = new Array ( 10 ) ;


                // Split the current input line into arguments.
                // The lines for 'p' start after all 'f' lines, i.e., from input[1 + n].

                var   args   =   input [ 1   +   n   +   i ] . split ( ' ' ) ;


                //
                // Populate the inner array p[i] with 10 integers.

                for     (     var     j     =     0     ;     j     <     10     ;     j     ++     )     {

                        // Parse each argument as an integer.
                        p [ i ] [ j ] = parseInt ( args [ j ] , 10 ) ;

                }


        }


        //
        // Initialize 'ret' with the smallest possible safe integer value.
        // This variable will store the maximum calculated profit/score.

        var     ret     =     Number . MIN_SAFE_INTEGER     ;


        //
        // This outer loop iterates from 1 to 1023 (2^10 - 1).
        // Each value of 'i' can be thought of as a bitmask representing a combination of 10 items/options.
        // There are 2^10 possible combinations (excluding the all-zero combination).

        for     (     var     i     =     1     ;     i     <     1024     ;     i     ++     )     {

                // 'cc' (current combination profit) accumulates the profit for the current bitmask 'i'.
                var     cc     =     0     ;


                // This inner loop iterates through each of the 'n' data sets.
                for     (     var     j     =     0     ;     j     <     n     ;     j     ++     )     {

                        // 'c' (count) tracks how many items match the current bitmask for the current data set 'j'.
                        var     c     =     0     ;


                        // This innermost loop checks each of the 10 items/options.
                        for     (     var     k     =     0     ;     k     <     10     ;     k     ++     )     {

                                // Check if the k-th bit of 'i' is set (meaning this option is selected in the current combination)
                                // AND if the k-th item in data set 'j' (f[j][k]) is greater than 0 (meaning it's available/relevant).
                                if     (     (     i     >>     k     &     1     )     ==     1     &&     f     [     j     ]     [     k     ]     >     0     )     {

                                        // If both conditions are true, increment the count 'c'.
                                        c     ++     ;

                                }
                        }


                        // Add the profit associated with 'c' matching items for data set 'j' to the total 'cc'.
                        // The 'p' array stores these profits: p[j][c] is the profit for 'c' matches in data set 'j'.
                        cc     +=     p     [     j     ]     [     c     ]     ;

                }


                // After calculating the total profit 'cc' for the current bitmask 'i',
                // compare it with the current maximum profit 'ret'.
                if     (     ret     <     cc     )     {

                        // If 'cc' is greater, update 'ret' to this new maximum.
                        ret     =     cc     ;

                }
        }


        // Output the final maximum profit found to the console.
        console . log ( ret ) ;


        // The function returns 0, indicating successful execution.
        return     0     ;

}