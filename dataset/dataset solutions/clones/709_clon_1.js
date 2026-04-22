/*
 * This JavaScript program processes a series of inputs,
 * simulating a specific kind of cyclic process.
 * It reads data from the standard input stream, parses it,
 * and then performs calculations based on the given parameters
 * for each distinct test case provided.
 */


// We begin by importing the 'fs' (file system) module,
// which is essential for reading data from files or standard input.
const input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . trim () ;


// The raw input string is first trimmed of leading/trailing whitespace,
// and then split into an array of individual lines.
// Each line typically represents a new set of parameters for a test case.
const lines = input . trim () . split ( "\n" ) ;


/**
 * The primary processing loop iterates through the 'lines' array.
 * It continues as long as there are more than one line remaining,
 * ensuring that each complete test case (which is assumed to span multiple lines
 * or at least needs a termination condition) is processed.
 */
while ( lines.length > 1 )
{

    // In each iteration, the first line is extracted from the 'lines' array.
    // It's then trimmed, split by spaces, and each part is converted to a number.
    // 'u' represents the total number of units or positions in a cycle.
    // 't' represents a target value or a condition for an inner loop.
    const [ u , t ] = lines . shift () . trim () . split ( " " ) . map ( Number ) ;


    // Initialize variables for the current simulation run:
    // 'cU' (current Unit): Tracks the current position in the cycle, starting at 0.
    // 'cT' (current Target): Acts as a counter, initialized with the value of 't'.
    // 'tArr' (target Array): An array to store values associated with each unit,
    //                        initially empty, values will be added as needed.
    let cU = 0 , cT = t , tArr = [] ;


    /*
     * This inner loop drives the core simulation logic.
     * It continues to execute as long as the value stored at the
     * 'cU' index within the 'tArr' array is NOT equal to the target 't'.
     * This condition dictates when the simulation for the current (u, t) pair ends.
     */
    while ( tArr[cU] !== t )
    {
        // Check if the current target counter 'cT' is still positive.
        if ( cT > 0 )
        {
            // If 'cT' is greater than 0, increment the value at the current unit 'cU'
            // in 'tArr'. The `(tArr[cU] || 0)` ensures that if `tArr[cU]` is
            // undefined (first access), it defaults to 0 before incrementing.
            tArr[cU] = ( tArr[cU] || 0 ) + 1 ;

            // Decrement the 'cT' counter, moving it closer to zero.
            cT -- ;
        }
        else
        {
            // If 'cT' is 0 or less, it means a cycle condition has been met or reset.
            // The 'cT' counter is reset to the current value stored at 'tArr[cU]'.
            cT = tArr[cU] ;

            // The value at the current unit 'cU' in 'tArr' is then reset to 0.
            tArr[cU] = 0 ;
        }

        // Move to the next unit in a cyclic fashion.
        // The modulo operator '%' ensures 'cU' wraps around from 'u-1' back to 0.
        cU = ( cU + 1 ) % u ;
    }

    // Once the inner loop's termination condition is met (tArr[cU] === t),
    // the final value of 'cU' (the unit where the condition was satisfied) is printed to the console.
    console . log ( cU ) ;
}

// End of the program's execution.