function processInput(inputString) {
    const lines = inputString.split("\n");
    const count = +lines[0];
    const values = lines[1].split(" ").map(Number);

    let runningSum = 0;
    const cumulativeSums = values.map(val => (runningSum += val));

    let minOverallDifference = Infinity;

    // 'k' represents the split point between the second and third segments.
    // In the original code, this corresponds to the variable 'i'.
    // 'k' ranges from 2 to count - 2 (inclusive).
    // The first two segments together end at index k-1 in cumulativeSums.
    for (let k = 2; k < count - 1; k++) {
        const sumOfFirstTwoSegments = cumulativeSums[k - 1];
        const totalArraySum = cumulativeSums[count - 1];

        // Determine target sum for the first segment (S1)
        // S1 should be approximately half of (S1 + S2)
        const targetForS1 = sumOfFirstTwoSegments / 2;

        // Find candidate split points for 'j' (between S1 and S2)
        // 'j' is a 1-indexed split point.
        // 'j' can range from 1 to k-1.
        // The sum for a split point 'j' is cumulativeSums[j-1].
        const jCandidates = findOptimalSplitPoints(cumulativeSums, 1, k, targetForS1);

        // Determine target sum for the first three segments (S1 + S2 + S3)
        // S1 + S2 + S3 should be approximately half of (S1 + S2 + S3 + S4 + S1 + S2)
        const targetForS123 = (totalArraySum + sumOfFirstTwoSegments) / 2;

        // Find candidate split points for 'l' (between S3 and S4)
        // 'l' is a 1-indexed split point.
        // 'l' can range from k+1 to count-1.
        // The sum for a split point 'l' is cumulativeSums[l-1].
        const lCandidates = findOptimalSplitPoints(cumulativeSums, k + 1, count, targetForS123);

        // Iterate through all combinations of candidate split points for 'j' and 'l'
        for (const jSplitPoint of jCandidates) {
            for (const lSplitPoint of lCandidates) {
                // Calculate the four segment sums
                const segment1Sum = cumulativeSums[jSplitPoint - 1];
                const segment2Sum = cumulativeSums[k - 1] - cumulativeSums[jSplitPoint - 1];
                const segment3Sum = cumulativeSums[lSplitPoint - 1] - cumulativeSums[k - 1];
                const segment4Sum = cumulativeSums[count - 1] - cumulativeSums[lSplitPoint - 1];

                const currentSegmentSums = [segment1Sum, segment2Sum, segment3Sum, segment4Sum];
                const maxCurrentSum = Math.max(...currentSegmentSums);
                const minCurrentSum = Math.min(...currentSegmentSums);
                minOverallDifference = Math.min(minOverallDifference, maxCurrentSum - minCurrentSum);
            }
        }
    }
    console.log(minOverallDifference);
}

// Helper function to find candidate split points using binary search logic.
// It returns an array of 1-indexed split points.
function findOptimalSplitPoints(dataArray, minPossibleSplit, maxExclusiveSplit, targetSumValue) {
    let lowBoundary = minPossibleSplit;
    let highBoundary = maxExclusiveSplit; // Exclusive upper bound for binary search of split points

    while (lowBoundary < highBoundary) {
        const midSplitCandidate = Math.floor((lowBoundary + highBoundary) / 2);
        // The sum for a split point `midSplitCandidate` is `dataArray[midSplitCandidate - 1]`
        if (dataArray[midSplitCandidate - 1] < targetSumValue) {
            lowBoundary = midSplitCandidate + 1;
        } else {
            highBoundary = midSplitCandidate;
        }
    }

    const potentialSplitPointList = [];
    // `lowBoundary` is now the smallest 1-indexed split point `s` such that `dataArray[s-1] >= targetSumValue`.
    // This corresponds to the 'l' or 'r' returned by the original `lower_bound`.

    // Candidate 1: The split point `lowBoundary` itself.
    // Ensure it's within the valid range [minPossibleSplit, maxExclusiveSplit - 1].
    if (lowBoundary >= minPossibleSplit && lowBoundary < maxExclusiveSplit) {
        potentialSplitPointList.push(lowBoundary);
    }

    // Candidate 2: The split point `lowBoundary + 1`.
    // This corresponds to checking `b[l]` or `b[r]` in the original code.
    // Ensure it's within the valid range [minPossibleSplit, maxExclusiveSplit - 1].
    if (lowBoundary + 1 >= minPossibleSplit && lowBoundary + 1 < maxExclusiveSplit) {
        potentialSplitPointList.push(lowBoundary + 1);
    }

    // Return unique and sorted candidates.
    return [...new Set(potentialSplitPointList)].sort((a, b) => a - b);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
