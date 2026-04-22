// Function to identify prime numbers up to a specified upper bound
// using an optimized variant of the Sieve of Eratosthenes algorithm.
function findPrimesUpTo(upperBound) {
    // This array will store flags: 'false' for composite numbers,
    // and the number itself for prime numbers (initially).
    var primeCandidateFlags = [];

    // Initialize the array with numbers from 0 to upperBound.
    // This allows us to easily mark non-primes later.
    for (var currentIdx = 0; currentIdx <= upperBound; currentIdx++) {
        primeCandidateFlags[currentIdx] = currentIdx;
    }

    // Explicitly mark 0 and 1 as non-prime.
    primeCandidateFlags[0] = false;
    primeCandidateFlags[1] = false;

    // Calculate the integer part of the square root of the upper bound.
    // We only need to check for prime factors up to this limit.
    var sRootLimit = Math.floor(Math.sqrt(upperBound));

    // Iterate from 2 up to the square root limit.
    for (var currentFactor = 2; currentFactor <= sRootLimit; currentFactor++) {
        // If the current number is already marked as composite (false),
        // it means all its multiples have already been handled by a smaller prime factor.
        if (primeCandidateFlags[currentFactor] === false) {
            continue; // Skip to the next number.
        }

        // If 'currentFactor' is prime, mark all its multiples as composite.
        // Start marking from 'currentFactor * 2' as multiples smaller than this
        // would have been handled by other factors.
        for (var multipleIdx = currentFactor + currentFactor; multipleIdx <= upperBound; multipleIdx += currentFactor) {
            primeCandidateFlags[multipleIdx] = false; // Mark as composite.
        }
    }

    // Create an object (hash map) to store the identified prime numbers
    // for efficient lookup (O(1) average time complexity).
    var primeLookupSet = {};

    // Iterate through the flags array to collect all prime numbers.
    for (var checkIdx = 0; checkIdx <= upperBound; checkIdx++) {
        // If the flag for 'checkIdx' is not 'false', it means 'checkIdx' is a prime number.
        if (primeCandidateFlags[checkIdx] !== false) {
            primeLookupSet[primeCandidateFlags[checkIdx]] = true; // Add to the set.
        }
    }

    return primeLookupSet; // Return the object containing primes.
}

// Generate a global set of prime numbers up to 1,000,000.
// This set will be used repeatedly for each test case.
var cachedPrimeNumbers = findPrimesUpTo(1000000);

// Utilize Node.js 'fs' module to read all data from standard input.
var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
var inputLineSegments = (rawInputContent.trim()).split("\n");

// Main processing loop: continues as long as there are valid test cases.
while (true) {
    // Extract N and X values from the current line segment.
    // Shift removes the first element from inputLineSegments.
    var currentNAndX = inputLineSegments.shift().split(" ").map(Number);
    var numElementsCount = currentNAndX[0]; // The 'N' value
    var sumTargetValue = currentNAndX[1]; // The 'X' value

    // Check for the termination condition: N=0 and X=0.
    if (numElementsCount === 0 && sumTargetValue === 0) {
        break; // Exit the loop if termination condition is met.
    }

    // Initialize a dynamic programming array to track reachable sums.
    // 'true' means a sum is reachable, 'false' means it's not.
    var possibleSumsStatus = [];
    // Set all possible sums up to 1,000,000 as initially unreachable.
    for (var sumIndex = 0; sumIndex <= 1000000; sumIndex++) {
        possibleSumsStatus[sumIndex] = false;
    }

    // Array to store the 'n' input numbers for the current test case.
    var currentInputValues = [];

    // Read 'n' numbers from the input and populate the array.
    // Also, mark these individual numbers as reachable sums in the DP array.
    for (var elementIndex = 0; elementIndex < numElementsCount; elementIndex++) {
        var valueFromInput = inputLineSegments.shift() - 0; // Convert string to number.
        currentInputValues.push(valueFromInput); // Add to the list of values.
        possibleSumsStatus[valueFromInput] = true; // Mark this value as a reachable sum.
    }

    // The sum of 0 is always reachable (by choosing no elements).
    possibleSumsStatus[0] = true;

    // Perform dynamic programming to find all reachable sums up to 'sumTargetValue'.
    // This uses a "knapsack-like" approach where each input number can be used once
    // to extend a previously reachable sum.
    for (var currentSum = 0; currentSum <= sumTargetValue; currentSum++) {
        for (var valIdx = 0; valIdx < currentInputValues.length; valIdx++) {
            // If 'currentSum' is reachable, then 'currentSum + currentInputValues[valIdx]'
            // is also reachable, provided it doesn't exceed the max possible sum.
            if (possibleSumsStatus[currentSum]) {
                possibleSumsStatus[currentSum + currentInputValues[valIdx]] = true;
            }
        }
    }

    // Search for the largest reachable prime sum, starting from 'sumTargetValue' downwards.
    var resultSum = 0; // Initialize result to 0 (will indicate 'NA' if no prime sum found).
    for (var potentialPrimeSum = sumTargetValue; potentialPrimeSum > 0; potentialPrimeSum--) {
        // Check if the 'potentialPrimeSum' is reachable AND is a prime number.
        if (possibleSumsStatus[potentialPrimeSum] && cachedPrimeNumbers.hasOwnProperty(potentialPrimeSum)) {
            resultSum = potentialPrimeSum; // Found the largest such sum.
            break; // Exit the loop.
        }
    }

    // Output the result. If 'resultSum' is 0, it means no prime sum was found, so print "NA".
    // Otherwise, print the largest prime sum found.
    console.log((resultSum === 0) ? "NA" : resultSum);
}