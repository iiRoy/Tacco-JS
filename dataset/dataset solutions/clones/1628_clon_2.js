const   rawData = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;
// The script begins by reading all content from standard input.

const dataRows = rawData . split ( '\n' ) ;
// The raw input string is then divided into an array of individual lines.

const targetValue = parseInt ( dataRows [ 0 ] , 10 ) ;
// The primary numerical target for our calculations is extracted from the first line
// and converted to an integer, ensuring proper numerical operations.

const remainderBase = 1_000_000_007 ;
// This constant defines a large prime modulus, essential for managing
// intermediate arithmetic results within a specific range and preventing overflows.

/**
 * Implements an efficient modular multiplication function.
 * This routine is designed to accurately compute (firstOperand * secondOperand) % remainderBase,
 * particularly for large numbers, by leveraging bitwise operations to
 * split the first operand into high and low parts.
 *
 * @param {number} firstOperand  - The multiplicand.
 * @param {number} secondOperand - The multiplier.
 * @returns {number} The result of the modular multiplication.
 */
function calculateProduct ( firstOperand , secondOperand )
{
    return (
        (
            ( ( firstOperand >>> 16 ) * secondOperand ) % remainderBase * 0x10000
            + ( ( firstOperand & 0xFFFF ) * secondOperand )
        ) % remainderBase
    ) ;
}

// The main computational logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
// This pattern helps to avoid polluting the global scope.
; ( ( initialDataContent ) => {

    // First, a preliminary check is performed for specific edge cases.
    // If the 'targetValue' is divisible by 2 or 5, it is impossible to form
    // a number consisting solely of '7's that is also divisible by 'targetValue'.
    if ( targetValue % 2 === 0 || targetValue % 5 === 0 )
    {
        console . log ( -1 ) ; // In such cases, output -1 to indicate no solution.
        return ; // Terminate the function's execution.
    }

    let currentSum = 0 ;
    // Initialize a variable to accumulate the sum of numbers formed by repeating '7's (e.g., 7, 77, 777...).

    // A loop iterates to construct numbers made of '7's of increasing length.
    // 'outerIndex' represents the number of '7's in the current number being tested minus one.
    for ( let outerIndex = 0 ; outerIndex <= targetValue ; outerIndex ++ )
    {
        let powerMultiplier = 1 ;
        // 'powerMultiplier' will hold the value of 10 raised to 'outerIndex',
        // determining the place value for the '7' being added.

        // This inner loop calculates 10^outerIndex using modular multiplication.
        for ( let innerCount = 0 ; innerCount < outerIndex ; innerCount ++ )
        {
            powerMultiplier = calculateProduct ( powerMultiplier , 10 ) ;
        }

        // The current '7' (multiplied by its place value) is added to the running sum.
        // The sum is kept within the modulo range using 'remainderBase'.
        currentSum = ( currentSum + calculateProduct ( powerMultiplier , 7 ) ) % remainderBase ;

        // After updating 'currentSum', check if it is exactly divisible by the 'targetValue'.
        if ( currentSum % targetValue === 0 )
        {
            // If divisible, 'outerIndex + 1' gives the length of the number formed by '7's.
            console . log ( outerIndex + 1 ) ;
            break ; // The first such length found is the answer, so exit the loop.
        }
    }

} ) ( rawData ) ; // The IIFE is immediately executed, receiving the raw input data.