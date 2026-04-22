function generateBinaryPattern(sourceText) {
    const parsedNumbers = sourceText.split(/\s+/).map(Number);
    const [matrixHeight, matrixWidth, blockA, blockB] = parsedNumbers;

    const resultRows = [];

    const createFilledString = (character, count) => Array.from({ length: count }, () => character).join('');

    if (blockB === 0) {
        const fixedRowSegment = createFilledString('1', blockA) + createFilledString('0', matrixWidth - blockA);
        Array.from({ length: matrixHeight }).forEach(() => resultRows.push(fixedRowSegment));
    } else if (blockA === 0) {
        const allZerosLine = createFilledString('0', matrixWidth);
        const allOnesLine = createFilledString('1', matrixWidth);
        Array.from({ length: matrixHeight }, (_, index) => {
            resultRows.push(index < blockB ? allZerosLine : allOnesLine);
        });
    } else if (matrixHeight * blockA !== matrixWidth * blockB) {
        resultRows.push("No");
    } else {
        let cellDecisionFunction;

        if (matrixWidth % blockA === 0) {
            cellDecisionFunction = (rowIdx, colIdx) => {
                const horizontalShiftBlock = Math.floor(rowIdx / blockB);
                const startBoundary = horizontalShiftBlock * blockA;
                const endBoundary = (horizontalShiftBlock + 1) * blockA;
                return colIdx >= startBoundary && colIdx < endBoundary;
            };
        } else {
            cellDecisionFunction = (rowIdx, colIdx) => {
                const currentPatternStart = (rowIdx * blockA) % matrixWidth;
                const currentPatternEnd = ((rowIdx + 1) * blockA) % matrixWidth;
                
                if (currentPatternStart < currentPatternEnd) {
                    return colIdx >= currentPatternStart && colIdx < currentPatternEnd;
                } else {
                    return colIdx >= currentPatternStart || colIdx < currentPatternEnd;
                }
            };
        }

        Array.from({ length: matrixHeight }, (_, r) => {
            const currentRowString = Array.from({ length: matrixWidth }, (_, c) =>
                cellDecisionFunction(r, c) ? '1' : '0'
            ).join('');
            resultRows.push(currentRowString);
        });
    }

    console.log(resultRows.join('\n'));
}

generateBinaryPattern(require("fs").readFileSync("/dev/stdin", "utf8"));