function locateBeacon(rawInput) {
    const inputLines = rawInput.split("\n");
    const pointCount = parseInt(inputLines[0], 10);

    const sensorReadings = Array.from({ length: pointCount }, (_, idx) => {
        const parts = inputLines[idx + 1].split(" ");
        return {
            xCoord: parseInt(parts[0], 10),
            yCoord: parseInt(parts[1], 10),
            sensorHeight: parseInt(parts[2], 10)
        };
    });

    const allPossibleCenters = Array.from({ length: 101 }, (_, xVal) =>
        Array.from({ length: 101 }, (_, yVal) => ({ x: xVal, y: yVal }))
    ).flat();

    let finalResult = null;

    allPossibleCenters.some(potentialCenter => {
        const beaconAltitude = checkBeaconValidity(sensorReadings, potentialCenter.x, potentialCenter.y);
        if (beaconAltitude !== false) {
            finalResult = `${potentialCenter.x} ${potentialCenter.y} ${beaconAltitude}`;
            return true;
        }
        return false;
    });

    return finalResult;
}

function checkBeaconValidity(readings, candidateX, candidateY) {
    const initialBounds = {
        lowerBound: 1,
        upperBound: 1000000000,
        isConsistent: true
    };

    const evaluationResult = readings.reduce((accumulator, currentReading) => {
        if (!accumulator.isConsistent) {
            return accumulator;
        }

        const { xCoord, yCoord, sensorHeight } = currentReading;
        const calculatedAltitude = sensorHeight + Math.abs(candidateX - xCoord) + Math.abs(candidateY - yCoord);

        if (sensorHeight === 0) {
            accumulator.upperBound = Math.min(accumulator.upperBound, calculatedAltitude);
        } else {
            accumulator.upperBound = Math.min(accumulator.upperBound, calculatedAltitude);
            accumulator.lowerBound = Math.max(accumulator.lowerBound, calculatedAltitude);
        }

        if (accumulator.lowerBound > accumulator.upperBound) {
            accumulator.isConsistent = false;
        }
        return accumulator;
    }, initialBounds);

    if (!evaluationResult.isConsistent || evaluationResult.lowerBound !== evaluationResult.upperBound) {
        return false;
    }
    return evaluationResult.lowerBound;
}

console.log(locateBeacon(require("fs").readFileSync("/dev/stdin", "utf8")));
