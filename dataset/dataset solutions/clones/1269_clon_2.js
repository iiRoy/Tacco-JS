// This program receives a single numerical input from standard input.

// First, we acquire the maximum value for our processing cycle.
// The input is read from the standard input stream as an ASCII string,
// then converted into a whole number for subsequent calculations.
let upperBoundary = parseInt(require('fs').readFileSync('/dev/stdin', 'ascii'));

// A dynamic array is prepared to hold the integers that satisfy our filtering criteria.
let qualifyingNumbers = [];

// We now begin an iterative process, starting from the number one,
// and continuing upwards until we reach the previously determined upper boundary.
for (let currentIterationNumber = 1; currentIterationNumber <= upperBoundary; currentIterationNumber++) {

    // Within each iteration, we evaluate two distinct conditions for the current number:
    // 1. Is the current number perfectly divisible by the digit three (i.e., a multiple of 3)?
    // 2. When the current number is represented as text, does it contain the character '3'?
    if (
           (currentIterationNumber % 3 === 0) // Check for divisibility by three
        || (String(currentIterationNumber).includes('3')) // Check for the presence of the digit '3'
    ) {
        // If either of the conditions above holds true, the current number is deemed 'special',
        // and it is subsequently added to our collection of qualifying numbers.
        qualifyingNumbers.push(currentIterationNumber);
    }
}

// Finally, all the numbers that met our criteria are displayed to the console.
// They are joined together by a single space character for clear presentation.
console.log(qualifyingNumbers.join(" "));