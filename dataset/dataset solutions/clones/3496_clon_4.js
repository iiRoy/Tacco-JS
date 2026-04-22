function processInputData(sourceText) {
    const lineSegments = sourceText.split("\n");
    const countEntries = Number(lineSegments[0]);

    const parsedMeasurements = Array.from({ length: countEntries }, (_, idx) => {
        const parts = lineSegments[idx + 1].split(" ").map(Number);
        return { pointX: parts[0], pointY: parts[1], heightValue: parts[2] };
    });

    const candidateXCoords = Array.from({ length: 101 }, (_, i) => i);
    const candidateYCoords = Array.from({ length: 101 }, (_, i) => i);

    const finalSolution = candidateXCoords.flatMap(testX =>
        candidateYCoords.map(testY => {
            const computedAltitude = evaluateLocation(testX, testY, parsedMeasurements);
            return computedAltitude !== null ? { x: testX, y: testY, h: computedAltitude } : null;
        })
    ).find(result => result !== null);

    if (finalSolution) {
        return `${finalSolution.x} ${finalSolution.y} ${finalSolution.h}`;
    }
    return "";
}

function evaluateLocation(testX, testY, measurementPoints) {
    let computedAltitude = measurementPoints.reduce((currentAltitude, point) => {
        if (point.heightValue > 0) {
            const derivedAltitudeFromPoint = point.heightValue + Math.abs(testX - point.pointX) + Math.abs(testY - point.pointY);
            if (currentAltitude === null) {
                return derivedAltitudeFromPoint;
            } else if (currentAltitude !== derivedAltitudeFromPoint) {
                return NaN;
            }
        }
        return currentAltitude;
    }, null);

    if (computedAltitude === NaN) {
        return null;
    }

    if (computedAltitude === null) {
        computedAltitude = 1;
    }

    const allConditionsMet = measurementPoints.every(point => {
        const gridDistance = Math.abs(testX - point.pointX) + Math.abs(testY - point.pointY);
        if (point.heightValue > 0) {
            return computedAltitude === point.heightValue + gridDistance;
        } else {
            return computedAltitude <= gridDistance;
        }
    });

    return allConditionsMet ? computedAltitude : null;
}