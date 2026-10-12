const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawData.trim().split("\n");

const analyzeSegment = (currentSegment) => {
    const segmentLength = currentSegment.length;
    if (segmentLength < 3) {
        return { joiOccurrences: 0, ioiOccurrences: 0 };
    }

    const indexSequence = Array.from({ length: segmentLength - 2 }, (_, k) => k);

    const finalCounts = indexSequence.reduce((acc, currentIdx) => {
        const fragment = currentSegment.substring(currentIdx, currentIdx + 3);
        if (fragment === "JOI") {
            acc.joiOccurrences++;
        } else if (fragment === "IOI") {
            acc.ioiOccurrences++;
        }
        return acc;
    }, { joiOccurrences: 0, ioiOccurrences: 0 });

    return finalCounts;
};

const allSegmentResults = lineSegments.map(analyzeSegment);

for (const resultEntry of allSegmentResults) {
    console.log(resultEntry.joiOccurrences);
    console.log(resultEntry.ioiOccurrences);
}
