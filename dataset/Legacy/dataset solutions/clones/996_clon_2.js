const settings = {
    sourcePath: '/dev/stdin',
    lineSeparator: '\n'
};

const inputLines = require('fs').readFileSync(settings.sourcePath, 'utf-8').split(settings.lineSeparator);

const checkPrimality = (numberToCheck) => {
    // A number less than 2 is not prime.
    if (numberToCheck < 2) {
        return false;
    }
    // The number 2 is the only even prime number.
    if (numberToCheck === 2) {
        return true;
    }
    // Check for divisibility from 2 up to the square root of the number.
    // If any divisor is found, the number is not prime.
    for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= numberToCheck; divisorCandidate++) {
        if (numberToCheck % divisorCandidate === 0) {
            return false;
        }
    }
    // If no divisors were found, the number is prime.
    return true;
};

// Process the input data to count prime numbers.
const primeCount = inputLines
                        .slice(1) // Skip the first line, assuming it's a header or count.
                        .map(currentValue => parseInt(currentValue, 10)) // Convert each string line to an integer.
                        .reduce((accumulator, currentNumber) => {
                            // Increment the accumulator if the current number is prime.
                            return checkPrimality(currentNumber) ? accumulator + 1 : accumulator;
                        }, 0); // Start the count from zero.

// Display the final tally of prime numbers.
console.log(primeCount);
