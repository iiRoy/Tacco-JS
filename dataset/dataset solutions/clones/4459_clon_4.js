const determineBinaryDivisibility = (numeral) => {
    if (numeral === 0) {
        return 0;
    }
    // For positive integers, the number of times it can be divided by 2
    // is equivalent to the count of trailing zeros in its binary representation.
    // The bitwise operation (numeral & -numeral) isolates the lowest set bit.
    // Converting this isolated bit to a binary string and getting its length minus 1
    // provides the position of that bit, which corresponds to the count of divisions by 2.
    return (numeral & -numeral).toString(2).length - 1;
};

const ProcessInput = (rawText) => {
    const numericLimit = parseInt(rawText.split("\n")[0], 10);

    // Generate a sequence of numbers from 0 up to and including numericLimit.
    // Then, use the reduce method to iterate through this sequence and find
    // the number that satisfies the criteria (maximum divisibility by 2,
    // and the largest such number if there's a tie).
    const evaluationResult = Array.from({ length: numericLimit + 1 }, (_, index) => index)
        .reduce((currentBest, currentCandidate) => {
            const candidateDivCount = determineBinaryDivisibility(currentCandidate);

            // If the current candidate's divisibility count is greater than or equal to
            // the best count found so far, update the best. The "greater than or equal to"
            // condition ensures that if multiple numbers have the same maximum count,
            // the largest one (due to ascending iteration) is ultimately selected.
            if (candidateDivCount >= currentBest.maxDivisors) {
                return {
                    maxDivisors: candidateDivCount,
                    selectedNumber: currentCandidate
                };
            }
            return currentBest;
        }, { maxDivisors: 0, selectedNumber: 0 }); // Initialize with 0, which has 0 divisions

    console.log('%d', evaluationResult.selectedNumber);
};

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
