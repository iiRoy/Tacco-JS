"use strict";
var inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
var inputTokens = inputSource.trim().split(/ |\n/), tokenIndex = 0;

console.log(calculatePrimeFactorSummation().toString());

function calculatePrimeFactorSummation() {
    let initialValue = +inputTokens.shift();

    if (initialValue === 1) {
        return 0;
    }
    if (initialValue === 2) {
        return 1;
    }

    let totalContribution = 0;
    let currentNumber = initialValue;
    let currentDivisor = 2;

    // Iterate through potential prime divisors
    // The loop continues as long as the square of the current divisor
    // does not exceed the remaining number. This optimizes by only checking
    // divisors up to the square root of the current number.
    while (currentDivisor * currentDivisor <= currentNumber) {
        // If currentDivisor is a factor of currentNumber
        if (currentNumber % currentDivisor === 0) {
            let exponentCount = 0;
            // Count how many times currentDivisor divides currentNumber
            while (currentNumber % currentDivisor === 0) {
                exponentCount++;
                currentNumber /= currentDivisor;
            }
            // Calculate the largest integer 'k' such that the sum 1 + 2 + ... + k
            // is less than or equal to exponentCount.
            // The sum 1 + ... + k is k * (k + 1) / 2.
            // We need k * (k + 1) / 2 <= exponentCount.
            // This can be solved for k using the quadratic formula for k^2 + k - 2*exponentCount = 0.
            // k = (-1 + sqrt(1 + 8*exponentCount)) / 2.
            // We take the floor to get the largest integer k.
            let sequenceLength = Math.floor((-1 + Math.sqrt(1 + 8 * exponentCount)) / 2);
            totalContribution += sequenceLength;
        }

        // Increment currentDivisor:
        // Check 2 first, then only odd numbers (3, 5, 7, ...)
        if (currentDivisor === 2) {
            currentDivisor = 3;
        } else {
            currentDivisor += 2;
        }
    }

    // If, after the loop, currentNumber is still greater than 1,
    // it means the remaining currentNumber is a prime factor itself
    // (and it must be greater than sqrt(initialValue)).
    // In this case, its exponent is 1, and the sequenceLength for exponent 1 is 1.
    if (currentNumber > 1) {
        totalContribution++;
    }

    return totalContribution;
}
