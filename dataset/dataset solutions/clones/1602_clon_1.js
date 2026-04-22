/*
 * This JavaScript file processes input to solve a specific algorithmic problem.
 * It determines an optimal position based on an initial state, allowed steps,
 * and step lengths. The logic involves absolute values, integer division,
 * and parity checks to find the closest point to zero.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Define the primary function that encapsulates the problem-solving logic.
// It takes a single string 'input' as its argument.
function    Main(  input  )
{
    // --- Input Processing Section ---
    // First, clean and parse the input string.
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string into an array of lines based on newline characters.
    // 3. Map each line string to an array of strings, splitting by spaces.
    input = input . trim() . split( "\n" ) . map( function( x ) {
        return x . split( " " )
    } ) ;


    // Extract and convert the necessary numerical parameters from the processed input.
    // X: The initial starting position (an integer).
    let X = parseInt( input[ 0 ][ 0 ] , 10 ) ;
    // K: The maximum number of steps allowed (an integer).
    let K = parseInt( input[ 0 ][ 1 ] , 10 ) ;
    // D: The length of each step (an integer).
    let D = parseInt( input[ 0 ][ 2 ] , 10 ) ;


    // --- Core Logic Calculation ---

    // Calculate 'tmp': The maximum number of steps that can be taken
    // towards zero without overshooting it. This is based on the absolute
    // distance from zero, divided by the step length, floored to an integer.
    let tmp = Math . floor( Math . abs( X ) / D ) ;


    // Declare a variable 'ans' to hold the final computed answer.
    let ans ;


    // Conditional logic to determine the final position based on K and tmp.
    // Scenario 1: If the total allowed steps K are less than or equal to
    // the optimal steps 'tmp' that reach closest to zero.
    if ( K <= tmp )
    {
        // In this case, we can simply move K steps directly towards zero.
        // The final position is the initial absolute distance minus K steps.
        ans = Math . abs( X ) - D * K ;
    }
    // Scenario 2: If the total allowed steps K exceed 'tmp', meaning we will
    // overshoot the zero point if we take 'tmp' steps.
    else
    {
        // We have taken 'tmp' steps to reach the closest point to zero.
        // Now, we need to consider the parity of the *remaining* steps (K - tmp).

        // If the remaining steps are an even number, we will end up on the
        // same side of zero as we were after taking 'tmp' steps.
        if ( ( K - tmp ) % 2 === 0 )
        {
            // The answer is simply the position after taking 'tmp' steps.
            ans = Math . abs( X ) - D * tmp ;
        }
        // If the remaining steps are an odd number, we will end up on the
        // opposite side of zero compared to after taking 'tmp' steps.
        else
        {
            // First, calculate the position after taking 'tmp' steps.
            ans = Math . abs( X ) - D * tmp ;
            // Then, "flip" this position across zero by subtracting it from D.
            // This effectively moves it from (0 to D) to (D to 0) or (-D to 0).
            ans = D - ans ;
        }
    }


    // --- Output Section ---
    // Print the final calculated answer to the standard output.
    console . log( ans ) ;

} // End of the Main function.


// Call the Main function, providing input read from standard input.
// This line typically uses Node.js's file system module to read from /dev/stdin.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;