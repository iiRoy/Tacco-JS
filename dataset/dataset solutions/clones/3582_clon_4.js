process.stdin.resume();
process.stdin.setEncoding('utf8');
var globalInputBuffer = '';
process.stdin.on('data', function(dataChunk) {
    globalInputBuffer += dataChunk;
});
process.stdin.on('end', function() {
    executeProcessing(globalInputBuffer.split(/\r?\n/));
});

function processGridData(gridLines) {
    const initialGridSnapshot = gridLines.join('\n');

    let gridRepresentation = new Map();
    let currentMaxRow = -1, currentMaxCol = -1;

    gridLines.forEach((lineContent, rowIdx) => {
        lineContent.split('').forEach((charElement, colIdx) => {
            gridRepresentation.set(`${rowIdx}_${colIdx}`, charElement);
            currentMaxRow = Math.max(currentMaxRow, rowIdx);
            currentMaxCol = Math.max(currentMaxCol, colIdx);
        });
    });

    let rowModificationOccurred = false;
    let activeRows = new Set();

    for (let r = 0; r <= currentMaxRow; r++) {
        let rowContainsHash = false;
        for (let c = 0; c <= currentMaxCol; c++) {
            if (gridRepresentation.get(`${r}_${c}`) === '#') {
                rowContainsHash = true;
                break;
            }
        }
        if (rowContainsHash) {
            activeRows.add(r);
        }
    }

    if (activeRows.size !== currentMaxRow + 1) {
        rowModificationOccurred = true;
    }

    let tempGridForRows = new Map();
    let newRowIndex = 0;
    let newMaxRowAfterRowTrim = -1;
    Array.from(activeRows).sort((a, b) => a - b).forEach(originalRowIdx => {
        for (let c = 0; c <= currentMaxCol; c++) {
            tempGridForRows.set(`${newRowIndex}_${c}`, gridRepresentation.get(`${originalRowIdx}_${c}`));
        }
        newMaxRowAfterRowTrim = newRowIndex;
        newRowIndex++;
    });
    gridRepresentation = tempGridForRows;
    currentMaxRow = newMaxRowAfterRowTrim;

    if (currentMaxRow < 0) {
        gridLines.length = 0;
        return [rowModificationOccurred, ''];
    }

    let columnModificationOccurred = false;
    let currentColumnPointer = 0;
    let effectiveMaxColumn = currentMaxCol;

    while (currentColumnPointer <= effectiveMaxColumn) {
        let columnIsEntirelyEmpty = true;
        for (let r = 0; r <= currentMaxRow; r++) {
            if (gridRepresentation.get(`${r}_${currentColumnPointer}`) === '#') {
                columnIsEntirelyEmpty = false;
                break;
            }
        }

        if (columnIsEntirelyEmpty) {
            columnModificationOccurred = true;
            for (let r = 0; r <= currentMaxRow; r++) {
                for (let c = currentColumnPointer; c < effectiveMaxColumn; c++) {
                    gridRepresentation.set(`${r}_${c}`, gridRepresentation.get(`${r}_${c + 1}`));
                }
                gridRepresentation.delete(`${r}_${effectiveMaxColumn}`);
            }
            effectiveMaxColumn--;
        } else {
            currentColumnPointer++;
        }
    }

    let finalProcessedLines = [];
    if (currentMaxRow >= 0 && effectiveMaxColumn >= 0) {
        for (let r = 0; r <= currentMaxRow; r++) {
            let rowCharacterArray = [];
            for (let c = 0; c <= effectiveMaxColumn; c++) {
                rowCharacterArray.push(gridRepresentation.get(`${r}_${c}`));
            }
            finalProcessedLines.push(rowCharacterArray.join(''));
        }
    }

    const finalGridResult = finalProcessedLines.join('\n');
    const overallChangeDetected = (finalGridResult !== initialGridSnapshot);

    gridLines.length = 0;
    gridLines.push(...finalProcessedLines);

    return [overallChangeDetected, finalGridResult];
}

function executeProcessing(initialInputLines) {
    initialInputLines.shift();

    let processingOutcome;
    let currentGridState = initialInputLines;

    processingOutcome = processGridData(currentGridState);

    while (processingOutcome[0]) {
        processingOutcome = processGridData(currentGridState);
    }

    console.log(processingOutcome[1]);
}
