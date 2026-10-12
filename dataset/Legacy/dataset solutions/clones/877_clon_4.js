const parseTimeComponents = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + minutes;
};

const processInputSegments = (remainingLines) => {
    if (remainingLines.length === 0) {
        return;
    }

    const [segmentHeader, ...dataLinesAndBeyond] = remainingLines;
    const [segmentSize, timeThreshold] = segmentHeader.split(' ').map(Number);

    const currentSegmentData = dataLinesAndBeyond.slice(0, segmentSize);
    const subsequentSegments = dataLinesAndBeyond.slice(segmentSize);

    const { collectedMatches } = currentSegmentData.reduce(
        (accumulator, currentLineContent, lineIndex) => {
            const lineParts = currentLineContent.split(' ');
            const currentEntryStartTimeStr = lineParts[0];
            const currentEntryEndTimeStr = lineParts[2];
            const currentEntryIdentifier = lineParts[3];

            const currentEntryStartTimeInMinutes = parseTimeComponents(currentEntryStartTimeStr);

            if (lineIndex > 0) {
                const timeDifference = currentEntryStartTimeInMinutes - accumulator.previousEndTimeInMinutes;
                if (timeDifference >= timeThreshold) {
                    accumulator.collectedMatches.push(`${accumulator.previousIdentifier} ${timeDifference}`);
                }
            }

            accumulator.previousEndTimeInMinutes = parseTimeComponents(currentEntryEndTimeStr);
            accumulator.previousIdentifier = currentEntryIdentifier;

            return accumulator;
        },
        { collectedMatches: [], previousEndTimeInMinutes: null, previousIdentifier: null }
    );

    if (collectedMatches.length === 0) {
        console.log(0);
    } else {
        console.log(collectedMatches.length);
        collectedMatches.forEach(console.log);
    }

    processInputSegments(subsequentSegments);
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const initialInputLines = rawInputContent.trim().split('\n');

processInputSegments(initialInputLines);
