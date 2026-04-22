function determineFeasibility(rawChronicle) {
    const chronicleSegments = rawChronicle.split("\n");
    const travelPoints = chronicleSegments.slice(1).map(segmentLine => {
        const coordinateValues = segmentLine.split(" ").map(Number);
        return {
            targetMoment: coordinateValues[0],
            targetXCoord: coordinateValues[1],
            targetYCoord: coordinateValues[2]
        };
    });

    const journeyState = {
        isAchievable: true,
        previousMoment: 0,
        previousXCoord: 0,
        previousYCoord: 0
    };

    const finalOutcome = travelPoints.reduce((currentProgress, nextDestination) => {
        if (!currentProgress.isAchievable) {
            return currentProgress;
        }

        const timeSpan = nextDestination.targetMoment - currentProgress.previousMoment;
        const xDisplacement = Math.abs(nextDestination.targetXCoord - currentProgress.previousXCoord);
        const yDisplacement = Math.abs(nextDestination.targetYCoord - currentProgress.previousYCoord);

        const totalDisplacement = xDisplacement + yDisplacement;

        const segmentValid =
            (totalDisplacement <= timeSpan) &&
            ((nextDestination.targetMoment % 2) === (totalDisplacement % 2));

        return {
            isAchievable: currentProgress.isAchievable && segmentValid,
            previousMoment: nextDestination.targetMoment,
            previousXCoord: nextDestination.targetXCoord,
            previousYCoord: nextDestination.targetYCoord
        };
    }, journeyState);

    const finalDeclaration = finalOutcome.isAchievable ? "Aye" : "Nay";
    console.log(finalDeclaration);
}

determineFeasibility(require('fs').readFileSync('/dev/stdin', 'utf8'));