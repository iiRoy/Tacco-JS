const transformInputIntoStructures = (sourcePayload) => {
    const linesOfData = sourcePayload.split('\n');
    const [rowsDimension, colsDimension] = linesOfData[0].split(' ').map(Number);

    const hashCoordinatesCollection = [];
    const dotCoordinateKeys = new Set(); // Store as "y,x" string for quick lookup

    for (let rowIdx = 0; rowIdx < rowsDimension; rowIdx++) {
        const currentRowContent = linesOfData[rowIdx + 1];
        for (let colIdx = 0; colIdx < colsDimension; colIdx++) {
            const charAtCell = currentRowContent[colIdx];
            if (charAtCell === '#') {
                hashCoordinatesCollection.push([rowIdx, colIdx]);
            } else if (charAtCell === '.') {
                dotCoordinateKeys.add(`${rowIdx},${colIdx}`);
            }
        }
    }
    return {
        matrixHeight: rowsDimension,
        matrixWidth: colsDimension,
        hashPositions: hashCoordinatesCollection,
        dotKeys: dotCoordinateKeys
    };
};

const determineNeighborConnections = (yPos, xPos, maxH, maxW) => {
    const relativeDisplacements = [
        [-1, 0], // North
        [1, 0],  // South
        [0, -1], // West
        [0, 1]   // East
    ];

    return relativeDisplacements.map(([dY, dX]) => [yPos + dY, xPos + dX])
                                .filter(([nY, nX]) =>
                                    nY >= 0 && nY < maxH && nX >= 0 && nX < maxW
                                );
};

const executeAnalysis = (incomingContent) => {
    const gridMetrics = transformInputIntoStructures(incomingContent);

    const allHashPositions = gridMetrics.hashPositions;
    const allDotKeys = gridMetrics.dotKeys;
    const totalMatrixHeight = gridMetrics.matrixHeight;
    const totalMatrixWidth = gridMetrics.matrixWidth;

    const totalLinkCount = allHashPositions.reduce((currentTally, [hashY, hashX]) => {
        const potentialLinks = determineNeighborConnections(hashY, hashX, totalMatrixHeight, totalMatrixWidth);
        const validLinks = potentialLinks.filter(([linkY, linkX]) =>
            allDotKeys.has(`${linkY},${linkX}`)
        );
        return currentTally + validLinks.length;
    }, 0);

    return totalLinkCount;
};

const commenceProcessing = (fileData) => {
    const finalResultValue = executeAnalysis(fileData);
    console.log(finalResultValue);
};

commenceProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));