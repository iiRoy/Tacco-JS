/*
 * This JavaScript file implements a solution to a problem
 * likely involving dynamic programming or array manipulation.
 * It also includes a helper function for debugging purposes.
 *
 * This code is a Type I clone, preserving all logical and structural elements.
 * Only whitespace and comments have been altered for visual distinctiveness.
 */

function Main ( input ) {
    // Primary function: Processes the given input string.

    // First, split the entire input string into an array of lines.
    // Each element in the 'input' array will now correspond to a line from the original input.
    input = input . split ( "\n" ) ;


    // Parse the first line of input to extract an integer value, N.
    // N often represents the size of a dataset or the number of iterations.
    var N = parseInt ( input [ 0 ] ) ;

    // The second line of input contains space-separated values for 'hh'.
    // Split this line by spaces to get an array of 'hh' strings.
    var hh = input [ 1 ] . split ( " " ) ;

    // Similarly, the third line contains space-separated values for 'aa'.
    // Split this line by spaces to get an array of 'aa' strings.
    var aa = input [ 2 ] . split ( " " ) ;

    // Initialize a dynamic programming array 'dp'.
    // It's sized N+1 and filled with zeros, providing a base state for calculations.
    var dp = new Array ( N + 1 ) . fill ( 0 ) ;

    // Original comment regarding dp[h[0]]=a[0]; - This was commented out in the source.
    // It indicates a potential initial state or an earlier approach that was not used.

    // Initialize the 'ans' variable, which will store the final computed answer.
    var ans = 0 ;

    // Begin the main loop, iterating from i = 0 up to N-1.
    // This loop processes each item or stage of the problem.
    for ( var i = 0 ; i < N ; i ++ ) {

        // Within the loop, parse the current 'a' value from the 'aa' array.
        var a = parseInt ( aa [ i ] ) ;

        // Also parse the current 'h' value from the 'hh' array.
        var h = parseInt ( hh [ i ] ) ;

        // 'max' variable initialized to 0. Its specific use within this loop
        // is not apparent from the current code structure, possibly a remnant.
        var max = 0 ;

        // Calculate a temporary value, 'tmp'. This value combines 'a' and a dp-state.
        // Note: 'tmp' is implicitly global if not declared with var/let/const within this scope.
        tmp = a + dp [ h ] ;

        // Initiate a nested loop, starting from index 'h' and going up to N.
        // This loop updates subsequent states in the 'dp' array based on 'tmp'.
        for ( var j = h ; j < N + 1 ; j ++ ) {

            // Conditional update: If 'tmp' is greater than the current dp[j] value...
            if ( tmp > dp [ j ] ) {
                // ...then update dp[j] with the new 'tmp' value.
                dp [ j ] = tmp ;
            } else {
                // If 'tmp' is not greater, it means the sequence of updates
                // for this 'tmp' has ended, so break out of the inner loop.
                break ;
            }

        } // End of inner loop for 'j'

        // After the inner loop, update the overall answer 'ans'.
        // 'ans' is set to the maximum of its current value and the value in dp[h].
        ans = Math . max ( ans , dp [ h ] ) ;

    } // End of outer loop for 'i'

    // Output the final calculated answer to the console.
    // '%s' is used as a format specifier for string representation.
    console . log ( '%s' , ans ) ;

    // The function returns the computed answer.
    return ans ;
} // End of Main function definition


// Debugging utility function:
// This function helps test the 'Main' function in a web-based environment.
// It's typically triggered by a UI element, e.g., a button press, as indicated by the original comment:
// "実行する"ボタンを押した時に実行される関数 (デバッグ用) -> Function executed when "Run" button is pressed (for debugging).
function debug ( n ) {

    // Retrieve the input value from an HTML element identified by "input" + n.
    var input = document . getElementById ( "input" + n ) . value ;

    // Call the Main function with the retrieved input to get the answer.
    var ans = Main ( input ) ;

    // Initialize the result string to "WA" (Wrong Answer).
    var result = "WA" ;

    // Compare the calculated answer 'ans' with an expected output from another HTML element.
    // The expected output is taken from the first line of the "output" + n element's value.
    if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] ) {
        // If the answers match, set the result to "AC" (Accepted).
        result = "AC" ;
    }

    // Update the inner HTML of the "result" + n element to display the outcome.
    document . getElementById ( "result" + n ) . innerHTML = result ;

} // End of debug function


// This line is responsible for executing the Main function in a Node.js environment.
// It reads the entire content of the standard input file (/dev/stdin) as a UTF-8 string,
// and then passes this string to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;