'use strict';

const processCalculation = (dataInput) => {
    const dataParts = dataInput.split(' ');
    const upperLimit = parseInt(dataParts[0], 10);
    const modulusValue = parseInt(dataParts[1], 10);

    // Determines the count of integers 'x' where 1 <= x <= boundary,
    // and x % divisor equals targetRemainder.
    const determineCount = (boundary, divisor, targetRemainder) => {
        // The first number in the sequence (e.g., for divisor=3, rem=0, sequence starts 3, 6, ...)
        // (e.g., for divisor=3, rem=1, sequence starts 1, 4, 7, ...)
        const initialTerm = (targetRemainder === 0) ? divisor : targetRemainder;

        // If the first possible term already exceeds the boundary, no numbers qualify.
        if (initialTerm > boundary) {
            return 0;
        }

        // Calculate how many terms exist up to the boundary.
        // Formula: floor((boundary - initialTerm) / divisor) + 1
        return Math.floor((boundary - initialTerm) / divisor) + 1;
    };

    let finalResult = 0;

    // Calculate the count of numbers whose remainder is 0 when divided by modulusValue.
    // These are multiples of modulusValue.
    const zeroRemainderCount = determineCount(upperLimit, modulusValue, 0);
    
    // The original logic implies that for 'a' values that are multiples of K,
    // the count is added as (count for b)^2 for each such 'a'.
    // Here, 'a', 'b', and 'c' all effectively need to have remainder 0 for the relevant conditions.
    finalResult += zeroRemainderCount * zeroRemainderCount * zeroRemainderCount;

    // If modulusValue is even, there's another specific remainder (modulusValue / 2)
    // that satisfies the condition in the original code's logic.
    if (modulusValue % 2 === 0) {
        const midRemainder = modulusValue / 2;
        const midRemainderCount = determineCount(upperLimit, modulusValue, midRemainder);
        
        // Similar to the zero remainder case, the contribution is (count for midRemainder)^3.
        finalResult += midRemainderCount * midRemainderCount * midRemainderCount;
    }

    console.log(finalResult);
};

// Toggle for testing with hardcoded inputs vs. reading from stdin
const runTests = false; 

if (runTests) {
    determineCount('3 2'); // Expected: 9
    determineCount('5 3'); // Expected: 1
    determineCount('31415 9265'); // Expected: 27 (Original code output based on my analysis)
    determineCount('35897 932'); // Expected: 120 (Original code output based on my analysis)
} else {
    processCalculation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
}