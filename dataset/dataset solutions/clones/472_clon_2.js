/*
 * This function computes the Greatest Common Divisor (GCD) of two numbers
 * using the Euclidean algorithm.
 *
 * @param {number} firstOperand  - The first integer.
 * @param {number} secondOperand - The second integer.
 * @returns {number} The greatest common divisor of the two input numbers.
 */
function calculateGreatestCommonDivisor( firstOperand, secondOperand ) {
    // Determine the larger and smaller of the two input numbers.
    let  largerNumber = Math.max( firstOperand, secondOperand ) ;
    let  smallerNumber = Math.min( firstOperand, secondOperand ) ;

    // Continue the algorithm as long as the smaller number is not zero.
    while ( smallerNumber !== 0 ) {
         // Store the current value of the smaller number temporarily.
        const tempHolder = smallerNumber ;
        // Calculate the remainder of the larger number divided by the smaller number.
        smallerNumber = largerNumber % smallerNumber ;
        // Update the larger number with the value previously held by the smaller number.
        largerNumber = tempHolder ;
    }
    // When smallerNumber becomes 0, largerNumber holds the GCD.
    return largerNumber ;
}

// Read the entire standard input as a UTF-8 string.
const fileContent = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Split the input content into an array of lines, removing leading/trailing whitespace
// and then separating by newline characters.
const inputLines = fileContent . trim ( ) . split ( "\n" ) ;


// Main processing loop: continues as long as the dataset size is not zero.
while ( true ) {
    // Extract the first line, convert it to a number, representing the count of pairs for this dataset.
    let dataSetSize = Number ( inputLines . shift ( ) ) ;

    // If the dataset size is zero, it signifies the end of input, so break the loop.
    if ( dataSetSize === 0 ) {
        break ;
    }

    // Initialize an array to store the reduced fraction pairs for the current dataset.
    const fractionPairs = [ ] ;

    // Loop `dataSetSize` times to process each pair of numbers.
    for ( let loopIndex = 0 ; loopIndex < dataSetSize ; loopIndex ++ ) {
        // Read the next line, split it by space, and convert parts to numbers.
        const numericPair = inputLines . shift ( ) . split ( " " ) . map ( Number ) ;

        // Calculate the GCD of the two numbers in the current pair.
        const pairGCD = calculateGreatestCommonDivisor ( numericPair [ 0 ] , numericPair [ 1 ] ) ;

        // Add the reduced fraction (numerator/GCD, denominator/GCD) to the list.
        fractionPairs . push ( [ numericPair [ 0 ] / pairGCD , numericPair [ 1 ] / pairGCD ] ) ;
    }

    // --- First LCM Calculation (for denominators) ---

    // Initialize the current Least Common Multiple to 1.
    let currentLCM = 1 ;

    // Iterate through each reduced fraction to find the LCM of all denominators.
    fractionPairs . forEach ( function ( currentFraction ) {
        // Get the denominator of the current fraction.
        const denominator = currentFraction [ 1 ] ;
        // Calculate the GCD between the current denominator and the accumulated LCM.
        const intermediateGCD = calculateGreatestCommonDivisor ( denominator , currentLCM ) ;
        // Update the LCM using the formula: LCM(a, b) = (a * b) / GCD(a, b).
        currentLCM = ( denominator * currentLCM ) / intermediateGCD ;
    } ) ;


    // --- Normalization of Numerators ---

    // Map each fraction pair to its scaled numerator based on the calculated LCM.
    const normalizedNumerators = fractionPairs . map ( function ( fractionItem , idx ) {
        // The new numerator is the original numerator multiplied by (LCM / original_denominator).
        return fractionItem [ 0 ] * ( currentLCM / fractionItem [ 1 ] ) ;
    } ) ;

    // --- Second LCM Calculation (for normalized numerators) ---

    // Re-initialize the overall Least Common Multiple to 1 for the numerators.
    let overallLCM = 1 ;

    // Iterate through each normalized numerator to find the LCM of all of them.
    normalizedNumerators . forEach ( function ( numeratorValue ) {
        // Calculate the GCD between the current numerator value and the accumulated LCM.
        const elementGCD = calculateGreatestCommonDivisor ( numeratorValue , overallLCM ) ;
        // Update the overall LCM.
        overallLCM = ( numeratorValue * overallLCM ) / elementGCD ;
    } ) ;

    // --- Final Output ---

    // For each normalized numerator, print the result of (overall LCM / numerator).
    normalizedNumerators . forEach ( function ( finalNumerator ) {
        console . log ( overallLCM / finalNumerator ) ;
    } ) ;
}