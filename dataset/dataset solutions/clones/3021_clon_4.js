function generateTriangleCombinations(elementCount, dataPoints) {
    let allElementsSum = 0;
    for (let i = 0; i < elementCount; ++i) {
        allElementsSum += dataPoints[i];
    }

    const BIG_PRIME = 998244353; 

    // maxPossibleSideValue is the maximum sum any single side (let's call them P1, P2, P3) can have.
    // For P1, P2, P3 to form a valid triangle, each side must be strictly less than
    // the sum of the other two. This implies each side must be strictly less than
    // half of the total sum of all sides (P1 + P2 + P3).
    const maxPossibleSideValue = Math.floor(allElementsSum / 2);

    // recordedOutcomes[s1][s2] will store the number of ways to achieve sum s1 for the first partition
    // and sum s2 for the second partition using a subset of the elements processed so far.
    // Initialize all entries with 0.
    const recordedOutcomes = Array(maxPossibleSideValue + 1).fill(null).map(() => Array(maxPossibleSideValue + 1).fill(0));

    // Base case: there is one way to have sums (0, 0) for the first two partitions
    // by selecting no elements for either.
    recordedOutcomes[0][0] = 1;

    // Iterate through each number in the input array.
    for (const currentNumber of dataPoints) {
        // Iterate sums downwards to ensure that when we update recordedOutcomes[s1][s2],
        // recordedOutcomes[s1 - currentNumber][s2] and recordedOutcomes[s1][s2 - currentNumber]
        // still refer to the state *before* considering currentNumber.
        for (let s1 = maxPossibleSideValue; s1 >= 0; s1--) {
            for (let s2 = maxPossibleSideValue; s2 >= 0; s2--) {
                // Option 1: currentNumber is assigned to the first partition (P1)
                if (s1 >= currentNumber) {
                    recordedOutcomes[s1][s2] = (recordedOutcomes[s1][s2] + recordedOutcomes[s1 - currentNumber][s2]) % BIG_PRIME;
                }

                // Option 2: currentNumber is assigned to the second partition (P2)
                if (s2 >= currentNumber) {
                    recordedOutcomes[s1][s2] = (recordedOutcomes[s1][s2] + recordedOutcomes[s1][s2 - currentNumber]) % BIG_PRIME;
                }

                // Option 3: currentNumber is assigned to the third partition (P3).
                // The current value of recordedOutcomes[s1][s2] (before these additions)
                // already represents the count where currentNumber was implicitly assigned to P3
                // (i.e., it didn't change s1 or s2). So, no explicit addition is needed for this case.
            }
        }
    }

    let totalValidTriangles = 0;

    // After processing all numbers and filling the DP table,
    // iterate through it to count all valid triangle configurations.
    for (let s1 = 1; s1 <= maxPossibleSideValue; s1++) { // First partition sum must be positive
        for (let s2 = 1; s2 <= maxPossibleSideValue; s2++) { // Second partition sum must be positive
            // If no ways to form this (s1, s2) pair, skip.
            if (recordedOutcomes[s1][s2] === 0) continue;

            // Calculate the sum for the third partition (P3).
            const s3 = allElementsSum - s1 - s2;

            // Third partition sum must also be positive.
            // And also less than or equal to maxPossibleSideValue for consistency with DP table range.
            if (s3 <= 0 || s3 > maxPossibleSideValue) continue;

            // Check the triangle inequality conditions:
            // The sum of any two sides must be strictly greater than the third side.
            if (s1 + s2 > s3 &&
                s2 + s3 > s1 &&
                s3 + s1 > s2) {
                totalValidTriangles = (totalValidTriangles + recordedOutcomes[s1][s2]) % BIG_PRIME;
            }
        }
    }

    return totalValidTriangles;
}