const fileSystem = require('fs'); // Renamed module for clarity

// --- Input Processing Section ---
// Reads raw input from standard input stream
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Divides the input into individual lines
const inputLines = rawInputData.split('\n');

// Extracts the first relevant line and splits it by space
const currentLineParts = inputLines.shift().split(' ');

// Parses the first and second numerical values from the line
// Adds a basic validation for numeric input
let firstNumberValue;
let secondNumberValue;

try {
    firstNumberValue = parseInt(currentLineParts[0], 10);
    secondNumberValue = parseInt(currentLineParts[1], 10);

    if (isNaN(firstNumberValue) || isNaN(secondNumberValue)) {
        throw new Error("Invalid numeric input provided.");
    }
} catch (error) {
    console.error("Input parsing error: " + error.message);
    // Exit or handle error appropriately, e.g., default values
    firstNumberValue = 1; // Default to 1 to prevent further errors
    secondNumberValue = 1; // Default to 1
}

// --- Helper Function: Determines all factors of a given number ---
const calculateFactors = (targetNumber) => {
    // Guard clause for non-positive numbers
    if (targetNumber <= 0 || !Number.isInteger(targetNumber)) {
        // Return an array containing only 1 for non-positive or non-integer inputs,
        // as 1 is a universal divisor. This ensures consistency with the later logic.
        return [1];
    }

    const factorList = [];
    const limit = Math.floor(Math.sqrt(targetNumber));

    // Iterate up to the square root of the target number
    for (let divisorCandidate = 1; divisorCandidate <= limit; divisorCandidate++) {
        if (targetNumber % divisorCandidate === 0) {
            factorList.push(divisorCandidate);
            // Add the corresponding co-factor if it's not the same as the divisor
            if (divisorCandidate * divisorCandidate !== targetNumber) {
                factorList.push(targetNumber / divisorCandidate);
            }
        }
    }
    // Sort the factors in ascending order for consistent processing
    return factorList.sort((valA, valB) => valA - valB);
};

// --- Helper Function: Checks if a number is prime ---
const isNumberTrulyPrime = (candidateNum) => {
    // Basic checks and guard clauses for primality
    if (candidateNum < 2 || !Number.isInteger(candidateNum)) {
        return false;
    }
    if (candidateNum === 2 || candidateNum === 3) {
        return true;
    }
    if (candidateNum % 2 === 0 || candidateNum % 3 === 0) {
        return false;
    }

    // Optimized loop for primality test (checks numbers of form 6k +/- 1)
    for (let checkFactor = 5; checkFactor * checkFactor <= candidateNum; checkFactor += 6) {
        if (candidateNum % checkFactor === 0 || candidateNum % (checkFactor + 2) === 0) {
            return false;
        }
    }
    return true;
};

// --- Main Logic Execution ---

// Obtain the sorted lists of divisors for both input numbers
const factorsOfFirstNum = calculateFactors(firstNumberValue);
const factorsOfSecondNum = calculateFactors(secondNumberValue);

// Initialize an array to store common divisors that are candidates for primality check
const commonPrimeCandidates = [];

// Pop the largest divisors from the arrays to start comparison
let currentFactorA = factorsOfFirstNum.pop();
let currentFactorB = factorsOfSecondNum.pop();

// Loop to find common divisors by comparing from largest to smallest
// The loop continues as long as at least one of the current factors is not 1.
// If an array is exhausted, its factor implicitly becomes 1 for comparison purposes.
while (currentFactorA !== undefined && currentFactorB !== undefined && (currentFactorA !== 1 || currentFactorB !== 1)) {
    if (currentFactorA === currentFactorB) {
        // If factors are equal, it's a common divisor
        commonPrimeCandidates.push(currentFactorA);
        // Move to the next largest factors from both lists
        currentFactorA = factorsOfFirstNum.pop();
        currentFactorB = factorsOfSecondNum.pop();
    } else if (currentFactorA < currentFactorB) {
        // If A's factor is smaller, B's factor is too large; move to the next largest for B
        currentFactorB = factorsOfSecondNum.pop();
    } else {
        // If B's factor is smaller, A's factor is too large; move to the next largest for A
        currentFactorA = factorsOfFirstNum.pop();
    }
}

// Add 1 as a common divisor if it hasn't been added yet (it's always a common divisor)
// This ensures that 1 is included in the set of common divisors if the loop logic missed it
// or if one of the input numbers was 1 itself.
if (!commonPrimeCandidates.includes(1)) {
    commonPrimeCandidates.push(1);
}

// Initialize the count for prime common divisors.
// The original problem's output logic implies starting count at 1, then incrementing
// for each prime common divisor found. This means 1 itself is implicitly counted
// as a base, and then actual prime common divisors add to it.
let primeCommonDivisorCount = 1;

// Iterate through the collected common divisors and check their primality
for (const commonDivisor of commonPrimeCandidates) {
    // Exclude 1 from primality check as it's not considered prime
    if (commonDivisor > 1 && isNumberTrulyPrime(commonDivisor)) {
        primeCommonDivisorCount++;
    }
}

// Output the final calculated count
console.log(primeCommonDivisorCount);