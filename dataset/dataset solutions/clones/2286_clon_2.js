// This is the primary execution routine for processing input data.
function chiefProcess ( dataInput ) {
    // Extract the first numerical component from the initial line of input.
    let  initialValue = dataInput[ 0 ] . split ( " " ) [ 0 ] - 0 ;

    // Obtain the second numerical component from the same initial line.
    let  limitValue = dataInput[ 0 ] . split ( " " ) [ 1 ] - 0 ;

    // Parse the sequence of numbers from the second line of input.
    const integerSequence = dataInput[ 1 ] . split ( " " ) . map ( ( elementVal ) => elementVal - 0 ) ;

    // Compute the least common multiple of the parsed integer sequence.
    let computedLCM = findLeastCommonMultiple ( integerSequence ) ;

    // Output the final computed result based on limitValue and computedLCM.
    console . log ( Math . trunc ( limitValue / ( computedLCM / 2 ) ) - Math . trunc ( limitValue / computedLCM ) ) ;
}

// This function determines the least common multiple (LCM) for an array of numbers.
function findLeastCommonMultiple ( numericElements ) {
    let inputNumbers = numericElements ; // Alias for clarity within this scope.

    // Helper function to calculate the greatest common divisor (GCD) of two numbers.
    const determineGreatestCommonDivisor = ( numX , numY ) => numY ? determineGreatestCommonDivisor ( numY , numX % numY ) : numX ;

    // Helper function to calculate the least common multiple (LCM) of two numbers using their GCD.
    const calculateProductAndDivisor = ( operandA , operandB ) => ( operandA * operandB ) / determineGreatestCommonDivisor ( operandA , operandB ) ;

    // Initialize the LCM result with the first number in the sequence.
    var finalLCMResult = inputNumbers[ 0 ] ;

    // Iterate through the rest of the numbers to progressively calculate the LCM.
    for ( let indexIterator = 1 ; indexIterator < inputNumbers . length ; indexIterator++ ) {
        finalLCMResult = calculateProductAndDivisor ( finalLCMResult , inputNumbers[ indexIterator ] ) ;
    }

    // Return the overall least common multiple.
    return finalLCMResult ;
}


// Invoke the main processing function with data read from standard input.
chiefProcess ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( "\n" ) ) ;