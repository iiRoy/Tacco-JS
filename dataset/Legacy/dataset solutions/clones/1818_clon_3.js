"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.trim().split(/ |\n/), tokenIndex = 0;

console.log(calculatePrimeFactorSum().toString());

function calculatePrimeFactorSum() {
    var targetNum = +tokenStream.shift();
    
    if (targetNum === 1) {
        return 0;
    } else if (targetNum === 2) {
        return 1;
    }

    const sqrtLimit = Math.sqrt(targetNum);
    var primeList = generatePrimesUpTo(sqrtLimit);
    
    let resultCount = 0;
    
    for (let primeIdx = 0; primeIdx < primeList.length; primeIdx++) {
        let currentPrime = primeList[primeIdx];
        
        // If the current prime is already greater than or equal to the remaining targetNum,
        // any further primes in the list (which are larger) won't be factors.
        // The remaining targetNum itself will be a prime factor if > 1.
        if (currentPrime >= targetNum) {
            break;
        }

        let exponentVal = 0;
        while (targetNum % currentPrime === 0) {
            exponentVal++;
            targetNum /= currentPrime;
        }
        
        if (exponentVal === 0) {
            continue;
        }
        
        resultCount += determineConsecutiveSumCount(exponentVal);
    }
    
    // If targetNum is still greater than 1, it means the remaining targetNum is a prime factor
    // (which was larger than sqrt(original_n) or not in the pre-generated prime list).
    if (targetNum > 1) {
        resultCount++;
    }

    return resultCount;
}

function generatePrimesUpTo(limitValue) {
    let foundPrimes = [2, 3];
    
    // Start checking from 5, increment by 2 (only odd numbers)
    for (let currentCandidate = 5; currentCandidate <= limitValue; currentCandidate += 2) {
        let isDivisible = false;
        // Check divisibility only by primes found so far, up to sqrt(currentCandidate)
        for (let primeDivisorIndex = 0; primeDivisorIndex < foundPrimes.length; primeDivisorIndex++) {
            const currentDivisor = foundPrimes[primeDivisorIndex];
            const squareOfCurrentDivisor = currentDivisor * currentDivisor;
            
            if (squareOfCurrentDivisor > currentCandidate) {
                // If square of current divisor exceeds candidate, no larger prime divisor will be found.
                // Candidate is prime.
                break;
            }
            
            if (currentCandidate % currentDivisor === 0) {
                isDivisible = true;
                break;
            }
        }
        
        if (!isDivisible) {
            foundPrimes.push(currentCandidate);
        }
    }
    return foundPrimes;
}

// Helper function extracted from the main logic for clarity and modularity.
// It calculates the maximum 'i' such that 1 + 2 + ... + i <= exponent.
function determineConsecutiveSumCount(exponent) {
    let currentSum = 1;
    let currentIter = 1;
    while (currentSum + currentIter + 1 <= exponent) {
        currentSum = currentSum + currentIter + 1;
        currentIter++;
    }
    return currentIter;
}
