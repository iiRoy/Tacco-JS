const sourceConfig = { input: '/dev/stdin', newline: '\n' };

function acquireRawData(cfg) {
    const rawContent = require('fs').readFileSync(cfg.input, 'ascii');
    return rawContent.split(cfg.newline);
}

function processRawData(allLines) {
    let currentLineIndex = 0;

    const dimensions = allLines[currentLineIndex++].split(' ').map(Number);
    const gridHeight = dimensions[0];
    const gridWidth = dimensions[1];

    const mainGridRaw = allLines.slice(currentLineIndex, currentLineIndex + gridHeight);
    currentLineIndex += gridHeight;

    const patternDims = allLines[currentLineIndex++].split(' ').map(Number);
    const patternRows = patternDims[0];
    const patternCols = patternDims[1];

    const searchPatternRaw = allLines.slice(currentLineIndex, currentLineIndex + patternRows);

    if (gridHeight < patternRows || gridWidth < patternCols) {
        process.exit();
    }

    const mainGrid = mainGridRaw.map(s => ({ val: BigInt('0b' + s), len: s.length }));
    const searchPattern = searchPatternRaw.map(s => ({ val: BigInt('0b' + s), len: s.length }));

    return { gridHeight, gridWidth, patternRows, patternCols, mainGrid, searchPattern };
}

function verifySubsegment(largerInt, largerLen, smallerInt, smallerLen, startingOffset) {
    if (startingOffset + smallerLen > largerLen) {
        return false;
    }
    
    const extractedSegment = (largerInt >> BigInt(largerLen - (startingOffset + smallerLen))) & ((1n << BigInt(smallerLen)) - 1n);
    
    return extractedSegment === smallerInt;
}

function performPatternSearch(dataBundle) {
    const { gridHeight, gridWidth, patternRows, patternCols, mainGrid, searchPattern } = dataBundle;

    const occurrenceTracker = new Map();

    for (let rOffset = 0; rOffset <= gridHeight - patternRows; rOffset++) {
        for (let cOffset = 0; cOffset <= gridWidth - patternCols; cOffset++) {
            let rowsMatchedAtPosition = 0;
            
            for (let pRowIdx = 0; pRowIdx < patternRows; pRowIdx++) {
                const fieldRow = mainGrid[rOffset + pRowIdx];
                const patternRow = searchPattern[pRowIdx];

                if (verifySubsegment(fieldRow.val, fieldRow.len, patternRow.val, patternRow.len, cOffset)) {
                    rowsMatchedAtPosition++;
                } else {
                    rowsMatchedAtPosition = 0; // Reset if a row doesn't match
                    break;
                }
            }

            if (rowsMatchedAtPosition === patternRows) {
                const resultKey = `${rOffset},${cOffset}`;
                occurrenceTracker.set(resultKey, true); // Just mark existence, value doesn't need to be a count
            }
        }
    }

    for (const [key, _] of occurrenceTracker.entries()) {
        const [rowCoordinate, colCoordinate] = key.split(',');
        console.log(`${rowCoordinate} ${colCoordinate}`);
    }
}

const rawInputContent = acquireRawData(sourceConfig);
const processedData = processRawData(rawInputContent);
performPatternSearch(processedData);