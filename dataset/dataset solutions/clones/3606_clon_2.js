'use strict'

/*
 * This helper function calculates the total number of integer divisors
 * for a supplied numerical value. It iterates through potential divisors
 * starting from zero up to the input number itself.
 */
const computeFactors = ( inputNumber ) => {
    let factorCount = 0 ; // Initialize a counter for found divisors.

    // Loop through each integer from 0 up to and including the input value.
    for ( let loopVar = 0 ; loopVar <= inputNumber ; loopVar ++ ) {
        // If 'loopVar' is 0, 'inputNumber % loopVar' results in NaN (Not a Number).
        // The comparison 'NaN === 0' evaluates to false, effectively skipping the increment
        // for the case where the divisor is zero, preserving original behavior.
        if ( inputNumber % loopVar === 0 ) {
            factorCount ++ ; // Increment the counter if a perfect division occurs.
        }
    }

    return factorCount ; // Return the final tally of divisors.
}

/*
 * This is the primary execution block for the program.
 * It takes raw string input, converts it to a number,
 * then processes a range of numbers based on specific criteria,
 * and finally outputs a calculated total.
 */
const ProcessInputAndCalculate = ( rawInputData ) => {

    // Convert the received string data into a numerical representation.
    const parsedNumericValue = Number(rawInputData) ;

    let finalAccumulator = 0 ; // A variable to store the final count of numbers meeting the criteria.

    // Iterate through numbers starting from zero, up to and including the parsed value.
    for ( let currentIterationNumber = 0 ; currentIterationNumber <= parsedNumericValue ; currentIterationNumber ++ ) {

        // Check if the current number is an even number.
        // If it is, we skip it and proceed to the next iteration.
        if ( currentIterationNumber % 2 === 0 ) {
            continue ; // Move to the next number in the sequence.
        }

        // For odd numbers, determine if their total number of divisors is exactly eight.
        if ( computeFactors(currentIterationNumber) === 8 ) {
            finalAccumulator ++ ; // If the condition is met, increment our main counter.
        }
    }

    // Print the final computed result to the standard output stream.
    console.log(finalAccumulator) ;
}


// The following code block is responsible for handling standard input/output.
// It reads all data from the standard input stream and then passes it to the main processing function.
// This section should typically remain unaltered as it manages external interactions.
ProcessInputAndCalculate( require("fs").readFileSync("/dev/stdin", "utf8") ) ;