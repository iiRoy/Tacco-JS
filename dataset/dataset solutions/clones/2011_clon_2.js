/* This module defines a function to compute the Nth 'stepping number'.
 * A stepping number is an integer where each adjacent digit differs by exactly one.
 * For example, 121, 456, 987 are stepping numbers.
 * The implementation includes optimizations to skip ranges of numbers that cannot be stepping numbers.
 */

function ProcessInputData( dataSource ) {

    // Parse the input string to get the desired rank (k)
    let desiredRank = Number.parseInt( dataSource );

    // Initialize the current number being examined.
    // Single-digit numbers (0-9) are considered stepping numbers.
    let currentCandidateNumber = 9;

    // Initialize the count of stepping numbers found so far.
    // There are 9 single-digit stepping numbers (1 through 9).
    // The problem context usually implies non-negative integers.
    let numbersFoundCount = 9;

    // Loop until the required number of stepping numbers is identified.
    while ( numbersFoundCount < desiredRank ) {

        // Increment the candidate number for evaluation.
        currentCandidateNumber++;

        // Extract the first two digits for an early check and optimization.
        // Convert the current number to a string to access its digits.
        let firstDigitValue = Number.parseInt( String( currentCandidateNumber ).substring( 0, 1 ) );
        let secondDigitValue = Number.parseInt( String( currentCandidateNumber ).substring( 1, 2 ) );

        // Optimization 1: If the first digit is much smaller than the second (e.g., 13x, 14x, etc.)
        // This implies a jump to the next 'hundred' or 'thousand' block.
        // For example, if currentCandidateNumber is 130, it jumps to 200.
        if ( firstDigitValue - secondDigitValue < -1 ) {

            // Calculate the start of the next block based on the first digit.
            // E.g., if `currentCandidateNumber` is 135, `firstDigitValue` is 1. `(1+1) * 10^(length-1)` becomes `2 * 10^2 = 200`.
            currentCandidateNumber = ( Number.parseInt( String( currentCandidateNumber ).substring( 0, 1 ) ) + 1 ) * ( Math.pow( 10, ( String( currentCandidateNumber ).length - 1 ) ) );

        }

        // Optimization 2: If the first digit is much larger than the second (e.g., 31x, 40x, etc.)
        // This attempts to adjust the second digit to be `first_digit - 1` and reset the rest.
        // For example, if currentCandidateNumber is 315, it jumps to 325.
        if ( firstDigitValue - secondDigitValue > 1 ) {

            // Calculate a boundary value (e.g., 300 for 315)
            let boundaryValue = Number.parseInt( String( currentCandidateNumber ).substring( 0, 1 ) ) * ( Math.pow( 10, ( String( currentCandidateNumber ).length - 1 ) ) );

            // Calculate an adjustment offset based on the first digit (e.g., (3-1) * 10^1 = 20 for 315)
            let adjustmentOffset = ( Number.parseInt( String( boundaryValue ).substring( 0, 1 ) ) - 1 ) * ( Math.pow( 10, ( String( currentCandidateNumber ).length - 2 ) ) );

            // Calculate an intermediate offset based on the second digit's position (e.g., 1 * 10^1 = 10 for 315)
            let intermediateOffset = Number.parseInt( String( currentCandidateNumber - boundaryValue ).substring( 0, 1 ) ) * ( Math.pow( 10, ( String( currentCandidateNumber ).length - 2 ) ) );

            // Reconstruct the current candidate number to jump past the invalid sequence.
            currentCandidateNumber = boundaryValue + adjustmentOffset + ( currentCandidateNumber - boundaryValue - intermediateOffset );

        }

        // Assume the number is a stepping number until proven otherwise.
        let isSteppingNumber = true;

        // Iterate through the digits of the current number to verify the stepping property.
        for ( let charPosition = 0; charPosition < String( currentCandidateNumber ).length - 1; charPosition++ ) {

            // Extract the current digit.
            firstDigitValue = Number.parseInt( String( currentCandidateNumber ).substring( charPosition, charPosition + 1 ) );
            // Extract the next digit.
            secondDigitValue = Number.parseInt( String( currentCandidateNumber ).substring( charPosition + 1, charPosition + 2 ) );

            // Check if the absolute difference between adjacent digits is greater than 1.
            if ( Math.abs( firstDigitValue - secondDigitValue ) > 1 ) {
                // If it is, this is not a stepping number.
                isSteppingNumber = false;
                break; // No need to check further digits.
            }
        }

        // If the number passed all digit checks, it's a valid stepping number.
        if ( isSteppingNumber === true ) {
            numbersFoundCount++; // Increment the count of found stepping numbers.
        }
    }

    // Output the result.
    // Special handling for desiredRank < 10, as these are simply the rank itself.
    if ( desiredRank >= 10 ) {
        console.log( currentCandidateNumber );
    } else {
        console.log( desiredRank ); // For k=1 to 9, the k-th stepping number is k itself.
    }
}

// Entry point for execution: read input from standard input and process it.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );