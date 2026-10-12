(function (sourceText) {
    const lineSegments = sourceText.replace(/\r/g, '').split('\n');
    let currentLinePointer = 0;

    const retrieveNextGridBlock = () => {
        const dimensionValue = parseInt(lineSegments[currentLinePointer++], 10);
        if (dimensionValue === 0) {
            return null;
        }
        const gridContent = Array.from({ length: dimensionValue }, () => lineSegments[currentLinePointer++]);
        return { dimension: dimensionValue, gridData: gridContent };
    };

    const checkClearSquare = (columnStart, rowStart, squareSideLength, gridContent, gridDimension) => {
        if (rowStart + squareSideLength > gridDimension || columnStart + squareSideLength > gridDimension) {
            return false;
        }
        return Array.from({ length: squareSideLength }, (_, rowOffset) => rowOffset + rowStart)
            .every(currentRowIndex =>
                Array.from({ length: squareSideLength }, (_, colOffset) => colOffset + columnStart)
                    .every(currentColIndex => gridContent[currentRowIndex][currentColIndex] === '.')
            );
    };

    let currentProcessingBlock;
    while ((currentProcessingBlock = retrieveNextGridBlock()) !== null) {
        const gridDimensionValue = currentProcessingBlock.dimension;
        const currentGridData = currentProcessingBlock.gridData;

        let traversalState = {
            maximumSquareDimensionMinusOne: 1,
            currentTraversalRow: 0,
            currentTraversalColumn: 0
        };

        while (traversalState.currentTraversalRow < gridDimensionValue) {
            if (traversalState.currentTraversalColumn < gridDimensionValue) {
                if (checkClearSquare(
                    traversalState.currentTraversalColumn,
                    traversalState.currentTraversalRow,
                    traversalState.maximumSquareDimensionMinusOne + 1,
                    currentGridData,
                    gridDimensionValue
                )) {
                    traversalState.maximumSquareDimensionMinusOne++;
                } else {
                    traversalState.currentTraversalColumn += traversalState.maximumSquareDimensionMinusOne;
                }
            } else {
                traversalState.currentTraversalRow++;
                traversalState.currentTraversalColumn = 0;
            }
        }
        console.log(traversalState.maximumSquareDimensionMinusOne);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
