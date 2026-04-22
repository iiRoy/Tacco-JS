const inputReader = require('node:fs');
const sourceData = inputReader.readFileSync('/dev/stdin', 'utf8');
const contentLines = sourceData.trim().split('\n');

const configComponents = contentLines[0].split(/\s/).map(str => parseInt(str, 10));
const totalElementCount = configComponents[0]; // n
const selectionSize = configComponents[1];  // k

const numericStrings = contentLines[1].split(/\s/);

const allFigures = numericStrings.map(BigInt);

const positiveFigures = allFigures.filter(v => v > 0n).sort((a, b) => b - a); // Descending
const negativeFigures = allFigures.filter(v => v < 0n).sort((a, b) => a - b); // Ascending (so largest absolute values first)
const hasZero = allFigures.some(v => v === 0n);

let finalAccumulation = 1n; // Default for selectionSize = 0

if (selectionSize === 0) {
    // Product of zero elements is 1
} else if (selectionSize === totalElementCount && negativeFigures.length === totalElementCount && selectionSize % 2 !== 0 && !hasZero) {
    // Specific scenario: all numbers are negative, selectionSize is odd, no zeros.
    // The product will definitely be negative, and it's simply the product of all numbers.
    finalAccumulation = negativeFigures.reduce((acc, val) => acc * val, 1n);
} else {
    // General strategy: aim for the largest possible product.
    // This involves selecting `selectionSize` numbers, prioritizing those with larger absolute values.
    // If the resulting product is negative, attempt a swap to make it positive if possible.

    let initialSelectionCandidates = [];
    let initialNegativeCount = 0;

    let posIndex = 0;
    let negIndex = 0;

    // Greedily pick numbers with largest absolute values
    while (initialSelectionCandidates.length < selectionSize && (posIndex < positiveFigures.length || negIndex < negativeFigures.length)) {
        let pickFromPositives = false;
        if (posIndex < positiveFigures.length && negIndex < negativeFigures.length) {
            // Compare absolute values
            if (positiveFigures[posIndex] >= -negativeFigures[negIndex]) {
                pickFromPositives = true;
            } else {
                pickFromPositives = false;
            }
        } else if (posIndex < positiveFigures.length) {
            pickFromPositives = true;
        } else if (negIndex < negativeFigures.length) {
            pickFromPositives = false;
        } else {
            break; // Should not be reached in valid inputs
        }

        if (pickFromPositives) {
            initialSelectionCandidates.push(positiveFigures[posIndex]);
            posIndex++;
        } else {
            initialSelectionCandidates.push(negativeFigures[negIndex]);
            initialNegativeCount++;
            negIndex++;
        }
    }

    // If we couldn't even pick `selectionSize` numbers (e.g., `selectionSize` is too large for available non-zero elements),
    // and there are zeros, the product must be 0.
    if (initialSelectionCandidates.length < selectionSize && hasZero) {
        finalAccumulation = 0n;
    } else if (initialSelectionCandidates.length < selectionSize && !hasZero) {
        // This scenario implies selectionSize > totalElementCount, which is not expected for valid inputs.
        // If it happens, it means we pick all available numbers.
        finalAccumulation = initialSelectionCandidates.reduce((acc, val) => acc * val, 1n);
    }
    else {
        // We have `selectionSize` numbers chosen based on largest absolute values.
        let currentProductAttempt = initialSelectionCandidates.reduce((acc, val) => acc * val, 1n);

        if (initialNegativeCount % 2 === 0) {
            // Product is positive (or 0 if a zero was included). This is a good candidate.
            finalAccumulation = currentProductAttempt;
        } else {
            // Product is negative. Attempt to make it positive by swapping.
            let bestSwapCandidate1 = -Infinity; // Replace a negative in selection with a positive from remaining
            let minAbsNegInSelected = initialSelectionCandidates.filter(v => v < 0n).sort((a, b) => b - a)[0]; // Smallest absolute negative (closest to 0)
            let largestPosNotInSelected = positiveFigures.filter(v => !initialSelectionCandidates.includes(v)).sort((a, b) => b - a)[0];

            if (minAbsNegInSelected !== undefined && largestPosNotInSelected !== undefined) {
                bestSwapCandidate1 = currentProductAttempt / minAbsNegInSelected * largestPosNotInSelected;
            }

            let bestSwapCandidate2 = -Infinity; // Replace a positive in selection with a negative from remaining
            let minPosInSelected = initialSelectionCandidates.filter(v => v > 0n).sort((a, b) => a - b)[0]; // Smallest positive
            let largestAbsNegNotInSelected = negativeFigures.filter(v => !initialSelectionCandidates.includes(v)).sort((a, b) => a - b)[0]; // Largest absolute negative (most negative)

            if (minPosInSelected !== undefined && largestAbsNegNotInSelected !== undefined) {
                bestSwapCandidate2 = currentProductAttempt / minPosInSelected * largestAbsNegNotInSelected;
            }

            if (bestSwapCandidate1 !== -Infinity || bestSwapCandidate2 !== -Infinity) {
                finalAccumulation = (bestSwapCandidate1 > bestSwapCandidate2) ? bestSwapCandidate1 : bestSwapCandidate2;
            } else {
                // No valid swap to make it positive. The product remains negative.
                finalAccumulation = currentProductAttempt;
            }

            // If finalAccumulation is still negative, but zeros exist, 0 is a better product.
            if (finalAccumulation < 0n && hasZero) {
                finalAccumulation = 0n;
            }
        }
    }
}

const primeModulus = BigInt(1000000007); // 10^9 + 7

let resultRemainder = finalAccumulation % primeModulus;
while (resultRemainder < 0n) {
    resultRemainder += primeModulus;
}
console.log(resultRemainder.toString());