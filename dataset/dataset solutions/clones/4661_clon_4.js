function Main(rawData) {
    const dataLines = rawData.split("\n");

    const [firstDimensionStr, secondDimensionStr] = dataLines[0].split(" ");
    const firstDimension = parseInt(firstDimensionStr, 10);
    const secondDimension = parseInt(secondDimensionStr, 10);

    const primaryCoordinates = dataLines.slice(1, 1 + firstDimension).map(lineSegment => {
        const [xComponent, yComponent] = lineSegment.split(" ");
        return [parseInt(xComponent, 10), parseInt(yComponent, 10)];
    });

    const secondaryCoordinates = dataLines.slice(1 + firstDimension, 1 + firstDimension + secondDimension).map(lineSegment => {
        const [xComponent, yComponent] = lineSegment.split(" ");
        return [parseInt(xComponent, 10), parseInt(yComponent, 10)];
    });

    primaryCoordinates.forEach(currentPrimaryPoint => {
        const closestReference = secondaryCoordinates.reduce((accumulator, currentSecondaryPoint, secondaryIndex) => {
            const currentMetric = Math.abs(currentPrimaryPoint[0] - currentSecondaryPoint[0]) +
                                  Math.abs(currentPrimaryPoint[1] - currentSecondaryPoint[1]);

            if (accumulator.metricValue === null || currentMetric < accumulator.metricValue) {
                return {
                    metricValue: currentMetric,
                    identifier: secondaryIndex + 1
                };
            } else {
                return accumulator;
            }
        }, { metricValue: null, identifier: null });

        console.log(closestReference.identifier);
    });
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
