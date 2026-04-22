"use strict" // Ensures strict mode for cleaner code execution

/**
 * Main processing function for the provided input.
 * @param {string} rawTextContent - The raw string input from the source.
 */
function processInputData( rawTextContent ) {
    // Split the input into lines after trimming leading/trailing whitespace.
    var inputStringLines = rawTextContent
        .trim()
        .split( "\n" ) ;

    // Parse the second number from the first line as the upper limit.
    var upperLimitValue = inputStringLines[0].split( " " ).map( Number )[1] ;

    // Process the second line: split by space, convert to numbers, and sort in descending order.
    var unsortedNumericList = inputStringLines[1]
        .split( " " )
        .map( Number )
        .sort( ( valA, valB ) => valB - valA ) ;

    // Filter out duplicate numbers, keeping only unique values.
    var uniqueDescendingNumbers = unsortedNumericList.filter( function ( currentElement, currentIndex, arrayReference ) {
        return arrayReference.indexOf( currentElement ) === currentIndex ;
    } ) ;

    // Extract the first (largest) unique number to use as the primary divisor.
    var primaryDivisor = uniqueDescendingNumbers.shift() ;

    // This variable is declared but remains unused throughout the logic.
    var operationLog = [ ] ;

    // Initialize a counter for valid calculation results.
    var finalResultCount = 0 ;

    // Loop through potential multipliers starting from 1 indefinitely.
    for ( var currentMultiplier = 1 ; ; currentMultiplier++ ) {
        // Calculate a product based on the primary divisor and current multiplier.
        var calculatedProduct = primaryDivisor * ( currentMultiplier + 0.5 ) ;

        // If the calculated product exceeds the upper limit, terminate the loop.
        if ( calculatedProduct > upperLimitValue ) {
            break ;
        }

        // Flag to track if any anomaly is encountered during inner calculations.
        var encounteredAnomaly = false ;

        // Iterate through the remaining unique numbers.
        for ( var indexIterator = 0 ; indexIterator < uniqueDescendingNumbers.length ; indexIterator++ ) {
            // Compute an intermediate value.
            var intermediateCalculation = calculatedProduct / uniqueDescendingNumbers[ indexIterator ] - 0.5 ;

            // Check if the intermediate calculation is not a whole number.
            if ( ! Number.isInteger( intermediateCalculation ) ) {
                encounteredAnomaly = true ; // Mark as anomalous
                break ; // Exit inner loop immediately
            }
        }

        // If no anomalies were found for the current multiplier, increment the result count.
        if ( ! encounteredAnomaly ) {
            finalResultCount++ ;
        }
    }

    // Display the final count of valid results.
    console.log( finalResultCount ) ;
}

// Invoke the main processing function with content read from standard input.
processInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) ;