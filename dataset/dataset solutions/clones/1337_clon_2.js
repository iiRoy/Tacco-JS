const sourceData = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim(); // Read and prepare the initial input string.

let remainingValue = parseInt(sourceData); // Convert the processed string into an integer for calculation.


// This array will hold all the prime factors found during the decomposition process.
const factorList = [];


// Begin iterating through potential divisors starting from the smallest prime.
for (let currentDivisor = 2; currentDivisor < remainingValue; currentDivisor++) {
    // While the current number is perfectly divisible by the test divisor,
    // it implies that the test divisor is a prime factor.
    while (remainingValue % currentDivisor === 0) {
        factorList.push(currentDivisor); // Add the identified prime factor to our collection.
        remainingValue /= currentDivisor; // Reduce the number by this factor to continue finding others.
    }
}

// Output the final irreducible component of the original number, followed by a separator.
process.stdout.write(remainingValue + ': ');
// Then, display all the collected prime factors, joined by spaces, ending with a newline.
process.stdout.write(factorList.join(' ') + '\n');