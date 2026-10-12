var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim(); // Read input from standard input, decode as UTF-8, and remove leading/trailing whitespace
var currentNumber = parseInt(rawData); // Convert the processed input string into an integer value

// Initialize an empty array to store the prime factors discovered
var primeFactors = [];

// Iterate through potential divisors starting from the smallest prime number (2)
for (var divisorCandidate = 2; divisorCandidate < currentNumber; divisorCandidate++) {
    // Continuously divide the current number by the divisor candidate as long as it's perfectly divisible
    while (currentNumber % divisorCandidate === 0) {
        // If divisible, add the current divisor candidate to our list of prime factors
        primeFactors.push(divisorCandidate);
        // Update the current number by dividing it by the found factor
        currentNumber /= divisorCandidate;
    }
}

// Output the final remaining value of 'currentNumber' (which will be the last prime factor if it's greater than 1)
// followed by a colon and a space.
process.stdout.write(currentNumber + ': ');
// Output all collected prime factors, joined by a single space, followed by a newline character.
process.stdout.write(primeFactors.join(' ') + "\n");
