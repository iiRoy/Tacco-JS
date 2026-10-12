function checkTravelSegmentValidity(previousTime, previousX, previousY, nextTime, nextX, nextY) {
    const deltaX = Math.abs(nextX - previousX);
    const deltaY = Math.abs(nextY - previousY);
    const timeDifference = nextTime - previousTime;

    const manhattanDistance = deltaX + deltaY;
    const parityConditionMet = (nextTime % 2 === manhattanDistance % 2);

    const isPathFeasible = (manhattanDistance <= timeDifference);
    const isParityConsistent = parityConditionMet;

    return isPathFeasible && isParityConsistent;
}

function processInput(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineData = inputLines[0].split(" ").map(coordinate => Number(coordinate));
    const numEntries = firstLineData[0];

    const travelPlans = inputLines.slice(1).map(line => line.split(" ").map(value => Number(value)));

    let currentGlobalTime = 0;
    let currentGlobalX = 0;
    let currentGlobalY = 0;
    let overallFeasibilityStatus = true;

    for (const segment of travelPlans) {
        const targetSegmentTime = segment[0];
        const targetSegmentX = segment[1];
        const targetSegmentY = segment[2];

        const segmentIsValid = checkTravelSegmentValidity(
            currentGlobalTime,
            currentGlobalX,
            currentGlobalY,
            targetSegmentTime,
            targetSegmentX,
            targetSegmentY
        );

        if (!segmentIsValid) {
            overallFeasibilityStatus = false;
        }

        currentGlobalTime = targetSegmentTime;
        currentGlobalX = targetSegmentX;
        currentGlobalY = targetSegmentY;
    }

    const finalOutcomeMessage = overallFeasibilityStatus ? "Yes" : "No";
    console.log(finalOutcomeMessage);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
