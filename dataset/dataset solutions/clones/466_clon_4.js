const rotateGrid = (originalGrid) => {
    const dimension = originalGrid.length;
    return Array.from({ length: dimension }, (_, newRow) =>
        Array.from({ length: dimension }, (_, newCol) =>
            originalGrid[dimension - 1 - newCol][newRow]
        )
    );
};

const commenceAnalysis = () => {
    const parseNumericLine = (textLine) => textLine.split(/\s+/).map(Number);

    let processedLines = globalInputData.split('\n');

    while (true) {
        const dimensionsLine = parseNumericLine(processedLines.shift());
        const gridDim = dimensionsLine[0];
        const patternDim = dimensionsLine[1];

        if (gridDim === 0 && patternDim === 0) break;

        const mainCanvas = Array.from({ length: gridDim }, () =>
            parseNumericLine(processedLines.shift())
        );
        const initialPattern = Array.from({ length: patternDim }, () =>
            parseNumericLine(processedLines.shift())
        );

        const patternOrientations = Array.from({ length: 4 }).reduce((accumulator, _, index) => {
            const currentPattern = index === 0 ? initialPattern : rotateGrid(accumulator[index - 1]);
            accumulator.push(currentPattern);
            return accumulator;
        }, []);

        const evaluateMatch = (currentOrientation, currentGrid, currentPatternDimension, currentOffsetRow, currentOffsetCol) => {
            let currentFragmentMatches = true;
            let firstMatchColumn = 0;
            let firstMatchRow = 0;

            const patternCoordinates = Array.from({ length: currentPatternDimension }, (_, r) =>
                Array.from({ length: currentPatternDimension }, (_, c) => ({ r, c }))
            ).flat();

            const allElementsMatched = patternCoordinates.every(coord => {
                const { r: fragmentRowIndex, c: fragmentColIndex } = coord;
                const patternValue = currentOrientation[fragmentRowIndex][fragmentColIndex];

                if (patternValue === -1) return true;

                const canvasValue = currentGrid[currentOffsetRow + fragmentRowIndex][currentOffsetCol + fragmentColIndex];

                if (patternValue !== canvasValue) {
                    currentFragmentMatches = false;
                    return false;
                }

                if (firstMatchColumn === 0 && firstMatchRow === 0) {
                    firstMatchColumn = currentOffsetCol + fragmentColIndex + 1;
                    firstMatchRow = currentOffsetRow + fragmentRowIndex + 1;
                }
                return true;
            });

            return {
                matchStatus: currentFragmentMatches && allElementsMatched,
                matchX: firstMatchColumn,
                matchY: firstMatchRow
            };
        };

        const allMatchOutcomes = Array.from({ length: gridDim - patternDim + 1 }, (_, rowOffset) =>
            Array.from({ length: gridDim - patternDim + 1 }, (_, colOffset) =>
                patternOrientations.map(orientation =>
                    evaluateMatch(
                        orientation,
                        mainCanvas,
                        patternDim,
                        rowOffset,
                        colOffset
                    )
                )
            )
        ).flat(2);

        const successfulMatches = allMatchOutcomes
            .filter(outcome => outcome.matchStatus)
            .map(outcome => ({ col: outcome.matchX, row: outcome.matchY }));

        let minimumCol = Infinity;
        let minimumRow = Infinity;

        if (successfulMatches.length > 0) {
            const finalBestResult = successfulMatches.reduce((minResult, currentResult) => {
                if (currentResult.col < minResult.col) {
                    return currentResult;
                }
                if (currentResult.col === minResult.col &&
                    currentResult.row < minResult.row) {
                    return currentResult;
                }
                return minResult;
            }, { col: Infinity, row: Infinity });

            minimumCol = finalBestResult.col;
            minimumRow = finalBestResult.row;
        }

        if (minimumCol !== Infinity && minimumRow !== Infinity) {
            console.log(`${minimumCol} ${minimumRow}`);
        } else {
            console.log('NA');
        }
    }
};

let globalInputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
    globalInputData += chunk;
});
process.stdin.on('end', () => {
    commenceAnalysis();
});