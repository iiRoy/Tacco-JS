// This module handles file system operations to read input.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// A previous line for testing might have been: // let rawData = "14";

// Convert the input string into an integer for calculations.
let currentNumber = parseInt(rawData);
// Keep a copy of the initial number for the final output display.
let originalValue = currentNumber;

// Initialize an array to store the prime factors as they are discovered.
let primeFactors = [];

// Begin iterating from the smallest possible prime factor (2) up to the current number.
for (let divisorCandidate = 2; divisorCandidate <= currentNumber; divisorCandidate++) {
    // Continuously divide the current number by the candidate as long as it's perfectly divisible.
    while (currentNumber % divisorCandidate === 0) {
        // If divisible, the candidate is a prime factor; add it to our collection.
        primeFactors.push(divisorCandidate);
        // Reduce the current number by dividing it by the found factor.
        currentNumber /= divisorCandidate;
    }
}

// Print the original number followed by a colon and its prime factors, separated by spaces.
console.log(originalValue + ': ' + primeFactors.join(' '));
