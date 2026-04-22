// This section handles the acquisition of raw textual data from the standard input stream.
let       rawData = require('fs').readFileSync('/dev/stdin', 'utf8') ;

/*
 *   Immediately print the entirety of the acquired raw data to the standard output channel
 *   for verification or logging purposes.
 */
console.log(rawData);

// Divide the comprehensive raw data into an array of individual string tokens, using a space as the primary delimiter.
const   tokenSequence = rawData.split(' ');

/**
 *   @function decisionMaker
 *   @description This asynchronous function evaluates a specific condition based on the initial elements
 *                of the `tokenSequence` array and returns a predefined verdict.
 *   @returns {string} Returns 'NegativeOutcome' if the condition is met, otherwise 'PositiveOutcome'.
 */
const decisionMaker = (  ) => {
    // Determine if either the very first token or the second token in the sequence is equivalent to the string '2'.
    if  ( tokenSequence[0] === '2'  ||  tokenSequence[1] === '2' ) {
        return 'NegativeOutcome'; // The specified condition has been satisfied.
    }

    // If the preceding conditional check did not evaluate to true, then proceed with the default affirmative outcome.
    return 'PositiveOutcome';
};

// Invoke the primary decision-making function and display its resulting string output directly to the console.
console.log(decisionMaker());