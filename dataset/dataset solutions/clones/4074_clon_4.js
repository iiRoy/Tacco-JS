const ProcessTravelPlans = (rawData) => {
    const planEntries = rawData.split("\n").slice(1).filter(Boolean);

    const parsedSegments = planEntries.map(entryLine => {
        const segmentComponents = entryLine.split(" ");
        return {
            destinationTime: parseInt(segmentComponents[0], 10),
            destinationX: parseInt(segmentComponents[1], 10),
            destinationY: parseInt(segmentComponents[2], 10)
        };
    });

    const finalJourneyState = parsedSegments.reduce((currentJourney, nextWaypoint) => {
        const { currentXPosition, currentYPosition, lastKnownTime, overallOutcome } = currentJourney;
        const { destinationTime, destinationX, destinationY } = nextWaypoint;

        const timeElapsedForSegment = destinationTime - lastKnownTime;
        const requiredXMovement = Math.abs(destinationX - currentXPosition);
        const requiredYMovement = Math.abs(destinationY - currentYPosition);
        const totalManhattanPath = requiredXMovement + requiredYMovement;

        let segmentDecision = null;

        const hasSurplusTime = totalManhattanPath < timeElapsedForSegment;
        const surplusTimeIsOdd = (timeElapsedForSegment - totalManhattanPath) % 2 !== 0;
        const hasInsufficientTime = totalManhattanPath > timeElapsedForSegment;

        if (hasSurplusTime && surplusTimeIsOdd) {
            segmentDecision = "No";
        } else if (hasInsufficientTime) {
            segmentDecision = "Yes";
        }

        const nextOverallOutcome = (segmentDecision !== null) ? segmentDecision : overallOutcome;

        return {
            currentXPosition: destinationX,
            currentYPosition: destinationY,
            lastKnownTime: destinationTime,
            overallOutcome: nextOverallOutcome
        };
    }, { currentXPosition: 0, currentYPosition: 0, lastKnownTime: 0, overallOutcome: "Yes" });

    console.log(finalJourneyState.overallOutcome);
};

ProcessTravelPlans(require("fs").readFileSync("/dev/stdin", "utf8"));
