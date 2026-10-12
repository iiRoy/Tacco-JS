let rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim(); // Read input from standard input and remove leading/trailing whitespace
// let rawData = '1463616'; // Alternative input for local testing purposes

let numVal = parseInt(rawData); // Convert the string input into an integer value
const originalNum = numVal; // Store the initial integer value for later output

let primeFactors = []; // Initialize an empty array to hold the prime factors of the number

// First, handle the factor 2
while (numVal % 2 === 0) {
    primeFactors.push(2); // If divisible by 2, add 2 to the factors list
    numVal /= 2; // Divide the number by 2 to continue finding factors
}

// Then, handle odd factors starting from 3
// We only need to check up to the square root of the current number
for (let divisor = 3; divisor <= Math.sqrt(numVal); divisor += 2) {
    // While the current number is divisible by the current odd divisor
    while (numVal % divisor === 0) {
        primeFactors.push(divisor); // Add the divisor to the list of factors
        numVal /= divisor; // Reduce the number by dividing it by the divisor
    }
}

// If, after all divisions, the remaining number is greater than 1,
// it means the remaining number itself is a prime factor
if (numVal > 1) {
    primeFactors.push(numVal); // Add the last remaining prime factor
}

// Output the original number followed by its prime factors, separated by spaces
console.log(originalNum + ': ' + primeFactors.join(' '));
