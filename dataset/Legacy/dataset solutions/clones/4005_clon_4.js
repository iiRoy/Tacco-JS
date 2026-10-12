const processInputData = (rawData) => {
    const contentLines = rawData.split('\n');
    const relevantSegments = contentLines[1].split(' ');

    const markerPresent = relevantSegments
        .slice(0, relevantSegments.length - 1)
        .some(segmentValue => segmentValue === 'Y');

    console.log(markerPresent ? 'Four' : 'Three');
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
