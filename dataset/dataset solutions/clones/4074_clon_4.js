const processJourney = (rawInput) => {
    const journeyLines = rawInput.split('\n');
    const movementPlans = journeyLines.slice(1);

    const initialTravelState = {
        previousXCoordinate: 0,
        previousYCoordinate: 0,
        elapsedTimeAtPreviousPoint: 0,
        currentFeasibilityVerdict: "Yes"
    };

    const evaluateSegment = (accumulatedState, currentPlanString) => {
        const [targetMoment, targetXPosition, targetYPosition] = currentPlanString.split(' ').map(Number);

        const timeSpan = targetMoment - accumulatedState.elapsedTimeAtPreviousPoint;
        const horizontalMovement = Math.abs(targetXPosition - accumulatedState.previousXCoordinate);
        const verticalMovement = Math.abs(targetYPosition - accumulatedState.previousYCoordinate);
        const totalRequiredPath = horizontalMovement + verticalMovement;

        let segmentOutcome = accumulatedState.currentFeasibilityVerdict;

        if (totalRequiredPath > timeSpan) {
            segmentOutcome = "Yes";
        } else if (totalRequiredPath < timeSpan) {
            if ((timeSpan - totalRequiredPath) % 2 !== 0) {
                segmentOutcome = "No";
            }
        }

        return {
            previousXCoordinate: targetXPosition,
            previousYCoordinate: targetYPosition,
            elapsedTimeAtPreviousPoint: targetMoment,
            currentFeasibilityVerdict: segmentOutcome
        };
    };

    const finalJourneyState = movementPlans.reduce(evaluateSegment, initialTravelState);

    console.log(finalJourneyState.currentFeasibilityVerdict);
};

processJourney(require("node:fs").readFileSync(0, "utf8"));