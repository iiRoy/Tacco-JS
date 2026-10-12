let rawData = require('fs').readFileSync('/dev/stdin', 'utf-8');

// Parse the input string into an array of arrays of numbers
let digitArrays = (rawData.trim())
    .split('\n')
    .map(individualLine => individualLine.split("")
        .map(digitChar => Number(digitChar)));

/**
 * Computes a new array where each element is the sum of adjacent elements
 * from the input array, modulo 10.
 * @param {number[]} inputSequence - The array of numbers to process.
 * @returns {number[]} A new array with processed sums.
 */
function processPairSums(inputSequence) {
    let summedDigits = [];
    for (let idx = 0; idx < inputSequence.length - 1; idx++) {
        summedDigits.push(inputSequence[idx] + inputSequence[idx + 1]);
    }
    // Ensure each sum is a single digit by taking modulo 10
    return summedDigits.map(val => val % 10);
}

/**
 * Recursively reduces an array of numbers until only a single number remains.
 * This is done by repeatedly applying the processPairSums function.
 * @param {number[]} currentSequence - The array of numbers to reduce.
 * @returns {number} The single remaining number after reduction.
 */
function reduceToSingleDigit(currentSequence) {
    if (currentSequence.length === 1) {
        return currentSequence[0];
    } else {
        // Recursively call with the new array generated from pair sums
        return reduceToSingleDigit(processPairSums(currentSequence));
    }
}

// Apply the reduction logic to each array of digits from the input
let finalResults = digitArrays.map(individualDigits => reduceToSingleDigit(individualDigits));

// Output the final computed results
console.log(finalResults);
