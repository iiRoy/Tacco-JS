// Helper function to generate a list of prime numbers up to a given limit
function calculatePrimes(limitValue) {
    // Initialize a boolean array where primeStatus[i] is true if i is potentially prime
    const primeStatus = new Array(limitValue + 1).fill(true);

    // 0 and 1 are not considered prime numbers
    primeStatus[0] = false;
    primeStatus[1] = false;

    // The Sieve of Eratosthenes optimization: iterate up to the square root of the limit
    const sieveUpperLimit = Math.floor(Math.sqrt(limitValue));

    // Iterate from 2 up to the square root limit
    for (let currentCandidate = 2; currentCandidate <= sieveUpperLimit; currentCandidate++) {
        // If currentCandidate is marked as prime, then mark its multiples as not prime
        if (primeStatus[currentCandidate]) {
            // Start marking multiples from 2 * currentCandidate, as per original logic
            for (let multipleIndex = currentCandidate + currentCandidate; multipleIndex <= limitValue; multipleIndex += currentCandidate) {
                primeStatus[multipleIndex] = false;
            }
        }
    }

    // Collect all numbers that are still marked as prime into a final list
    const primeNumbersList = [];
    for (let numToCheck = 0; numToCheck <= limitValue; numToCheck++) {
        if (primeStatus[numToCheck]) {
            primeNumbersList.push(numToCheck);
        }
    }
    return primeNumbersList;
}

// Pre-calculate primes up to 999,999
const precomputedPrimes = calculatePrimes(999999);

// Helper function to read and parse numeric input from a file
const readNumericInput = (sourcePath) => {
    const fileContent = require('fs').readFileSync(sourcePath, 'utf8');
    // Trim whitespace, split by newline, and convert each part to a number
    return fileContent.trim().split("\n").map(Number);
};

// Read query numbers from standard input
const queryValues = readNumericInput('/dev/stdin');

// Process each query number
queryValues.forEach(currentQueryValue => {
    // Find the index of the first prime number in the precomputed list
    // that is strictly greater than the current query value.
    // This index effectively represents the count of primes less than or equal to currentQueryValue.
    let countOfPrimesLessThanOrEqualToQuery = precomputedPrimes.findIndex(primeEntry => primeEntry > currentQueryValue);

    // If findIndex returns -1, it means no prime in the list is greater than currentQueryValue.
    // In this scenario, all precomputed primes are less than or equal to currentQueryValue,
    // so the count should be the total number of precomputed primes.
    if (countOfPrimesLessThanOrEqualToQuery === -1) {
        countOfPrimesLessThanOrEqualToQuery = precomputedPrimes.length;
    }
    
    // Output the calculated count
    console.log(countOfPrimesLessThanOrEqualToQuery);
});
