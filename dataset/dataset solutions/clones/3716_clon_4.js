function processInput(inputString) {
    const lines = inputString.split("\n");
    const elementCount = Number(lines[0]);
    const numbersArray = lines[1].split(" ").map(Number);

    const cumulativeSums = new Array(elementCount + 1).fill(0);
    for (let k = 0; k < elementCount; k++) {
        cumulativeSums[k + 1] = cumulativeSums[k] + numbersArray[k];
    }

    let minimumOverallDifference = Infinity;

    for (let p2_idx_in_a = 1; p2_idx_in_a < elementCount - 2; p2_idx_in_a++) {
        const currentPrefixSum = cumulativeSums[p2_idx_in_a + 1];
        const targetFirstSegmentSum = (currentPrefixSum + 1) >>> 1;

        const p1Candidates = [];
        const p1_cumulative_idx_found = findSplitPointIndex(cumulativeSums, 1, p2_idx_in_a, targetFirstSegmentSum);
        p1Candidates.push(p1_cumulative_idx_found - 1);
        if (p1_cumulative_idx_found - 1 > 0) {
            p1Candidates.push(p1_cumulative_idx_found - 2);
        }

        const totalSum = cumulativeSums[elementCount];
        const targetThirdSegmentCumulativeSum = (totalSum + currentPrefixSum + 1) >>> 1;

        const p3Candidates = [];
        const p3_cumulative_idx_found = findSplitPointIndex(cumulativeSums, p2_idx_in_a + 2, elementCount - 1, targetThirdSegmentCumulativeSum);
        p3Candidates.push(p3_cumulative_idx_found - 1);
        if (p3_cumulative_idx_found - 1 > p2_idx_in_a + 1) {
            p3Candidates.push(p3_cumulative_idx_found - 2);
        }

        for (const p1_idx_in_a of p1Candidates) {
            if (p1_idx_in_a < 0 || p1_idx_in_a >= p2_idx_in_a) {
                continue;
            }

            for (const p3_idx_in_a of p3Candidates) {
                if (p3_idx_in_a <= p2_idx_in_a || p3_idx_in_a >= elementCount - 1) {
                    continue;
                }

                const segmentValues = [];
                segmentValues.push(cumulativeSums[p1_idx_in_a + 1]);
                segmentValues.push(cumulativeSums[p2_idx_in_a + 1] - cumulativeSums[p1_idx_in_a + 1]);
                segmentValues.push(cumulativeSums[p3_idx_in_a + 1] - cumulativeSums[p2_idx_in_a + 1]);
                segmentValues.push(cumulativeSums[elementCount] - cumulativeSums[p3_idx_in_a + 1]);

                segmentValues.sort((valA, valB) => valA - valB);
                minimumOverallDifference = Math.min(minimumOverallDifference, segmentValues[3] - segmentValues[0]);
            }
        }
    }

    console.log(minimumOverallDifference);
}

function findSplitPointIndex(dataCollection, startBoundary, endBoundary, desiredValue) {
    let lowPointer = startBoundary;
    let highPointer = endBoundary;

    while (lowPointer < highPointer) {
        const midPoint = lowPointer + Math.floor((highPointer - lowPointer) / 2);
        if (dataCollection[midPoint] < desiredValue) {
            lowPointer = midPoint + 1;
        } else {
            highPointer = midPoint;
        }
    }
    return lowPointer;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
