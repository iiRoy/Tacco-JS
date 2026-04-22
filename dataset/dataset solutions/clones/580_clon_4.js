(function (sourceData) {
    const extractedUnits = sourceData.replace(/\r/g, '').split("\n");
    const finalCounts = [];

    // Helper function for Longest Common Substring using Dynamic Programming
    const getCommonSubstringLength = (pieceA, pieceB) => {
        const lengthA = pieceA.length;
        const lengthB = pieceB.length;
        let maximalExtent = 0;

        // DP table to store lengths of common suffixes of substrings
        // commonMatrix[i][j] stores the length of the longest common suffix of pieceA[0...i-1] and pieceB[0...j-1]
        const commonMatrix = Array(lengthA + 1).fill(null).map(() => Array(lengthB + 1).fill(0));

        for (let idxA = 1; idxA <= lengthA; idxA++) {
            for (let idxB = 1; idxB <= lengthB; idxB++) {
                if (pieceA[idxA - 1] === pieceB[idxB - 1]) {
                    commonMatrix[idxA][idxB] = commonMatrix[idxA - 1][idxB - 1] + 1;
                    if (commonMatrix[idxA][idxB] > maximalExtent) {
                        maximalExtent = commonMatrix[idxA][idxB];
                    }
                } else {
                    commonMatrix[idxA][idxB] = 0; // Characters do not match, reset common suffix length
                }
            }
        }
        return maximalExtent;
    };

    // Recursive function to process input pairs
    const processRemainingUnits = (unitsList, resultsAccumulator) => {
        if (unitsList.length === 0 || unitsList[0] === '') {
            resultsAccumulator.forEach(val => console.log(val));
            return;
        }

        const currentFirstString = unitsList[0];
        const currentSecondString = unitsList[1];

        const calculatedLength = getCommonSubstringLength(currentFirstString, currentSecondString);
        resultsAccumulator.push(calculatedLength);

        // Continue processing with the rest of the input, skipping the processed pair
        processRemainingUnits(unitsList.slice(2), resultsAccumulator);
    };

    processRemainingUnits(extractedUnits, finalCounts);

})(require("fs").readFileSync("/dev/stdin", "utf8"));