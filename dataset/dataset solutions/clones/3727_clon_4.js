const extractConfiguration = (inputString) => {
    const stringSections = inputString.trim().split('\n');
    const numberList = stringSections[0].split(' ').map(Number);
    return {
        fullQuantity: numberList[0],
        scopeSize: numberList[1],
        stateSequence: stringSections[1].split(' ')
    };
};

const mapItemLocations = (processedConfig) => {
    const indicatorSpot = processedConfig.stateSequence.indexOf("1");
    const overallLength = processedConfig.stateSequence.length;
    return {
        ...processedConfig,
        markerLocation: indicatorSpot,
        leftExtent: indicatorSpot,
        rightExtent: overallLength - 1 - indicatorSpot
    };
};

const evaluatePlacementStrategy = (locationDetails) => {
    const { scopeSize, leftExtent, rightExtent } = locationDetails;
    const effectiveStepDistance = scopeSize - 1;

    const computeRequiredSegments = (segmentCount, incrementValue) => {
        if (segmentCount <= 0) return 0;
        return Math.floor((segmentCount + incrementValue - 1) / incrementValue);
    };

    let calculatedSegments = computeRequiredSegments(leftExtent, effectiveStepDistance) +
                             computeRequiredSegments(rightExtent, effectiveStepDistance);

    if (calculatedSegments > 0 && (leftExtent + rightExtent) <= scopeSize) {
        calculatedSegments -= 1;
    }

    return calculatedSegments;
};

const determineTileCount = (externalInput) => {
    const parsedSettings = extractConfiguration(externalInput);
    const analyzedPositions = mapItemLocations(parsedSettings);
    const finalOutcome = evaluatePlacementStrategy(analyzedPositions);
    console.log(finalOutcome);
};

determineTileCount(require("fs").readFileSync("/dev/stdin", "utf8"));