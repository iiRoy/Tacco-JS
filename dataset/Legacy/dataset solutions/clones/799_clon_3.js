function processInputData(rawDataString) {
    const rawInputLines = rawDataString.split("\n");
    let currentLineIdx = 0;

    while (true) {
        const dimensionsLineParts = rawInputLines[currentLineIdx++].split(" ");
        const numHeights = parseInt(dimensionsLineParts[0], 10);
        const numWidths = parseInt(dimensionsLineParts[1], 10);

        if (numHeights === 0 && numWidths === 0) {
            break;
        }

        const heightDataResult = parseAndCalculatePrefixSums(rawInputLines, currentLineIdx, numHeights);
        currentLineIdx = heightDataResult.nextIndex;
        const heightPrefixSums = heightDataResult.prefixSums;

        const widthDataResult = parseAndCalculatePrefixSums(rawInputLines, currentLineIdx, numWidths);
        currentLineIdx = widthDataResult.nextIndex;
        const widthPrefixSums = widthDataResult.prefixSums;

        const maxPossibleSum = Math.max(
            heightPrefixSums[numHeights],
            widthPrefixSums[numWidths]
        );

        const heightDifferenceCounts = calculateDifferenceCounts(heightPrefixSums, maxPossibleSum);
        const widthDifferenceCounts = calculateDifferenceCounts(widthPrefixSums, maxPossibleSum);

        let matchingSegmentPairs = 0;
        for (let sumValue = 1; sumValue <= maxPossibleSum; ++sumValue) {
            const hCount = heightDifferenceCounts[sumValue];
            const wCount = widthDifferenceCounts[sumValue];
            matchingSegmentPairs += hCount * wCount;
        }

        console.log(matchingSegmentPairs);
    }
}

function parseAndCalculatePrefixSums(lines, startIdx, count) {
    const prefixSums = new Array(count + 1);
    prefixSums[0] = 0;
    let currentIdx = startIdx;
    for (let i = 1; i <= count; ++i) {
        const segmentValue = parseInt(lines[currentIdx++], 10);
        prefixSums[i] = segmentValue + prefixSums[i - 1];
    }
    return { nextIndex: currentIdx, prefixSums: prefixSums };
}

function calculateDifferenceCounts(prefixSumsArray, maxVal) {
    const counts = new Array(maxVal + 1).fill(0);
    const arrayLength = prefixSumsArray.length;

    for (let startIndex = 0; startIndex < arrayLength; ++startIndex) {
        for (let endIndex = startIndex + 1; endIndex < arrayLength; ++endIndex) {
            const segmentDifference = prefixSumsArray[endIndex] - prefixSumsArray[startIndex];
            // The maxVal ensures we don't try to access an index beyond the initialized array size.
            // Given how maxVal is calculated, segmentDifference will always be <= maxVal.
            counts[segmentDifference]++;
        }
    }
    return counts;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
