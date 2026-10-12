function processInputData(rawDataLines) {
    const lines = rawDataLines.split("\n");
    let currentLineIdx = 0;

    const calculatePrefixSums = (count, sourceLines) => {
        const sums = new Array(count + 1).fill(0);
        for (let i = 1; i <= count; i++) {
            sums[i] = Number.parseInt(sourceLines[currentLineIdx], 10) + sums[i - 1];
            currentLineIdx++;
        }
        return sums;
    };

    const countDifferences = (prefixSumsArray, maxPossibleDiff) => {
        const diffCounts = new Array(maxPossibleDiff + 1).fill(0);
        const arrayLength = prefixSumsArray.length;

        for (let idx1 = 0; idx1 < arrayLength; idx1++) {
            for (let idx2 = idx1 + 1; idx2 < arrayLength; idx2++) {
                const differenceValue = prefixSumsArray[idx2] - prefixSumsArray[idx1];
                if (differenceValue >= 0 && differenceValue <= maxPossibleDiff) {
                    diffCounts[differenceValue]++;
                }
            }
        }
        return diffCounts;
    };

    while (true) {
        const dimensionsLineParts = lines[currentLineIdx].split(" ");
        const numHeights = Number.parseInt(dimensionsLineParts[0], 10);
        const numWidths = Number.parseInt(dimensionsLineParts[1], 10);
        currentLineIdx++;

        if (numHeights === 0 && numWidths === 0) {
            break;
        }

        const heightPrefixSums = calculatePrefixSums(numHeights, lines);
        const widthPrefixSums = calculatePrefixSums(numWidths, lines);

        const MAX_DIMENSION_SUM_VALUE = 1000;

        const heightDifferenceCounts = countDifferences(heightPrefixSums, MAX_DIMENSION_SUM_VALUE);
        const widthDifferenceCounts = countDifferences(widthPrefixSums, MAX_DIMENSION_SUM_VALUE);

        let totalMatchingSegments = 0;

        for (let segmentLength = 1; segmentLength <= MAX_DIMENSION_SUM_VALUE; segmentLength++) {
            const currentHeightCount = heightDifferenceCounts[segmentLength];
            const currentWidthCount = widthDifferenceCounts[segmentLength];
            totalMatchingSegments += currentHeightCount * currentWidthCount;
        }

        console.log(totalMatchingSegments);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
