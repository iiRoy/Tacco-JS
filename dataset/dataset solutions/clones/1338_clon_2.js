let rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim(); // Read input from standard input and remove leading/trailing whitespace.

let currentNumber = parseInt(rawData); // Convert the string input into an integer.
const initialNumber = currentNumber; // Store the original value of the number for the final output.

let factorList = []; // Initialize an empty array to store the prime factors.

// Iterate through potential factors starting from 2.
// The loop continues as long as the potential factor is less than or equal to half of the current number.
for (let potentialFactor = 2; potentialFactor <= currentNumber / 2; potentialFactor++) {
    // While the current number is divisible by the potential factor, it means we found a prime factor.
    while (currentNumber % potentialFactor === 0) {
        factorList.push(potentialFactor); // Add the found factor to our list.
        currentNumber /= potentialFactor; // Divide the current number by the factor to find subsequent factors.
    }
}

// Output the original number, followed by a colon and space, then its prime factors joined by spaces.
console.log(initialNumber + ': ' + factorList.join(' '));
