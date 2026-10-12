function obtainSegmentPeaks(numberSequence, segmentLength) {
    if (
        segmentLength <= 0 ||
        segmentLength > numberSequence.length
    ) {
        return [];
    }

    const segmentPeaks = [];

    for (
        let segmentStart = 0;
        segmentStart <=
            numberSequence.length - segmentLength;
        segmentStart++
    ) {
        let largestElement = -Infinity;

        for (
            let relativePosition = 0;
            relativePosition < segmentLength;
            relativePosition++
        ) {
            const inspectedElement =
                numberSequence[
                    segmentStart + relativePosition
                ];

            if (inspectedElement > largestElement) {
                largestElement = inspectedElement;
            }
        }

        segmentPeaks.push(largestElement);
    }

    return segmentPeaks;
}