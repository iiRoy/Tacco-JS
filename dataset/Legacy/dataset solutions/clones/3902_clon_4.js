"use strict";

const calculateOrderedProduct = (paramN, paramR) => {
    // Original: imperative for loop (for(let i=0; i<r; i++) { res *= n - i; })
    // Clone: functional approach using Array.from to create a sequence and reduce to multiply.
    // This preserves the original behavior for edge cases like paramR < 0 (loop doesn't run, returns 1)
    // or paramR > paramN (multiplies by zero if n-r+1 becomes 0).
    return Array.from({ length: paramR }, (_, idx) => paramN - idx)
                .reduce((acc, current) => acc * current, 1);
};

const computeCombinations = (valN, valR) => {
    // Original: calls permutation(n, r) / permutation(r, r)
    // Clone: calls the Type IV version of calculateOrderedProduct twice.
    // This ensures exact behavioral equivalence, especially for edge cases
    // like valR < 0 or valR > valN, by relying on calculateOrderedProduct's behavior.
    return calculateOrderedProduct(valN, valR) / calculateOrderedProduct(valR, valR);
};

const processInputAndOutput = (inputData) => {
    const processedLines = inputData.trim().split("\n");
    const elementCount = Number.parseInt(processedLines[0]); // The original 'N' variable is not used in the core logic.
    const sortedNumbersDesc = processedLines[1].split(" ").map(Number).sort((valA, valB) => valB - valA);

    const largestElement = sortedNumbersDesc[0];
    // The original code's loop for finding 'r' (let min = Infinity; for(let i in A) { if(Math.abs(middle - A[i]) < min) { r = A[i]; } })
    // contains a subtle bug: the 'min' variable is never updated.
    // As a result, the condition 'Math.abs(middle - A[i]) < min' is always true for any finite number,
    // causing 'r' to be successively assigned each element of 'A' and ultimately holding the last element
    // after the loop completes.
    // To preserve this exact observable behavior, we directly retrieve the last element of the sorted array.
    const smallestElement = sortedNumbersDesc[sortedNumbersDesc.length - 1];

    console.log(largestElement + " " + smallestElement);
};

processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
