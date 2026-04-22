"use strict" ;

const executeProcess = rawData =>   {   // This function orchestrates the main calculation logic.
    rawData = rawData.trim( ) . split ( "\n" ) ; // First, we sanitize and segment the incoming textual data.

    // Next, we extract and convert the essential numeric components from our prepared input array.
    const initialValue = parseInt ( rawData [ 0 ] ) ; // The primary numerical quantity to be processed.
    const factorAlpha = parseInt ( rawData [ 1 ] ) ;  // A potential divisor option.
    const factorBeta = parseInt ( rawData [ 2 ] ) ;   // Another option for division.
    const factorGamma = parseInt ( rawData [ 3 ] ) ;  // A third candidate for the divisor.
    const factorDelta = parseInt ( rawData [ 4 ] ) ;  // Yet another possible divisor.
    const factorEpsilon = parseInt ( rawData [ 5 ] ) ;// The final potential divisor in our set.
    
    // Perform a series of mathematical operations:
    // 1. Identify the smallest value among the five factors.
    // 2. Divide the initial quantity by this smallest factor.
    // 3. Increment the result by a fixed offset (4).
    // 4. Round the final outcome upwards to the nearest whole number.
    console.log ( Math.ceil ( initialValue / Math.min ( factorAlpha , factorBeta , factorGamma , factorDelta , factorEpsilon ) + 4 ) ) ;
}

// Initiate the entire process by reading content from standard input and feeding it to our primary function.
executeProcess ( require ( 'fs' ).readFileSync ( '/dev/stdin' , 'utf8' ) ) ;