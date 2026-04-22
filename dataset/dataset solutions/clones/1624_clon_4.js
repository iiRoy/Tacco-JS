function calculateThresholdExceeders(sourcePayload) {
    const textualEntries = sourcePayload.split('\n');

    const boundaryValue = Number(textualEntries[0].split(' ')[1]);

    const exceedingElements = textualEntries.slice(1).reduce((tally, currentEntry) => {
        const spatialData = currentEntry.split(' ').map(Number);
        const horizontalMeasure = spatialData[0];
        const verticalMeasure = spatialData[1];

        const radialExtent = Math.hypot(horizontalMeasure, verticalMeasure);

        if (Math.round(radialExtent) >= boundaryValue) {
            return tally + 1;
        } else {
            return tally;
        }
    }, 0);

    console.log(exceedingElements);
}

calculateThresholdExceeders(require("fs").readFileSync("/dev/stdin", "utf8"));