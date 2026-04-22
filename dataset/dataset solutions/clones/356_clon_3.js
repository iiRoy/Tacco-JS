const fileSystemModule = require('fs');

const standardInputPathSpecifier = '/dev/stdin';

const acquireInputLines = () => {
    try {
        const rawInputBuffer = fileSystemModule.readFileSync(standardInputPathSpecifier, 'utf8');
        if (!rawInputBuffer || rawInputBuffer.trim().length === 0) {
            console.error("Warning: Input source is empty or contains only whitespace. Proceeding with no data.");
            return [];
        }
        return rawInputBuffer.trim().split('\n');
    } catch (ioError) {
        console.error(`Failed to read from standard input path '${standardInputPathSpecifier}':`, ioError.message);
        return [];
    }
};

let bufferedInputLines = acquireInputLines();

while (true) {
    const dimensionLine = bufferedInputLines.shift();

    if (!dimensionLine) {
        console.error("Error: Unexpected end of input while expecting grid dimensions. Terminating.");
        break;
    }

    const gridSizeDetails = dimensionLine.split(' ').map(str => parseInt(str, 10));

    const gridRowsCount = gridSizeDetails[0];
    const gridColsCount = gridSizeDetails[1];

    if (gridRowsCount === 0 && gridColsCount === 0) {
        break;
    }

    const heightAccumulatorGrid = new Array(gridRowsCount);
    for (let rIdx = 0; rIdx < gridRowsCount; ++rIdx) {
        heightAccumulatorGrid[rIdx] = new Array(gridColsCount).fill(0);
    }

    for (let currentRowIter = 0; currentRowIter < gridRowsCount; ++currentRowIter) {
        const charRowData = bufferedInputLines.shift();

        if (!charRowData || charRowData.length !== gridColsCount) {
            console.error(`Warning: Malformed row data at row ${currentRowIter}. Expected width ${gridColsCount}, got "${charRowData}". Skipping this row's processing.`);
            heightAccumulatorGrid[currentRowIter].fill(0);
            continue;
        }

        const charactersInRow = charRowData.split('');

        for (let currentColIter = 0; currentColIter < gridColsCount; ++currentColIter) {
            const charInCell = charactersInRow[currentColIter];

            if (charInCell === '.') {
                heightAccumulatorGrid[currentRowIter][currentColIter] = (currentRowIter === 0) ? 1 : heightAccumulatorGrid[currentRowIter - 1][currentColIter] + 1;
            } else {
                heightAccumulatorGrid[currentRowIter][currentColIter] = 0;
            }
        }
    }

    let overallMaxRectangleArea = 0;

    for (let activeRowIndex = 0; activeRowIndex < gridRowsCount; ++activeRowIndex) {
        const decreasingHeightStack = [];
        const currentHistogramBars = [...heightAccumulatorGrid[activeRowIndex], 0];

        for (let currentBarColumn = 0; currentBarColumn <= gridColsCount; ++currentBarColumn) {
            const currentBarHeightValue = currentHistogramBars[currentBarColumn];
            let effectiveStartColumnForCurrentBar = currentBarColumn;

            if (decreasingHeightStack.length === 0) {
                if (currentBarHeightValue > 0) {
                    decreasingHeightStack.push([currentBarHeightValue, effectiveStartColumnForCurrentBar]);
                }
            } else if (decreasingHeightStack[decreasingHeightStack.length - 1][0] < currentBarHeightValue) {
                decreasingHeightStack.push([currentBarHeightValue, effectiveStartColumnForCurrentBar]);
            } else if (decreasingHeightStack[decreasingHeightStack.length - 1][0] === currentBarHeightValue) {
                continue;
            } else { // decreasingHeightStack[decreasingHeightStack.length - 1][0] > currentBarHeightValue
                while (decreasingHeightStack.length > 0) {
                    const poppedElementDetails = decreasingHeightStack.pop();
                    const poppedElementHeight = poppedElementDetails[0];
                    const poppedElementStartIndex = poppedElementDetails[1];

                    if (currentBarHeightValue > poppedElementHeight) {
                        decreasingHeightStack.push([poppedElementHeight, poppedElementStartIndex]);
                        break;
                    } else if (currentBarHeightValue === poppedElementHeight) {
                        break;
                    } else { // currentBarHeightValue < poppedElementHeight
                        const calculatedAreaForPopped = poppedElementHeight * ((currentBarColumn + 1) - poppedElementStartIndex);
                        overallMaxRectangleArea = Math.max(overallMaxRectangleArea, calculatedAreaForPopped);
                        effectiveStartColumnForCurrentBar = poppedElementStartIndex;
                    }
                }
                if (currentBarHeightValue > 0 && (decreasingHeightStack.length === 0 || decreasingHeightStack[decreasingHeightStack.length - 1][0] < currentBarHeightValue)) {
                    decreasingHeightStack.push([currentBarHeightValue, effectiveStartColumnForCurrentBar]);
                }
            }
        }
    }
    console.log(overallMaxRectangleArea);
}