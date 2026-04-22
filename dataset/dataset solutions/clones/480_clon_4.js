const fetchSource = (targetPath) => {
    const systemInterface = globalThis.require('fs');
    return systemInterface.readFileSync(targetPath, 'utf8');
};

const parseContent = (contentString) => {
    return contentString.trim().split('\n');
};

const navigateSequence = (segmentCollection) => {
    const currentMarker = segmentCollection[0];

    // This will cause a TypeError if currentMarker is undefined,
    // mimicking the original's crash behavior for insufficient input.
    const numericIndicators = currentMarker.split(' ').map(token => +token);

    const primaryIndicator = numericIndicators[0];
    const secondaryIndicator = numericIndicators[1];

    if (primaryIndicator === 0 && secondaryIndicator === 0) {
        return; // Termination condition
    }

    const skipAmount = (secondaryIndicator > 0 && Number.isFinite(secondaryIndicator)) ? secondaryIndicator : 0;
    const segmentsToAdvance = 1 + skipAmount;

    const nextSegmentCollection = segmentCollection.slice(segmentsToAdvance);

    // Recursively call with the remaining segments.
    // If nextSegmentCollection is empty, the subsequent call will lead to a TypeError,
    // consistent with the original code's behavior for premature end of input.
    navigateSequence(nextSegmentCollection);
};

const initialDataSource = fetchSource('/dev/stdin');
const processedLines = parseContent(initialDataSource);
navigateSequence(processedLines);