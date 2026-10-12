"use strict";

const CONST_ZERO = 0;
const CONST_ONE = 1;
const CONST_TWO = 2;

// Helper function to generate prime flags using Sieve of Eratosthenes
function generatePrimeFlags(limitValue) {
    const IS_PRIME_MARKER = CONST_ONE;
    const NOT_PRIME_MARKER = CONST_ZERO;
    const SIEVE_START_NUMBER = CONST_TWO;

    let primeStatusArray = Array.from({ length: limitValue }, () => IS_PRIME_MARKER);
    primeStatusArray[CONST_ZERO] = NOT_PRIME_MARKER;
    primeStatusArray[CONST_ONE] = NOT_PRIME_MARKER;

    for (let currentCandidate = SIEVE_START_NUMBER; currentCandidate < limitValue; currentCandidate++) {
        if (primeStatusArray[currentCandidate] === NOT_PRIME_MARKER) {
            continue;
        }
        // Mark multiples as not prime
        for (let multipleOfCandidate = currentCandidate + currentCandidate; multipleOfCandidate < limitValue; multipleOfCandidate += currentCandidate) {
            primeStatusArray[multipleOfCandidate] = NOT_PRIME_MARKER;
        }
    }
    return primeStatusArray;
}

// Helper function to identify 2017-like numbers based on prime flags
function identify2017LikeNumbers(primeStatusReference, limitValue) {
    const IS_2017_LIKE_MARKER = CONST_ONE;
    const NOT_2017_LIKE_MARKER = CONST_ZERO;

    let is2017LikeResult = Array.from({ length: limitValue }, () => NOT_2017_LIKE_MARKER);
    for (let numberToCheck = CONST_ZERO; numberToCheck < limitValue; ++numberToCheck) {
        // A 2017-like number must be odd
        if ((numberToCheck % CONST_TWO) === CONST_ZERO) {
            continue;
        }
        // Check if numberToCheck and (numberToCheck + 1) / 2 are both prime
        let halfPlusOneValue = (numberToCheck + CONST_ONE) / CONST_TWO;
        if (primeStatusReference[numberToCheck] === IS_2017_LIKE_MARKER && primeStatusReference[halfPlusOneValue] === IS_2017_LIKE_MARKER) {
            is2017LikeResult[numberToCheck] = IS_2017_LIKE_MARKER;
        }
    }
    return is2017LikeResult;
}

// Helper function to compute cumulative sums (prefix sums)
function computeCumulativeSums(sourceDataArray, limitValue) {
    let cumulativeSumsArray = Array.from({ length: limitValue + CONST_ONE }, () => CONST_ZERO);
    for (let dataIndex = CONST_ZERO; dataIndex < limitValue; ++dataIndex) {
        cumulativeSumsArray[dataIndex + CONST_ONE] = cumulativeSumsArray[dataIndex] + sourceDataArray[dataIndex];
    }
    return cumulativeSumsArray;
}

function ProcessInput(rawData) {
    let dataLines = rawData.split("\n");

    const UPPER_BOUND_FOR_CALCULATIONS = 101010;

    // Step 1: Generate prime flags using Sieve
    let primeFlags = generatePrimeFlags(UPPER_BOUND_FOR_CALCULATIONS);

    // Step 2: Identify 2017-like numbers
    let is2017Like = identify2017LikeNumbers(primeFlags, UPPER_BOUND_FOR_CALCULATIONS);

    // Step 3: Compute cumulative sums for 2017-like numbers
    let prefixSum = computeCumulativeSums(is2017Like, UPPER_BOUND_FOR_CALCULATIONS);

    // Step 4: Process queries
    let queryCountString = dataLines.shift().trim().split(/\s/)[CONST_ZERO];
    let numberOfQueries = parseInt(queryCountString, 10);

    for (let currentQueryIndex = CONST_ZERO; currentQueryIndex < numberOfQueries; ++currentQueryIndex) {
        let queryRangeStrings = dataLines.shift().split(/\s/);
        let leftBoundary = parseInt(queryRangeStrings[CONST_ZERO], 10);
        let rightBoundary = parseInt(queryRangeStrings[CONST_ONE], 10);
        
        let adjustedRightBoundary = rightBoundary + CONST_ONE;
        
        let queryResult = prefixSum[adjustedRightBoundary] - prefixSum[leftBoundary];
        console.log(queryResult);
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
