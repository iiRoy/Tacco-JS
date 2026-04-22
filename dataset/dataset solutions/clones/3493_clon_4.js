function processDataInput(inputStringContent) {
    const sourceLines = inputStringContent.trim().split('\n');
    const countOfReadings = parseInt(sourceLines[0], 10);
    const observationRegistry = [];
    for (let i = 1; i <= countOfReadings; i++) {
        const currentParts = sourceLines[i].split(' ').map(Number);
        observationRegistry.push({ coordX: currentParts[0], coordY: currentParts[1], observedH: currentParts[2] });
    }
    return observationRegistry;
}

function assessPotentialLocation(allObservations, targetX, targetY) {
    const derivedHeights = allObservations
        .filter(entry => entry.observedH !== 0)
        .map(entry => entry.observedH + Math.abs(targetX - entry.coordX) + Math.abs(targetY - entry.coordY));

    if (derivedHeights.length === 0) {
        return 0;
    }

    const uniqueDerivedHeights = new Set(derivedHeights);
    return uniqueDerivedHeights.size === 1 ? uniqueDerivedHeights.values().next().value : null;
}

function pinpointEmitter(incomingDataSource) {
    const sensorReadings = processDataInput(incomingDataSource);

    const result = Array.from({ length: 101 }, (_, xCoordinate) => xCoordinate)
        .reduce((foundResult, currentX) => {
            if (foundResult) return foundResult;

            return Array.from({ length: 101 }, (_, yCoordinate) => yCoordinate)
                .reduce((innerFoundResult, currentY) => {
                    if (innerFoundResult) return innerFoundResult;

                    const calculatedHeightValue = assessPotentialLocation(sensorReadings, currentX, currentY);
                    if (calculatedHeightValue !== null) {
                        return `${currentX} ${currentY} ${calculatedHeightValue}`;
                    }
                    return null;
                }, null);
        }, null);

    return result;
}