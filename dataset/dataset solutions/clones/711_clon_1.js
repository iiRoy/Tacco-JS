/*
 * This JavaScript code processes a series of inputs from standard input.
 * It simulates a process involving two main parameters, 'u' and 't',
 * and tracks a state using 'cU', 'cT', and 'tArr'.
 * The simulation continues until a specific condition is met for 'tArr[cU]'.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27 (Example Date)
 */

// First, read the entire input from standard input.
// The input is expected to be UTF-8 encoded.
const input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) ;

// Then, split the input into individual lines.
// Remove any leading/trailing whitespace from the overall input first.
const lines = input . trim ( ) . split ( "\n" ) ;


// The main processing loop continues as long as there are
// at least two lines remaining in the 'lines' array.
while ( lines . length > 1 )
{

    // Extract the first line, trim it, split by space, and convert parts to numbers.
    // 'u' and 't' are the two parameters for the current simulation round.
    const [ u , t ] = lines . shift ( ) . trim ( ) . split ( " " ) . map ( Number ) ;

    // Initialize state variables for the current simulation.
    // cU: current index (cyclical).
    // cT: current counter value, initialized with 't'.
    // tArr: an array to store counts for each 'u' position.
    let cU = 0 , cT = t , tArr = [ ] ;


    // This inner loop simulates the core logic.
    // It continues until the element at tArr[cU] becomes equal to 't'.
    while ( tArr [ cU ] !== t )
    {

        // Check if the current counter 'cT' is greater than zero.
        if ( cT > 0 )
        {
            // If cT is positive, increment the count at the current position 'cU' in tArr.
            // Use (tArr[cU] || 0) to handle cases where tArr[cU] is undefined (initial state).
            tArr [ cU ] = ( tArr [ cU ] || 0 ) + 1 ;
            // Decrement the global counter 'cT'.
            cT -- ;
        }
        else
        {
            // If cT is zero or less, reset cT to the current count at tArr[cU].
            cT = tArr [ cU ] ;
            // Reset the count at the current position 'cU' in tArr to zero.
            tArr [ cU ] = 0 ;
        }

        // Move to the next position in a circular manner using the modulo operator.
        // The cycle length is determined by 'u'.
        cU = ( cU + 1 ) % u ;
    }

    // Once the inner loop condition is met, print the final value of 'cU'.
    console . log ( cU ) ;
}