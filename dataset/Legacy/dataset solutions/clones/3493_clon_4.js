function parseInputData(rawText) {
    const lineSegments = rawText.split('\n');
    const dataPointCount = Number(lineSegments[0]);
    const observationPoints = [];

    for (let i = 1; i <= dataPointCount; i++) {
        const coordinateParts = lineSegments[i].split(' ').map(Number);
        observationPoints.push({
            xCoord: coordinateParts[0],
            yCoord: coordinateParts[1],
            heightVal: coordinateParts[2]
        });
    }
    return observationPoints;
}

function verifyPeakCandidate(allObservations, centerX, centerY) {
    let derivedPeakHeight = null;

    const consistencyCheck = allObservations.every(observation => {
        if (observation.heightVal !== 0) {
            const currentPointCalculatedHeight = observation.heightVal + Math.abs(centerX - observation.xCoord) + Math.abs(centerY - observation.yCoord);
            if (derivedPeakHeight === null) {
                derivedPeakHeight = currentPointCalculatedHeight;
            } else if (derivedPeakHeight !== currentPointCalculatedHeight) {
                return false; // Inconsistent height found
            }
        }
        return true; // This observation is consistent or has zero height
    });

    if (!consistencyCheck) {
        return false; // An inconsistency was detected
    }

    // If all observations are consistent, return the derived height (or 0 if no non-zero height observations)
    return derivedPeakHeight === null ? 0 : derivedPeakHeight;
}

function locatePeak(sourceData) {
    const parsedObservations = parseInputData(sourceData);

    // Generate all possible (X, Y) center coordinates from 0 to 100
    const potentialCenters = Array.from({ length: 101 }, (_, xIndex) =>
        Array.from({ length: 101 }, (_, yIndex) => ({ x: xIndex, y: yIndex }))
    ).flat(); // Flatten to a single array of {x, y} objects

    // Iterate through potential centers to find the first valid one
    for (const center of potentialCenters) {
        const finalHeight = verifyPeakCandidate(parsedObservations, center.x, center.y);
        if (finalHeight !== false) { // 'false' indicates an invalid candidate
            return `${center.x} ${center.y} ${finalHeight}`;
        }
    }

    // This part should ideally not be reached given problem constraints
    return "No valid peak found";
}

console.log(locatePeak(require("fs").readFileSync("/dev/stdin", "utf8")));
