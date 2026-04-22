function obtainProcessedSegments(unparsedSource) {
    const allLines = unparsedSource.split('\n');
    const segmentCount = Number(allLines[0]);
    const dataSegments = allLines.slice(1, segmentCount + 1);

    const parsedSegments = dataSegments.map(lineContent => {
        const numericValues = lineContent.split(' ').map(Number);
        const centralPosition = numericValues[0];
        const deviationRange = numericValues[1];
        return {
            centerValue: centralPosition,
            spanLength: deviationRange,
            leftEdge: centralPosition - deviationRange,
            rightEdge: centralPosition + deviationRange
        };
    });

    parsedSegments.sort((itemA, itemB) => itemA.centerValue - itemB.centerValue);

    return parsedSegments;
}

function calculateDisjointGroups(refinedSegments) {
    if (refinedSegments.length === 0) {
        return 0;
    }

    const initialGroupState = {
        totalGroups: 1,
        currentGroupBoundary: refinedSegments[0].rightEdge
    };

    const finalGroupState = refinedSegments.slice(1).reduce((accumulatorState, currentSegment) => {
        const { totalGroups, currentGroupBoundary } = accumulatorState;
        const currentSegmentLeft = currentSegment.leftEdge;
        const currentSegmentRight = currentSegment.rightEdge;

        if (currentGroupBoundary > currentSegmentLeft) {
            return {
                totalGroups: totalGroups,
                currentGroupBoundary: Math.min(currentGroupBoundary, currentSegmentRight)
            };
        } else {
            return {
                totalGroups: totalGroups + 1,
                currentGroupBoundary: currentSegmentRight
            };
        }
    }, initialGroupState);

    return finalGroupState.totalGroups;
}

function entryPoint(sourceData) {
    const processedItems = obtainProcessedSegments(sourceData);
    const groupResult = calculateDisjointGroups(processedItems);
    console.log(String(groupResult));
    return groupResult;
}