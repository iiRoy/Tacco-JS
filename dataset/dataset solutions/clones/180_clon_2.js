function checkPrimality(val) {
    // Check for small prime numbers and trivial non-primes
    if (val === 2 || val === 3) {
        return true;
    }
    if (val < 2 || val % 2 === 0 || val % 3 === 0) {
        return false;
    }

    // Calculate the upper bound for checking divisors
    const upperBound = Math.round(Math.sqrt(val));
 
    // Iterate using an optimized 6k +/- 1 rule
    let counter = 1;
    while (counter * 6 - 1 <= upperBound) {
        // Check divisibility by numbers of the form (6k - 1) and (6k + 1)
        if (val % (counter * 6 - 1) === 0 || val % (counter * 6 + 1) === 0) {
            return false; // Not prime if divisible
        }
        counter++; // Move to the next set of potential divisors
    }
    return true; // If no divisors found, the number is prime
}

// Read input from the standard input stream
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into an array of lines, removing leading/trailing whitespace
const dataRows = rawData.trim().split('\n');
 
let currentRow;
// Process each line of input data
while (currentRow = dataRows.shift()) {
    // Convert the current line to a numeric value
    const currentNumber = +currentRow;

    let previousPrime; // Stores the largest prime number less than currentNumber
    let nextPrime;     // Stores the smallest prime number greater than currentNumber

    // Special case for the number 3, as its preceding prime is 2
    if (currentNumber === 3) {
        previousPrime = 2;
    }

    let iterator = 3; // Start checking for primes from 3 (only odd numbers)
    // Loop indefinitely until both surrounding primes are found
    for (;;) {
        // If iterator is prime and less than currentNumber, update previousPrime
        if (checkPrimality(iterator) && iterator < currentNumber) {
            previousPrime = iterator;
        }
        // If iterator is prime and greater than currentNumber, set nextPrime and exit
        if (checkPrimality(iterator) && iterator > currentNumber) {
            nextPrime = iterator;
            break; // Exit the loop once both values are determined
        }
        iterator += 2; // Increment by 2 to check only odd numbers
    }
    // Output the found previous and next prime numbers
    console.log(previousPrime, nextPrime);
}
