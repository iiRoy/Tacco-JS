const sourceSystem = require('fs');

function dispersePattern(initialRow, initialColumn, targetSymbol, currentArea, areaWidth, areaHeight) {
    const propagationQueue = [];
    propagationQueue.push([initialRow, initialColumn]);

    const rowDirections = [0, 0, -1, 1];
    const colDirections = [-1, 1, 0, 0];

    const obtainSymbol = (r, c, width, data) => data[r * width + c];
    const placeSymbol = (r, c, width, data, val) => { data[r * width + c] = val; };

    while (propagationQueue.length > 0) {
        const [currentRow, currentCol] = propagationQueue.shift();

        if (obtainSymbol(currentRow, currentCol, areaWidth, currentArea) !== targetSymbol) {
            continue;
        }

        placeSymbol(currentRow, currentCol, areaWidth, currentArea, '0'); // Mark as visited/cleared

        for (let idx = 0; idx < 4; idx++) {
            const nextRow = currentRow + rowDirections[idx];
            const nextCol = currentCol + colDirections[idx];

            const isValidRow = nextRow >= 0 && nextRow < areaHeight;
            const isValidCol = nextCol >= 0 && nextCol < areaWidth;

            if (isValidRow && isValidCol) {
                if (obtainSymbol(nextRow, nextCol, areaWidth, currentArea) === targetSymbol) {
                    propagationQueue.push([nextRow, nextCol]);
                }
            }
        }
    }
}

const rawTransmission = sourceSystem.readFileSync('/dev/stdin', 'utf8');
const transmissionLines = rawTransmission.trim().split('\n');
let transmissionPointer = 0;

const retrieveLine = () => transmissionLines[transmissionPointer++];

while (true) {
    const layoutDimensions = retrieveLine().split(' ').map(Number);
    const gridHeight = layoutDimensions[0];
    const gridWidth = layoutDimensions[1];

    if (gridHeight === 0 && gridWidth === 0) {
        break;
    }

    const currentSurface = [];
    for (let r = 0; r < gridHeight; r++) {
        const lineCharacters = retrieveLine().split('');
        currentSurface.push(...lineCharacters);
    }

    let distinctShapes = 0;
    const targetSymbols = new Set(['@', '#', '*']);

    const obtainSymbol = (r, c, width, data) => data[r * width + c];

    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            const currentGlyph = obtainSymbol(r, c, gridWidth, currentSurface);
            if (targetSymbols.has(currentGlyph)) {
                distinctShapes++;
                dispersePattern(r, c, currentGlyph, currentSurface, gridWidth, gridHeight);
            }
        }
    }
    console.log(distinctShapes);
}