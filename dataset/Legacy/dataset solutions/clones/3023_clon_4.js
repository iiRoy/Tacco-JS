"use strict";

function ProcessInput(rawInput) {
    const lines = rawInput.split("\n");
    const elementCount = Number(lines[0]);
    const values = lines.slice(1, elementCount + 1).map(Number);
    const totalSum = values.reduce((acc, current) => acc + current, 0);

    const MODULUS_CONSTANT = 998244353;

    // `coeffSetA` represents the coefficients of the polynomial P_A(x) = product(1 + x^v) for v in `values`.
    // The coefficient of x^k in P_A(x) is the number of ways to choose a subset of `values` that sums to k.
    let coeffSetA = new Array(totalSum + 1).fill(0);
    coeffSetA[0] = 1; // Base case: sum 0 can be achieved in 1 way (by choosing no elements).

    // `coeffSetB` represents the coefficients of the polynomial P_B(x) = product(2 + x^v) for v in `values`.
    // The coefficient of x^k in P_B(x) is the number of ways to assign elements to R, G, B such that R sums to k,
    // and elements not in R can be in G or B (2 choices).
    let coeffSetB = new Array(totalSum + 1).fill(0);
    coeffSetB[0] = 1; // Base case: sum 0 can be achieved in 1 way (by choosing no elements for R, and 1 way for G/B).

    // Iterate through each value to update the polynomial coefficients.
    for (const itemValue of values) {
        // Calculate the next state for coeffSetA (multiplying by (1 + x^itemValue))
        const nextCoeffSetA = new Array(totalSum + 1).fill(0);
        for (let k = 0; k <= totalSum; k++) {
            // Term from 1 * current_coeffSetA[k] (itemValue is not chosen for sum k)
            nextCoeffSetA[k] += coeffSetA[k];
            // Term from x^itemValue * current_coeffSetA[k - itemValue] (itemValue is chosen for sum k)
            if (k >= itemValue) {
                nextCoeffSetA[k] += coeffSetA[k - itemValue];
            }
        }
        coeffSetA = nextCoeffSetA; // Update coeffSetA to the new state

        // Calculate the next state for coeffSetB (multiplying by (2 + x^itemValue))
        const nextCoeffSetB = new Array(totalSum + 1).fill(0);
        for (let k = 0; k <= totalSum; k++) {
            // Term from 2 * current_coeffSetB[k] (itemValue is not chosen for sum k, and has 2 options G/B)
            nextCoeffSetB[k] += 2 * coeffSetB[k];
            // Term from x^itemValue * current_coeffSetB[k - itemValue] (itemValue is chosen for sum k)
            if (k >= itemValue) {
                nextCoeffSetB[k] += coeffSetB[k - itemValue];
            }
        }
        coeffSetB = nextCoeffSetB; // Update coeffSetB to the new state
    }

    const totalPossibleAssignments = Math.pow(3, elementCount);
    let accumulatedSumB = 0; // Corresponds to the original 'sum' variable
    let accumulatedSumA = 0; // Corresponds to the original 'sum1' variable

    // Accumulate values for `accumulatedSumB` based on the original logic:
    // sum of dp1[N][k] for k >= S/2.
    // The loop starts from Math.ceil(totalSum / 2) because `_i3 >= S/2` implies starting from the smallest integer >= S/2.
    for (let k = Math.ceil(totalSum / 2); k <= totalSum; k++) {
        accumulatedSumB += coeffSetB[k];
    }

    // Accumulate values for `accumulatedSumA` based on the original logic:
    // dp[N][S/2] only if S is even.
    // The original `_i3 === S/2` condition is only true if S is even, as _i3 is an integer.
    if (totalSum % 2 === 0) {
        accumulatedSumA += coeffSetA[totalSum / 2];
    }

    // Apply the final inclusion-exclusion formula and modulo operation.
    let finalResult = totalPossibleAssignments - 3 * accumulatedSumB + 3 * accumulatedSumA;
    finalResult = (finalResult % MODULUS_CONSTANT + MODULUS_CONSTANT) % MODULUS_CONSTANT;

    console.log(finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
