// This helper function computes the greatest common divisor of two positive integers.
// It uses the Euclidean algorithm recursively.
const calculateGreatestCommonDivisorPair = (valA, valB) => valB
    /* If the second value (valB) is not zero, continue recursion */
    ? calculateGreatestCommonDivisorPair(valB, valA % valB)
    /* Otherwise, if valB is zero, valA is the GCD */
    : valA;

// This function determines the greatest common divisor for an arbitrary number of arguments.
// It iteratively applies the pairwise GCD function.
function determineGCDOfNumbers() {
    // Initialize the current result with the first argument provided.
    let currentResult = arguments[0];
    // Loop through the remaining arguments, starting from the second one.
    for ( let loopIndex = 1; loopIndex < arguments.length; loopIndex++ ) {
        // Update the current result by calculating the GCD with the next argument.
        currentResult = calculateGreatestCommonDivisorPair(currentResult, arguments[loopIndex]);
    }
    // Return the final greatest common divisor of all input numbers.
    return currentResult;
}

// Acquire the entire file content from the standard input stream.
const fileContent = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

// An Immediately Invoked Function Expression (IIFE) to encapsulate the main logic.
( ( incomingData ) => {

    // Divide the raw input string into an array of separate lines.
    const dataRows = incomingData . split ( '\n' ) ;
    // Extract the first line, converting it to an integer, which serves as the upper limit.
    const upperBound = parseInt ( dataRows [ 0 ] , 10 ) ;

    // Initialize an accumulator variable for the cumulative sum.
    let grandTotal = 0 ;

    // Start the outermost iteration, ranging from one up to the defined upper bound.
    for ( let outerIterator = 1 ; outerIterator <= upperBound ; outerIterator++ ) {
        // Begin the middle iteration, also from one to the upper bound.
        for ( let middleIterator = 1 ; middleIterator <= upperBound ; middleIterator++ ) {
            // Commence the innermost iteration, from one to the upper bound.
            for ( let innerIterator = 1 ; innerIterator <= upperBound ; innerIterator++ ) {
                // Compute the GCD of the three current iterators and add it to the grand total.
                grandTotal += determineGCDOfNumbers ( outerIterator , middleIterator , innerIterator ) ;
            }
        }
    }

    // Display the final computed grand total to the console.
    console . log ( grandTotal ) ;

} ) ( fileContent ) ;