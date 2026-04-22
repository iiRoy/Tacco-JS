function coordinateProcessor(rawSource) {
    const lineBreakPosition = rawSource.indexOf('\n');
    const relevantPart = rawSource.substring(0, lineBreakPosition !== -1 ? lineBreakPosition : rawSource.length);

    const separationIndex = relevantPart.indexOf(' ');

    const elementCountString = relevantPart.substring(0, separationIndex);
    const spanParameterString = relevantPart.substring(separationIndex + 1);

    const totalElements = Number(elementCountString);
    const proximityValue = Number(spanParameterString);

    const effectiveSpan = (proximityValue << 1) + 1; // proximityValue * 2 + 1 using bitwise left shift

    let requiredContainers = 0;
    let currentCoveredExtent = 0;

    // Custom implementation for ceiling division (Math.ceil(totalElements / effectiveSpan))
    // This avoids direct division and Math.ceil, using an iterative summation approach.
    if (totalElements > 0) {
        while (currentCoveredExtent < totalElements) {
            currentCoveredExtent += effectiveSpan;
            requiredContainers++;
        }
    } else {
        requiredContainers = 0;
    }

    console.log(requiredContainers);
}

const inputSourceHandler = () => {
    return require('node:fs').readFileSync('/dev/stdin', 'utf8');
};

coordinateProcessor(inputSourceHandler());