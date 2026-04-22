const fileAccess = require('fs');

const convertTimepoint = (momentString) => {
    const timeComponents = momentString.split(':').map(Number);
    return (timeComponents[0] * 3600) + (timeComponents[1] * 60);
};

const determineMaximalOverlap = (segmentCollection) => {
    const calculateChainEfficiency = (remainingSegments, currentHighest) => {
        if (remainingSegments.length === 0) {
            return currentHighest;
        }

        const primarySegment = remainingSegments[0];
        const subsequentSegments = remainingSegments.slice(1);

        let activeOverlapCount = 1;
        const nonOverlappingSet = [];

        for (const comparedSegment of subsequentSegments) {
            // Original overlap condition: val[1] > sub[0] && sub[0] > val[0]
            if (primarySegment.finish > comparedSegment.begin && comparedSegment.begin > primarySegment.begin) {
                activeOverlapCount++;
            } else {
                nonOverlappingSet.push(comparedSegment);
            }
        }

        const updatedHighest = Math.max(currentHighest, activeOverlapCount);

        return calculateChainEfficiency(nonOverlappingSet, updatedHighest);
    };

    return calculateChainEfficiency(segmentCollection, 1);
};

const processEntireStream = (dataStream) => {
    const allRows = dataStream.split('\n').filter(row => row.trim() !== '');
    let currentIdx = 0;
    const outputResults = [];

    while (currentIdx < allRows.length) {
        const entryCount = parseInt(allRows[currentIdx++]);
        if (entryCount === 0) {
            break;
        }

        const currentSegmentGroup = [];
        for (let j = 0; j < entryCount; j++) {
            const timePoints = allRows[currentIdx++].split(' ');
            currentSegmentGroup.push({
                begin: convertTimepoint(timePoints[0]),
                finish: convertTimepoint(timePoints[1])
            });
        }
        outputResults.push(determineMaximalOverlap(currentSegmentGroup));
    }
    return outputResults.join('\n');
};

const rawContent = fileAccess.readFileSync('/dev/stdin', 'utf8');
const finalOutput = processEntireStream(rawContent);
console.log(finalOutput);