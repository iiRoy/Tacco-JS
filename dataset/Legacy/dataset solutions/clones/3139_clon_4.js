const fs = require('fs');

/**
 * Parses an integer from a string, strictly adhering to 32-bit signed integer range
 * and ensuring the entire string represents a valid integer.
 * This mimics PureScript's Data.Int.fromString behavior.
 * @param {string} s The string to parse.
 * @returns {number | null} The parsed integer, or null if invalid.
 */
function parseStrictInt(s) {
    if (typeof s !== 'string' || s.trim() === '') {
        return null;
    }
    const parsed = parseInt(s, 10);
    // Check for NaN, non-integer string (e.g., "10a"), and 32-bit signed integer range
    if (isNaN(parsed) || String(parsed) !== s || (parsed | 0) !== parsed) {
        return null;
    }
    return parsed;
}

/**
 * Calculates the number of times the sum of products (A_i * B) plus a constant C is positive.
 * This is the core logic, replacing solve$prime$prime.
 * @param {number} fixedC The constant C.
 * @param {number[]} betaValues An array of B coefficients.
 * @param {number[][]} alphaMatrices A 2D array of A matrices.
 * @returns {number} The count of positive sums.
 */
function calculatePositiveCount(fixedC, betaValues, alphaMatrices) {
    let positiveSumCount = 0;

    for (let i = 0; i < alphaMatrices.length; i++) {
        const currentAlphaRow = alphaMatrices[i];
        let currentDotProduct = 0;

        for (let j = 0; j < currentAlphaRow.length; j++) {
            currentDotProduct += currentAlphaRow[j] * betaValues[j];
        }

        const totalSum = currentDotProduct + fixedC;
        if (totalSum > 0) {
            positiveSumCount++;
        }
    }

    return positiveSumCount;
}

/**
 * Processes the entire input string, parses it, validates, and performs the calculation.
 * This replaces the `solve` function in the original.
 * @param {string} rawInput The raw input string from stdin.
 * @returns {string} The result as a string.
 * @throws {Error} If any parsing or validation fails, with specific error messages.
 */
function processInput(rawInput) {
    const inputLines = rawInput.trim().split('\n');

    // Parse N, M, C from the first line
    const firstLine = inputLines[0];
    if (!firstLine) {
        throw new Error("nmc");
    }
    const nmcParts = firstLine.split(' ');
    if (nmcParts.length !== 3) {
        throw new Error("n m c");
    }

    const numN = parseStrictInt(nmcParts[0]);
    if (numN === null) {
        throw new Error("n");
    }
    const numM = parseStrictInt(nmcParts[1]);
    if (numM === null) {
        throw new Error("m");
    }
    const constC = parseStrictInt(nmcParts[2]);
    if (constC === null) {
        throw new Error("c");
    }

    // Parse B values from the second line
    const secondLine = inputLines[1];
    if (!secondLine) {
        throw new Error("bss");
    }
    const bCoeffs = secondLine.split(' ').map(parseStrictInt);
    if (bCoeffs.some(val => val === null)) {
        // This error path is not explicitly covered by original's "bss" or "bs length"
        // but `mapMaybe` would filter out nulls, leading to a length mismatch.
        // We'll let the length check handle it, assuming all parts are numbers.
        // If `parseStrictInt` returns null, `bCoeffs` will contain nulls.
        // The length check `bCoeffs.length !== numM` will implicitly fail if some were null and filtered.
        // To strictly match original, `mapMaybe` would filter, then length check.
        // So, we need to filter nulls first.
        const filteredBCoeffs = bCoeffs.filter(val => val !== null);
        if (filteredBCoeffs.length !== bCoeffs.length || filteredBCoeffs.length !== numM) {
            throw new Error("bs length"); // This covers both parsing failure and length mismatch
        }
        // Reassign to filtered version
        bCoeffs.splice(0, bCoeffs.length, ...filteredBCoeffs);
    } else if (bCoeffs.length !== numM) {
        throw new Error("bs length");
    }


    // Parse A values from the remaining lines
    const aMatrices = [];
    for (let i = 2; i < inputLines.length; i++) {
        const currentLine = inputLines[i];
        const rowValues = currentLine.split(' ').map(parseStrictInt);
        if (rowValues.some(val => val === null)) {
            // Similar to B, if any A value is not a strict int, it would be filtered by mapMaybe
            // leading to a length mismatch.
            const filteredRowValues = rowValues.filter(val => val !== null);
            if (filteredRowValues.length !== rowValues.length || filteredRowValues.length !== numM) {
                throw new Error("as length"); // Covers parsing failure and length mismatch
            }
            aMatrices.push(filteredRowValues);
        } else if (rowValues.length !== numM) {
            throw new Error("as length");
        } else {
            aMatrices.push(rowValues);
        }
    }

    if (aMatrices.length !== numN) {
        throw new Error("ass length");
    }

    // Perform the calculation
    const result = calculatePositiveCount(constC, bCoeffs, aMatrices);
    return String(result);
}

// Main execution block
try {
    const inputData = fs.readFileSync('/dev/stdin', 'utf8');
    const finalResult = processInput(inputData);
    console.log(finalResult);
} catch (error) {
    // The original code uses Data.Either.fromRight() which throws if Left is encountered.
    // The error message is the value contained in Left.
    // So, we re-throw the error message directly.
    throw error;
}
