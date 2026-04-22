const adjustCircularPosition = (value, circleSize) => {
    let normalized = value % circleSize;
    return normalized < 0 ? normalized + circleSize : normalized;
};

const calculateRelativePasses = (entityA, entityB, circleSize, duration) => {
    if (entityA.travelMode === entityB.travelMode) {
        return 0;
    }

    let potentialRelativeDistance = duration * 2;

    let clockwiseCoord, counterClockwiseCoord;
    if (entityA.travelMode === 1) {
        clockwiseCoord = entityA.initialCoord;
        counterClockwiseCoord = entityB.initialCoord;
    } else {
        clockwiseCoord = entityB.initialCoord;
        counterClockwiseCoord = entityA.initialCoord;
    }

    let initialGap;
    if (counterClockwiseCoord >= clockwiseCoord) {
        initialGap = counterClockwiseCoord - clockwiseCoord;
    } else {
        initialGap = circleSize - clockwiseCoord + counterClockwiseCoord;
    }

    potentialRelativeDistance -= initialGap;

    let interactions = 0;
    if (potentialRelativeDistance >= 0) {
        interactions++;
        interactions += Math.floor(potentialRelativeDistance / circleSize);
    }
    return interactions;
};

const performAntSimulation = (dataContent) => {
    const dataSegments = dataContent.split('\n');

    const [mainParamsLine, ...entityCoordLines] = dataSegments;
    const [numEntitiesStr, circuitLengthStr, elapsedTimeStr] = mainParamsLine.split(' ');
    const numEntities = parseInt(numEntitiesStr, 10);
    const circuitLength = parseInt(circuitLengthStr, 10);
    const elapsedTime = parseInt(elapsedTimeStr, 10);

    const entityRecords = entityCoordLines.slice(0, numEntities).map((line, idx) => {
        const [coordStr, modeStr] = line.split(' ');
        return {
            entityId: idx,
            initialCoord: parseInt(coordStr, 10),
            travelMode: parseInt(modeStr, 10)
        };
    });

    const futurePositions = entityRecords.map(entity => {
        const directionFactor = (entity.travelMode === 1) ? 1 : -1;
        const rawFutureCoord = entity.initialCoord + elapsedTime * directionFactor;
        return adjustCircularPosition(rawFutureCoord, circuitLength);
    });

    const referenceEntity = entityRecords[0];
    const totalDisplacementRaw = entityRecords.slice(1).reduce((accumulator, currentEntity) => {
        return accumulator + calculateRelativePasses(referenceEntity, currentEntity, circuitLength, elapsedTime);
    }, 0);

    let finalRefEntityShift = totalDisplacementRaw % numEntities;
    if (referenceEntity.travelMode === 2) {
        finalRefEntityShift = (numEntities - finalRefEntityShift) % numEntities;
    }

    const orderedFutureLocations = [...futurePositions].sort((locA, locB) => locA - locB);

    const refEntityFuturePos = futurePositions[0];
    const refEntityTravelMode = entityRecords[0].travelMode;

    const indicesMatchingRefPos = orderedFutureLocations
        .map((loc, idx) => (loc === refEntityFuturePos) ? idx : -1)
        .filter(idx => idx !== -1);

    let baseOutputIndex;
    if (indicesMatchingRefPos.length === 0) {
        baseOutputIndex = 0; 
    } else if (indicesMatchingRefPos.length === 1) {
        baseOutputIndex = indicesMatchingRefPos[0];
    } else {
        if (refEntityTravelMode === 1) {
            baseOutputIndex = Math.max(...indicesMatchingRefPos);
        } else {
            baseOutputIndex = Math.min(...indicesMatchingRefPos);
        }
    }

    let adjustedInitialIdx = (numEntities + baseOutputIndex - finalRefEntityShift) % numEntities;

    const finalSequence = Array.from({ length: numEntities }, (_, i) => {
        const currentPrintIndex = (adjustedInitialIdx + i) % numEntities;
        return orderedFutureLocations[currentPrintIndex];
    });

    return finalSequence.join('\n');
};

console.log(performAntSimulation(require('fs').readFileSync('/dev/stdin', 'utf8')));