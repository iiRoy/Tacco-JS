const replicateStructure = (sourceObject) => JSON.parse(JSON.stringify(sourceObject));

const adjustReference = (pathPoints) => {
    const freshPoints = replicateStructure(pathPoints);
    if (freshPoints.length === 0) return [];
    const anchorX = freshPoints[0].coordX;
    const anchorY = freshPoints[0].coordY;
    return freshPoints.map(point => ({
        coordX: point.coordX - anchorX,
        coordY: point.coordY - anchorY
    }));
};

const spinShape = (pathPoints) => {
    return pathPoints.map(point => ({
        coordX: -point.coordY,
        coordY: point.coordX
    }));
};

const verifyEquality = (pathA, pathB) => {
    if (pathA.length !== pathB.length) return false;
    return pathA.every((point, index) =>
        point.coordX === pathB[index].coordX && point.coordY === pathB[index].coordY
    );
};

((rawContent) => {
    const inputLines = rawContent.replace(/\r/g, '').split("\n");
    let lineCursor = 0;
    const getNextLine = () => inputLines[lineCursor++];
    const parseInteger = (str) => parseInt(str, 10);

    while (true) {
        let sectionCount = parseInteger(getNextLine()) + 1;
        if (sectionCount === 1) {
            break;
        }

        const currentShapeCollection = [];

        for (let idxA = 0; idxA < sectionCount - 1; idxA++) {
            let segmentCount = parseInteger(getNextLine()) - 1;

            const initialLine = getNextLine().split(' ').map(parseInteger);
            const anchorX = initialLine[0];
            const anchorY = initialLine[1];

            const segmentSequence = [{ coordX: 0, coordY: 0 }];
            for (let idxB = 0; idxB < segmentCount; idxB++) {
                const subLine = getNextLine().split(' ').map(parseInteger);
                segmentSequence.push({
                    coordX: subLine[0] - anchorX,
                    coordY: subLine[1] - anchorY
                });
            }
            currentShapeCollection.push(segmentSequence);
        }

        const referencePattern = currentShapeCollection.shift();
        const invertedReferencePattern = adjustReference(replicateStructure(referencePattern).reverse());

        for (let idxA = 0; idxA < currentShapeCollection.length; idxA++) {
            let currentPolyline = replicateStructure(currentShapeCollection[idxA]);
            let matchDiscovered = false;

            for (let rotationCounter = 0; rotationCounter < 4; rotationCounter++) {
                if (verifyEquality(currentPolyline, referencePattern) || verifyEquality(currentPolyline, invertedReferencePattern)) {
                    console.log(idxA + 1);
                    matchDiscovered = true;
                    break;
                }
                currentPolyline = spinShape(currentPolyline);
            }
        }
        console.log("+++++");
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));