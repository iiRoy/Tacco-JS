const rotatePointsClockwise = (pointSet) =>
    pointSet.map(([px, py]) => [-py, px]);

const applyCanonicalRotation = (pointSet) => {
    let currentPoints = pointSet;
    if (currentPoints.length > 1) {
        if (currentPoints[1][1] > 0) {
            currentPoints = rotatePointsClockwise(currentPoints);
        }
        if (currentPoints[1][0] < 0) {
            currentPoints = rotatePointsClockwise(currentPoints);
        }
        if (currentPoints[1][1] < 0) {
            currentPoints = rotatePointsClockwise(currentPoints);
        }
    }
    return currentPoints;
};

const obtainCanonicalForm = (rawPoints) => {
    if (rawPoints.length === 0) return [];

    const [originX, originY] = rawPoints[0];
    const translatedPoints = rawPoints.map(([px, py]) => [px - originX, py - originY]);

    return applyCanonicalRotation(translatedPoints);
};

const obtainInvertedCanonicalForm = (originalCanonicalPoints) => {
    if (originalCanonicalPoints.length === 0) return [];

    const lastPointOfOriginal = originalCanonicalPoints[originalCanonicalPoints.length - 1];

    const reversedPoints = originalCanonicalPoints.slice().reverse();

    const invertedTranslatedPoints = reversedPoints.map(([px, py]) => [
        px - lastPointOfOriginal[0],
        py - lastPointOfOriginal[1],
    ]);

    return applyCanonicalRotation(invertedTranslatedPoints);
};

const areShapesIdentical = (shapeA, shapeB) => {
    if (shapeA.length !== shapeB.length) return false;
    return shapeA.every((point, idx) =>
        point[0] === shapeB[idx][0] && point[1] === shapeB[idx][1]
    );
};

const createInputProcessor = (rawInputContent) => {
    const lines = rawInputContent.split("\n");
    let currentLineIndex = 0;

    const getNextLine = () => {
        if (currentLineIndex >= lines.length) {
            throw new Error("End of input reached unexpectedly.");
        }
        return lines[currentLineIndex++];
    };

    const parseInteger = () => parseInt(getNextLine(), 10);

    const parseCoordinatePair = () => {
        const [xStr, yStr] = getNextLine().split(" ");
        return [parseInt(xStr, 10), parseInt(yStr, 10)];
    };

    return { parseInteger, parseCoordinatePair };
};

const processShapeData = (rawInput) => {
    const inputReader = createInputProcessor(rawInput);

    while (true) {
        const numberOfShapes = inputReader.parseInteger();
        if (numberOfShapes === 0) break;

        const allCanonicalShapes = [];

        for (let sIdx = 0; sIdx <= numberOfShapes; sIdx++) {
            const pointCount = inputReader.parseInteger();
            const currentRawPoints = [];
            for (let pIdx = 0; pIdx < pointCount; pIdx++) {
                currentRawPoints.push(inputReader.parseCoordinatePair());
            }
            allCanonicalShapes.push(obtainCanonicalForm(currentRawPoints));
        }

        const primaryShape = allCanonicalShapes[0];

        for (let sIdx = 1; sIdx <= numberOfShapes; sIdx++) {
            const currentShape = allCanonicalShapes[sIdx];
            
            if (areShapesIdentical(primaryShape, currentShape)) {
                console.log(sIdx);
            } else {
                const invertedShape = obtainInvertedCanonicalForm(currentShape);
                if (areShapesIdentical(primaryShape, invertedShape)) {
                    console.log(sIdx);
                }
            }
        }
        console.log("+++++");
    }
};

processShapeData(require("fs").readFileSync("/dev/stdin", "utf8"));
