const createDataSource = (rawInputText) => {
    const dataLines = rawInputText.trim().split('\n');
    let lineCursor = 0;
    let activeLineSegments = [];
    let activeLineNumber = -1;

    const advanceToNextLine = () => {
        if (lineCursor >= dataLines.length) {
            return false;
        }
        activeLineNumber = lineCursor;
        activeLineSegments = dataLines[lineCursor].split(' ');
        lineCursor++;
        return true;
    };

    const retrieveScalar = (asRawString) => {
        if (activeLineSegments.length === 0) {
            if (!advanceToNextLine()) {
                throw new Error("Input exhausted during scalar retrieval.");
            }
        }
        if (activeLineNumber === lineCursor - 1 && activeLineSegments.length === dataLines[activeLineNumber].split(' ').length) {
            // First time accessing this line for scalar tokens, reverse for right-to-left pop
            activeLineSegments.reverse();
        }

        const extractedSegment = activeLineSegments.pop();
        if (extractedSegment === undefined) {
             throw new Error("Failed to extract scalar from line.");
        }
        return asRawString ? extractedSegment : Number(extractedSegment);
    };

    const retrieveFullLine = (asRawString) => {
        if (!advanceToNextLine()) {
            throw new Error("Input exhausted during line retrieval.");
        }
        const segments = activeLineSegments;
        activeLineSegments = []; // Consume the line
        return asRawString ? segments : segments.map(Number);
    };

    const retrieveMatrix = (rowsToRead, asRawString) => {
        const resultMatrix = [];
        for (let i = 0; i < rowsToRead; i++) {
            if (!advanceToNextLine()) {
                throw new Error("Input exhausted during matrix retrieval.");
            }
            const rowSegments = activeLineSegments;
            activeLineSegments = []; // Consume the line
            resultMatrix.push(asRawString ? rowSegments : rowSegments.map(Number));
        }
        return resultMatrix;
    };

    const retrieveVectorList = (elementsToRead, asRawString) => {
        const resultList = [];
        for (let i = 0; i < elementsToRead; i++) {
            if (!advanceToNextLine()) {
                throw new Error("Input exhausted during vector list retrieval.");
            }
            const element = activeLineSegments[0]; // Assuming one token per line
            activeLineSegments = []; // Consume the line
            resultList.push(asRawString ? element : Number(element));
        }
        return resultList;
    };

    // Initial line load
    advanceToNextLine();

    return {
        getNumericValue: (rawMode) => retrieveScalar(rawMode),
        getLineValues: (rawMode) => retrieveFullLine(rawMode),
        getNumericGrid: (numRows, rawMode) => retrieveMatrix(numRows, rawMode),
        getNumericSeries: (numElements, rawMode) => retrieveVectorList(numElements, rawMode)
    };
};

const computeBearing = (xComponent, yComponent) => {
    if (xComponent === 0 && yComponent === 0) {
        return 0; // Should be filtered out before this, but for completeness.
    }
    const angleInRadians = Math.atan2(yComponent, xComponent);
    let angleInDegrees = angleInRadians * 180 / Math.PI;
    if (angleInDegrees < 0) {
        angleInDegrees += 360;
    }
    return Math.round(angleInDegrees * 10000000) / 10000000;
};

const processVectorData = (inputHandler) => {
    const initialVectorCount = inputHandler.getNumericValue();
    const temporaryVectorList = Array.from({ length: initialVectorCount })
        .map(() => ({
            x: inputHandler.getNumericValue(),
            y: inputHandler.getNumericValue()
        }))
        .filter(vec => vec.x !== 0 || vec.y !== 0);

    const vectorsWithOrientations = temporaryVectorList
        .map(vec => ({ ...vec, orientation: computeBearing(vec.x, vec.y) }))
        .sort((vecA, vecB) => vecA.orientation - vecB.orientation);

    return vectorsWithOrientations.concat(vectorsWithOrientations);
};

const calculateMaxVectorMagnitude = (allVectorElements) => {
    if (allVectorElements.length === 0) {
        return 0;
    }

    const totalElements = allVectorElements.length;

    const processingState = {
        currentXAccumulator: 0,
        currentYAccumulator: 0,
        windowEndPointer: 0,
        maximumSquaredDistance: 0
    };

    const finalState = allVectorElements.reduce((accumulator, startVector, currentIndex) => {
        let { currentXAccumulator, currentYAccumulator, windowEndPointer, maximumSquaredDistance } = accumulator;

        while (windowEndPointer < currentIndex + totalElements && windowEndPointer < allVectorElements.length) {
            const candidateVector = allVectorElements[windowEndPointer];
            const prospectiveX = currentXAccumulator + candidateVector.x;
            const prospectiveY = currentYAccumulator + candidateVector.y;

            const existingMagnitudeSquared = currentXAccumulator * currentXAccumulator + currentYAccumulator * currentYAccumulator;
            const prospectiveMagnitudeSquared = prospectiveX * prospectiveX + prospectiveY * prospectiveY;

            if (existingMagnitudeSquared >= prospectiveMagnitudeSquared) {
                break; // Adding this vector doesn't increase magnitude
            }

            currentXAccumulator = prospectiveX;
            currentYAccumulator = prospectiveY;
            windowEndPointer++;
        }

        const currentWindowResultSquared = currentXAccumulator * currentXAccumulator + currentYAccumulator * currentYAccumulator;
        maximumSquaredDistance = Math.max(maximumSquaredDistance, currentWindowResultSquared);

        // Prepare for the next iteration: slide the window by removing the current startVector
        currentXAccumulator -= startVector.x;
        currentYAccumulator -= startVector.y;

        return { currentXAccumulator, currentYAccumulator, windowEndPointer, maximumSquaredDistance };
    }, processingState);

    return Math.sqrt(finalState.maximumSquaredDistance);
};

const dataInputHandler = createDataSource(require("fs").readFileSync("/dev/stdin","utf8"));

const processedVectorCollection = processVectorData(dataInputHandler);

console.log(calculateMaxVectorMagnitude(processedVectorCollection));