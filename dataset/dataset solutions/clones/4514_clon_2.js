// The entire text block is passed as raw data for processing.
function ExecuteCalculations(incomingText) {
    var firstCount, secondCount; // Declare variables to hold parsed numerical values.
    
    // Split the incoming text into lines, then process the first line.
    incomingText = incomingText . split ( "\n" );
    incomingText = incomingText [ 0 ] . split ( " " ) ;
    
    // Assign parsed numeric strings to respective count variables.
    firstCount = incomingText [ 0 ] ;
    secondCount = incomingText [ 1 ] ;
    
    // Define a modulus constant for calculations.
    const PRIME_MODULUS = 1000000007;

    // Check the absolute difference between the two counts to determine output.
    if ( Math . abs ( firstCount - secondCount ) >= 2 ) {
        console . log ( 0 ) ; // Output zero if difference is two or more.
    } else if ( Math . abs ( firstCount - secondCount ) === 1 ) {
        // If difference is exactly one, calculate product of factorials modulo PRIME_MODULUS.
        console . log ( ( ( calculateProductSeries ( firstCount ) % PRIME_MODULUS ) * ( calculateProductSeries ( secondCount ) % PRIME_MODULUS ) ) % PRIME_MODULUS ) ;
    } else if ( Math . abs ( firstCount - secondCount ) === 0 ) {
        // If counts are identical, calculate product of factorials (times two) modulo PRIME_MODULUS.
        console . log ( ( ( ( calculateProductSeries ( firstCount ) % PRIME_MODULUS ) * ( calculateProductSeries ( secondCount ) % PRIME_MODULUS ) ) * 2 ) % PRIME_MODULUS ) ;
    }

} // End of the main processing function.


// This function computes the factorial of a given number 'limitValue' modulo PRIME_MODULUS.
function calculateProductSeries ( limitValue ) {
    var accumulatedProduct = 1 ; // Initialize accumulator for product.
    const PRIME_MODULUS = 1000000007; // Re-define modulus for local scope, mirroring original literal usage.
    
    // Loop from 1 up to and including the limit value.
    for ( var currentMultiplier = 1 ; currentMultiplier <= limitValue ; currentMultiplier ++ ) {
        // Multiply accumulated product by current multiplier, applying modulus at each step.
        accumulatedProduct = ( accumulatedProduct % PRIME_MODULUS ) * ( currentMultiplier % PRIME_MODULUS ) ;
    }
    return accumulatedProduct ; // Return the final computed product.
}

// Do not modify the code below this line (reads from standard input and invokes the main processing function).
ExecuteCalculations ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;