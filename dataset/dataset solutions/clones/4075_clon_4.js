const isFeasibleStep = (durationPeriod, xDisplacement, yDisplacement) => {
    const totalDisplacement = xDisplacement + yDisplacement;
    return (durationPeriod >= totalDisplacement) && ((durationPeriod & 1) === (totalDisplacement & 1));
};

const validatePathSegments = (journeyPoints) => {
    const fullTrajectory = [[0, 0, 0], ...journeyPoints];

    return fullTrajectory.every((currentPointData, pointIndex) => {
        if (pointIndex === 0) {
            return true;
        }

        const previousPointData = fullTrajectory[pointIndex - 1];

        const timeDelta = currentPointData[0] - previousPointData[0];
        const deltaX = Math.abs(currentPointData[1] - previousPointData[1]);
        const deltaY = Math.abs(currentPointData[2] - previousPointData[2]);

        return isFeasibleStep(timeDelta, deltaX, deltaY);
    });
};

function executeJourneyValidation(rawData) {
    const allLines = rawData.trim().split(/\r?\n/);
    const destinationEntries = allLines.slice(1).map(entryLine => {
        const [timeVal, xVal, yVal] = entryLine.split(' ').map(Number);
        return {
            timestamp: timeVal,
            positionX: xVal,
            positionY: yVal
        };
    });

    const structuredPathData = destinationEntries.map(entry => [entry.timestamp, entry.positionX, entry.positionY]);

    const finalOutcome = validatePathSegments(structuredPathData);

    const formatResult = (status) => status ? 'Yes' : 'No';
    console.log(formatResult(finalOutcome));
}

executeJourneyValidation(require("fs").readFileSync("/dev/stdin", "utf8"));