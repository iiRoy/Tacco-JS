class DataStreamParser {
    constructor(sourceData) {
        this.source = sourceData;
        this.pointer = 0;
    }

    _advancePastWhitespace() {
        while (this.pointer < this.source.length && (this.source[this.pointer] === ' ' || this.source[this.pointer] === '\n' || this.source[this.pointer] === '\r')) {
            this.pointer++;
        }
    }

    _extractSegment() {
        this._advancePastWhitespace();
        const startPoint = this.pointer;
        while (this.pointer < this.source.length && !(this.source[this.pointer] === ' ' || this.source[this.pointer] === '\n' || this.source[this.pointer] === '\r')) {
            this.pointer++;
        }
        return this.source.substring(startPoint, this.pointer);
    }

    retrieveNumericValue() {
        return Number(this._extractSegment());
    }

    retrieveTextValue() {
        return this._extractSegment();
    }

    retrieveMultipleNumericValues(quantity) {
        const numericSet = [];
        for (let idx = 0; idx < quantity; idx++) {
            numericSet.push(this.retrieveNumericValue());
        }
        return numericSet;
    }
}

function calculateOptimalTraversal() {
    const dataInputReader = new DataStreamParser(require("fs").readFileSync("/dev/stdin","utf8"));

    const displacementVectors = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // [dy, dx] for Up, Right, Down, Left
    const totalDirections = displacementVectors.length;

    const [gridHeight, gridWidth, maxStepLength] = dataInputReader.retrieveMultipleNumericValues(3);
    const [startRow, startCol, endRow, endCol] = dataInputReader.retrieveMultipleNumericValues(4);

    const blockedCells = new Set();
    for (let rowIdx = 1; rowIdx <= gridHeight; rowIdx++) {
        const cellLine = dataInputReader.retrieveTextValue();
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) { // 0-indexed for string character
            if (cellLine[colIdx] === '@') {
                blockedCells.add(`${rowIdx},${colIdx + 1}`); // Store as 1-indexed (row, column)
            }
        }
    }

    const cellMinCosts = new Map(); // Map<string "row,col", number cost>
    cellMinCosts.set(`${startRow},${startCol}`, 0);

    let currentIterationCells = new Set([`${startRow},${startCol}`]);
    let nextIterationCells = new Set();
    let currentCost = 0;

    while (currentIterationCells.size > 0) {
        nextIterationCells.clear();
        for (const currentCellKey of currentIterationCells) {
            const [yCurrent, xCurrent] = currentCellKey.split(',').map(Number);

            for (let dirIndex = 0; dirIndex < totalDirections; dirIndex++) {
                const [dY, dX] = displacementVectors[dirIndex];
                let nextY = yCurrent;
                let nextX = xCurrent;

                for (let stepCount = 0; stepCount < maxStepLength; stepCount++) {
                    nextY += dY;
                    nextX += dX;

                    const nextCellKey = `${nextY},${nextX}`;

                    // Check if cell is outside grid boundaries (1-indexed)
                    if (nextY < 1 || nextY > gridHeight || nextX < 1 || nextX > gridWidth) {
                        break; // Out of bounds
                    }
                    // Check if cell is an obstacle
                    if (blockedCells.has(nextCellKey)) {
                        break; // Hit an obstacle
                    }

                    const existingPathCost = cellMinCosts.get(nextCellKey);

                    // If a path to this cell already exists with cost <= currentCost,
                    // it means we've either processed it or it's on the current level.
                    // In either case, we stop extending this line segment.
                    if (existingPathCost !== undefined && existingPathCost <= currentCost) {
                        break;
                    }

                    // If cell is unvisited or a longer path was found previously
                    if (existingPathCost === undefined || existingPathCost > currentCost + 1) {
                        cellMinCosts.set(nextCellKey, currentCost + 1);
                        nextIterationCells.add(nextCellKey);
                    }
                    // If existingPathCost === currentCost + 1, it means it's already in nextIterationCells
                    // from another path at this level. No need to update cost or re-add, but continue exploring
                    // along this line segment.
                }
            }
        }
        currentIterationCells = new Set(nextIterationCells); // Prepare for next level
        currentCost++;
    }

    const finalPathCost = cellMinCosts.get(`${endRow},${endCol}`);
    return finalPathCost === undefined ? -1 : finalPathCost;
}

const outcome = calculateOptimalTraversal();
if (outcome !== undefined) {
    console.log(String(outcome));
}