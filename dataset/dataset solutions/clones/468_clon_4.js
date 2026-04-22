const grabInput = require('fs').readFileSync('/dev/stdin', 'utf8');

const processInputLines = (remainingSegments) => {
    if (remainingSegments.length === 0) return;

    let currentSegmentList = [...remainingSegments];

    const extractNumbers = (lineText) => lineText.split(" ").map(Number);

    const [canvasDimension, patternDimension] = extractNumbers(currentSegmentList.shift());

    if (canvasDimension === 0 && patternDimension === 0) return;

    const canvasGrid = Array.from({ length: canvasDimension }, () => extractNumbers(currentSegmentList.shift()));
    const initialPatternGrid = Array.from({ length: patternDimension }, () => extractNumbers(currentSegmentList.shift()));

    const performClockwiseRotation = (sourceGrid) => {
        const gridSide = sourceGrid.length;
        const lastIndex = gridSide - 1;

        return Array.from({ length: gridSide }, (_, targetRow) =>
            Array.from({ length: gridSide }, (_, targetCol) => {
                const originalRow = lastIndex - targetCol;
                const originalCol = targetRow;
                return sourceGrid[originalRow][originalCol];
            })
        );
    };

    const generateAllOrientations = (baseGrid, numRotations) => {
        let allOrientedGrids = [baseGrid];
        let currentOrientation = baseGrid;
        for (let k = 1; k < numRotations; k++) {
            currentOrientation = performClockwiseRotation(currentOrientation);
            allOrientedGrids.push(currentOrientation);
        }
        return allOrientedGrids;
    };

    const rotatedPatternVariants = generateAllOrientations(initialPatternGrid, 4);

    const evaluateMatch = (largeGrid, smallPattern, smallDim, rOffset, cOffset) => {
        let firstNonWildcardLocation = null; // Stores [relative_row, relative_col] within smallPattern

        // Create a flat list of all [row, col] pairs for the small pattern
        const patternCoordinates = Array.from({ length: smallDim }, (_, r) =>
            Array.from({ length: smallDim }, (_, c) => [r, c])
        ).flat();

        const allCellsMatch = patternCoordinates.every(([pRow, pCol]) => {
            const patternCellContent = smallPattern[pRow][pCol];

            if (patternCellContent === -1) { // Wildcard, always matches
                return true;
            }

            // If it's a non-wildcard and we haven't recorded the first one yet
            if (firstNonWildcardLocation === null) {
                firstNonWildcardLocation = [pRow, pCol];
            }

            // Check against the corresponding cell in the large grid
            return largeGrid[rOffset + pRow][cOffset + pCol] === patternCellContent;
        });

        if (allCellsMatch && firstNonWildcardLocation !== null) {
            // Return absolute coordinates on the large grid
            return [rOffset + firstNonWildcardLocation[0], cOffset + firstNonWildcardLocation[1]];
        } else {
            return false; // No match, or pattern was all wildcards
        }
    };

    let optimalPosition = [101, 101]; // [1-indexed row, 1-indexed col]

    // Generate all possible top-left offsets for the pattern within the canvas
    const potentialOffsets = [];
    for (let rIdx = 0; rIdx <= canvasDimension - patternDimension; rIdx++) {
        for (let cIdx = 0; cIdx <= canvasDimension - patternDimension; cIdx++) {
            potentialOffsets.push([rIdx, cIdx]);
        }
    }

    rotatedPatternVariants.forEach((currentVariant) => {
        potentialOffsets.forEach(([rowOffset, colOffset]) => {
            const matchResult = evaluateMatch(canvasGrid, currentVariant, patternDimension, rowOffset, colOffset);

            if (matchResult !== false) {
                const [absoluteRow0, absoluteCol0] = matchResult; // 0-indexed
                const finalRow1 = absoluteRow0 + 1; // 1-indexed for output
                const finalCol1 = absoluteCol0 + 1; // 1-indexed for output

                // Update optimalPosition based on row-priority then column-priority
                if (finalRow1 < optimalPosition[0] || (finalRow1 === optimalPosition[0] && finalCol1 < optimalPosition[1])) {
                    optimalPosition = [finalRow1, finalCol1];
                }
            }
        });
    });

    const outputMessage = (optimalPosition[0] === 101 && optimalPosition[1] === 101) ?
        "NA" : `${optimalPosition[1]} ${optimalPosition[0]}`; // Output format: 1-indexed col then 1-indexed row

    console.log(outputMessage);

    processInputLines(currentSegmentList); // Recursive call for next input set
};

processInputLines(grabInput.trim().split("\n"));