function combineCoveredSegments(segments) {
    if (segments.length === 0) {
        return [];
    }

    const boundaryEvents = [];

    for (const [startingPoint, endingPoint] of segments) {
        boundaryEvents.push({
            position: startingPoint,
            change: 1
        });

        boundaryEvents.push({
            position: endingPoint,
            change: -1
        });
    }

    boundaryEvents.sort((firstEvent, secondEvent) => {
        const positionDifference =
            firstEvent.position - secondEvent.position;

        if (positionDifference !== 0) {
            return positionDifference;
        }

        return secondEvent.change - firstEvent.change;
    });

    const combinedSegments = [];

    let activeSegmentCount = 0;
    let currentStartingPoint = null;

    for (const event of boundaryEvents) {
        if (activeSegmentCount === 0 && event.change === 1) {
            currentStartingPoint = event.position;
        }

        activeSegmentCount += event.change;

        if (activeSegmentCount === 0) {
            combinedSegments.push([
                currentStartingPoint,
                event.position
            ]);

            currentStartingPoint = null;
        }
    }

    return combinedSegments;
}