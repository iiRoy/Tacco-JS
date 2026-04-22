const fileSystem = require('fs');

/**
 * Reads numerical inputs from standard input, parsing them into an array of numbers.
 * @returns {number[]} An array containing numbers from the input.
 */
function readAndParseNumericalInputs() {
    const rawDataBuffer = fileSystem.readFileSync(0, 'utf8'); // Using 0 for stdin
    // Clean up whitespace, split by newlines, and convert each part to a number.
    const processedInputs = rawDataBuffer
        .trim()
        .split('\n')
        .map(segment => Number(segment));
    return processedInputs;
}

/**
 * Normalizes a difference value 'diff' into the range [1, halfModulus]
 * considering a given modulus.
 * @param {number} diff The initial difference.
 * @param {number} modulus The modulus (n).
 * @param {number} halfModulus The upper limit for normalization ((n-1)/2).
 * @returns {number} The normalized difference.
 */
function normalizeDifferenceModulo(diff, modulus, halfModulus) {
    let normalized = diff;
    if (normalized < 0) {
        normalized += modulus; // Ensure positive modulo N
    }
    // If it's in the second half (e.g., n-1, n-2, ..., (n+1)/2),
    // map it to its symmetric counterpart in the first half (1, 2, ..., (n-1)/2).
    // Example: for n=7, halfModulus=3. If diff=6, then 6 > 3, so 6-7 = -1, which is equivalent to 1.
    if (normalized > halfModulus) {
        normalized = modulus - normalized; // Equivalent to -normalized % modulus
    }
    return normalized;
}

const allInputNumbers = readAndParseNumericalInputs();
let inputIndex = 0;

// Main processing loop for each modulus value
for (;;) {
    const currentModulusValue = allInputNumbers[inputIndex++];

    // Terminate processing if the modulus is zero
    if (currentModulusValue === 0) {
        break;
    }

    // Basic validation: modulus must be a positive integer.
    // For this problem, it's typically an odd prime, but the logic works for any positive integer.
    if (currentModulusValue < 1 || !Number.isInteger(currentModulusValue)) {
        console.error(`Warning: Invalid modulus value encountered: ${currentModulusValue}. Skipping.`);
        continue;
    }

    // Step 1: Identify all quadratic residues modulo currentModulusValue.
    // 'isQrFlag' array: index 'k' is true if 'k' is a quadratic residue.
    const isQrFlag = new Array(currentModulusValue).fill(false);
    for (let candidate = 1; candidate < currentModulusValue; candidate++) {
        // Calculate (candidate * candidate) % currentModulusValue
        const residue = (candidate * candidate) % currentModulusValue;
        isQrFlag[residue] = true;
    }

    // Step 2: Collect the actual values of quadratic residues into a list.
    const listOfQuadraticResidues = [];
    for (let rVal = 0; rVal < currentModulusValue; rVal++) {
        if (isQrFlag[rVal]) {
            listOfQuadraticResidues.push(rVal);
        }
    }

    // Step 3: Calculate the maximum relevant difference value.
    // For a modulus 'n', differences are considered up to (n-1)/2.
    // This assumes 'n' is odd, which is typical for quadratic residue problems.
    // If 'n' is even, (n-1)/2 will result in a float; floor() or similar might be needed.
    // The original code performs integer division (n-1)/2, which effectively floors it.
    const maxRelevantDifference = Math.floor((currentModulusValue - 1) / 2);

    // Step 4: Initialize an array to store frequencies of differences.
    // We care about differences from 1 up to maxRelevantDifference.
    // Index 0 will be unused or ignored in the final output.
    const differenceFrequencyCounts = new Array(maxRelevantDifference + 1).fill(0);

    // Step 5: Iterate through all unique pairs of quadratic residues
    // and count their normalized differences.
    const numResidues = listOfQuadraticResidues.length;
    for (let i = 0; i < numResidues; i++) {
        for (let j = 0; j < numResidues; j++) {
            // Skip if comparing a residue with itself.
            if (i === j) {
                continue;
            }

            const res1 = listOfQuadraticResidues[i];
            const res2 = listOfQuadraticResidues[j];
            let rawDifference = res1 - res2;

            // Normalize the difference into the range [1, maxRelevantDifference]
            const normalizedDiff = normalizeDifferenceModulo(
                rawDifference,
                currentModulusValue,
                maxRelevantDifference
            );

            // Increment the count for this normalized difference.
            // We only care about differences > 0, so normalizedDiff will be >= 1.
            if (normalizedDiff > 0 && normalizedDiff <= maxRelevantDifference) {
                differenceFrequencyCounts[normalizedDiff]++;
            }
        }
    }

    // Step 6: Output the results.
    // The problem requires printing (count * 2) for each difference from 1 to maxRelevantDifference.
    // The reason for multiplying by 2 often relates to counting both (a-b) and (b-a) as the same distance,
    // or relating to specific properties of quadratic residue graphs.
    for (let k = 1; k <= maxRelevantDifference; k++) {
        console.log(differenceFrequencyCounts[k] * 2);
    }
}