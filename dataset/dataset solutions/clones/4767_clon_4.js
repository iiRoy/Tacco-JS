const fileSystemInterface = require('fs');

// Function to determine the exponents of prime factors for a factorial
const calculateFactorialPrimeExponents = (upperBoundLimit) => {
    const primeIdentificationArray = new Array(upperBoundLimit + 1).fill(true);
    primeIdentificationArray[0] = primeIdentificationArray[1] = false; // 0 and 1 are not considered prime

    const collectedExponents = new Map(); // Stores prime -> exponent in N!

    for (let currentInteger = 2; currentInteger <= upperBoundLimit; currentInteger++) {
        if (primeIdentificationArray[currentInteger]) {
            // currentInteger has been identified as a prime number
            let sumOfPowers = 0;
            let currentPowerOfPrime = currentInteger;
            // Apply Legendre's formula: sum_{k=1 to infinity} floor(N / p^k)
            while (currentPowerOfPrime <= upperBoundLimit) {
                sumOfPowers += Math.floor(upperBoundLimit / currentPowerOfPrime);
                // Check to prevent potential overflow before the next multiplication
                if (currentPowerOfPrime > upperBoundLimit / currentInteger) {
                    break;
                }
                currentPowerOfPrime *= currentInteger;
            }
            collectedExponents.set(currentInteger, BigInt(sumOfPowers)); // Store as BigInt

            // Mark all multiples of the current prime as non-prime (Sieve of Eratosthenes)
            for (let multipleIndex = currentInteger * currentInteger; multipleIndex <= upperBoundLimit; multipleIndex += currentInteger) {
                primeIdentificationArray[multipleIndex] = false;
            }
        }
    }
    return collectedExponents;
};

// --- Main Execution Routine ---
const incomingData = fileSystemInterface.readFileSync(0, 'utf-8'); // Read all data from standard input (file descriptor 0)
const dataRows = incomingData.trim().split('\n');

const upperFactorialBound = Number(dataRows[0]); // Extract N from the first line, convert to standard number
const outputModuloConstant = 1000000007n; // The modulus value, represented as a BigInt

const factorialPrimeExponentMap = calculateFactorialPrimeExponents(upperFactorialBound);

let totalCombinations = 1n; // Initialize the result accumulator as a BigInt

// Iterate through the exponents of each prime factor of N!
for (const individualPrimeExponent of factorialPrimeExponentMap.values()) {
    // The number of divisors is the product of (exponent + 1) for each prime factor
    totalCombinations = totalCombinations * (individualPrimeExponent + 1n);
}

// Apply the final modulus operation
const finalCalculatedValue = totalCombinations % outputModuloConstant;

console.log(finalCalculatedValue.toString());