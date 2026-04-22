const processSpatialData = (dataSource) => {
    const dataLines = dataSource.split("\n");

    const initialDimensionsParts = dataLines[0].split(" ");
    const initialRightBoundary = parseInt(initialDimensionsParts[0], 10);
    const initialTopBoundary = parseInt(initialDimensionsParts[1], 10);

    const initialRegion = {
        leftSide: 0,
        rightSide: initialRightBoundary,
        bottomSide: 0,
        topSide: initialTopBoundary
    };

    const boundaryModifiers = new Map();
    boundaryModifiers.set(1, (currentRegion, xValue) => ({ ...currentRegion, leftSide: Math.max(currentRegion.leftSide, xValue) }));
    boundaryModifiers.set(2, (currentRegion, xValue) => ({ ...currentRegion, rightSide: Math.min(currentRegion.rightSide, xValue) }));
    boundaryModifiers.set(3, (currentRegion, yValue) => ({ ...currentRegion, bottomSide: Math.max(currentRegion.bottomSide, yValue) }));
    boundaryModifiers.set(4, (currentRegion, yValue) => ({ ...currentRegion, topSide: Math.min(currentRegion.topSide, yValue) }));

    const finalRegion = dataLines.slice(1).reduce((currentRectState, lineEntry) => {
        if (!lineEntry.trim()) {
            return currentRectState;
        }

        const lineSegments = lineEntry.split(" ");
        const firstCoordValue = parseInt(lineSegments[0], 10);
        const secondCoordValue = parseInt(lineSegments[1], 10);
        const operationCode = parseInt(lineSegments[2], 10);

        const modifierFunction = boundaryModifiers.get(operationCode);

        if (modifierFunction) {
            const coordinateToUse = (operationCode === 1 || operationCode === 2) 
                                   ? firstCoordValue 
                                   : secondCoordValue;
            return modifierFunction(currentRectState, coordinateToUse);
        }
        return currentRectState;
    }, initialRegion);

    const effectiveWidth = finalRegion.rightSide - finalRegion.leftSide;
    const effectiveHeight = finalRegion.topSide - finalRegion.bottomSide;

    const finalArea = effectiveWidth * effectiveHeight;

    if (finalArea <= 0) {
        console.log(0);
    } else {
        console.log(finalArea);
    }
};

processSpatialData(require("fs").readFileSync("/dev/stdin", "utf8"));