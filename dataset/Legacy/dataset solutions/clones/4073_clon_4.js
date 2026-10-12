function ProcessInputData(inputString) {
    const lineSegments = inputString.split("\n");

    const totalRecords = Number(lineSegments.shift());

    const travelLog = lineSegments.slice(0, totalRecords).map(entryText => {
        const numericCoordinates = entryText.split(" ").map(Number);
        return {
            eventTime: numericCoordinates[0],
            xPosition: numericCoordinates[1],
            yPosition: numericCoordinates[2]
        };
    });

    let hasAnyValidSegment = false;

    if (totalRecords > 1) {
        hasAnyValidSegment = travelLog.slice(1).some((currentLocation, indexInSlice) => {
            const priorLocation = travelLog[indexInSlice];

            const elapsedDuration = currentLocation.eventTime - priorLocation.eventTime;

            const pathLength = Math.abs(
                (currentLocation.xPosition + currentLocation.yPosition) -
                (priorLocation.xPosition + priorLocation.yPosition)
            );

            const durationSufficient = pathLength <= elapsedDuration;
            const parityMatch = (pathLength % 2) === (elapsedDuration % 2);

            return durationSufficient && parityMatch;
        });
    }

    const outcomeMessage = hasAnyValidSegment ? "YES" : "NO";

    console.log(outcomeMessage);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
