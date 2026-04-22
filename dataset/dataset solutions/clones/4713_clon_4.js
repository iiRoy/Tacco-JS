const retrieveAllInputData = async () => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    let acquiredData = '';
    for await (const dataChunk of process.stdin) {
        acquiredData += dataChunk;
    }
    return acquiredData.split('\n');
};

const performGridMatching = (mainGridDimension, patternGridDimension, mainMatrixContent, patternMatrixContent) => {
    const verticalOffsets = Array.from({ length: mainGridDimension - patternGridDimension + 1 }, (_, idx) => idx);
    const horizontalOffsets = Array.from({ length: mainGridDimension - patternGridDimension + 1 }, (_, idx) => idx);

    const isPatternFound = verticalOffsets.some(currentYOffset => {
        return horizontalOffsets.some(currentXOffset => {
            const rowsToCompare = Array.from({ length: patternGridDimension }, (_, rowIdx) => rowIdx);
            const allRowsMatch = rowsToCompare.every(patternRowIndex => {
                const mainGridSlice = mainMatrixContent[currentYOffset + patternRowIndex].slice(currentXOffset, currentXOffset + patternGridDimension);
                const patternRow = patternMatrixContent[patternRowIndex];
                return mainGridSlice === patternRow;
            });
            return allRowsMatch;
        });
    });

    return isPatternFound ? "Yes" : "No";
};

const initiateApplication = async () => {
    const allReceivedLines = await retrieveAllInputData();

    let currentLinePointer = 0;
    const obtainNextLineSegment = () => {
        if (currentLinePointer >= allReceivedLines.length) {
            return '';
        }
        return allReceivedLines[currentLinePointer++];
    };

    const dimensionParameters = obtainNextLineSegment().split(" ").map(Number);
    const largeGridSize = dimensionParameters[0];
    const smallGridSize = dimensionParameters[1];

    const largeGridCollection = Array.from({ length: largeGridSize }, () => obtainNextLineSegment().substring(0, largeGridSize));

    const smallGridCollection = Array.from({ length: smallGridSize }, () => obtainNextLineSegment().substring(0, smallGridSize));

    const finalResult = performGridMatching(largeGridSize, smallGridSize, largeGridCollection, smallGridCollection);

    console.log(finalResult);
    process.exit(0);
};

initiateApplication();