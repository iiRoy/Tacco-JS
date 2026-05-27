function processInputData(rawData) {
    const allLines = rawData.split('\n');
    const dataLines = allLines.slice(1);

    const parseRangeString = (lineStr) => {
        const startChar = lineStr[0];
        const endChar = lineStr[2];
        const startVal = parseInt(startChar);
        const endVal = parseInt(endChar);

        const currentRange = [];
        for (let k = startVal; k < endVal; k++) {
            currentRange.push(k);
        }
        return currentRange;
    };

    let segmentRanges = dataLines.map(parseRangeString);

    let disjointSegmentsCount = 1;

    if (segmentRanges.length === 0) {
        console.log(parseInt(disjointSegmentsCount));
        return;
    }

    let currentSegmentIndex = 0;
    while (currentSegmentIndex < segmentRanges.length - 1) {
        console.log(segmentRanges);

        const firstRange = segmentRanges[currentSegmentIndex];
        const secondRange = segmentRanges[currentSegmentIndex + 1];

        const commonElements = findCommonElements(firstRange, secondRange);

        if (commonElements.length !== 0) {
            segmentRanges[currentSegmentIndex] = commonElements;
            segmentRanges.splice(currentSegmentIndex + 1, 1);
            currentSegmentIndex--;
        } else {
            disjointSegmentsCount++;
        }
        currentSegmentIndex++;
    }
    console.log(parseInt(disjointSegmentsCount));
}

function findCommonElements(firstRange, secondRange) {
    if (!firstRange || !secondRange || firstRange.length === 0 || secondRange.length === 0) {
        return [];
    }
    return firstRange.filter(element => secondRange.includes(element));
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
