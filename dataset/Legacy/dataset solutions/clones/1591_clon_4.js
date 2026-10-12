class InputProcessor {
    constructor(rawInput) {
        this.tokens = rawInput.split(/ |\n/);
        this.currentIndex = 0;
    }

    readInteger() {
        return Number(this.tokens[this.currentIndex++]);
    }

    readBigInteger() {
        return BigInt(this.tokens[this.currentIndex++]);
    }

    readString() {
        return this.tokens[this.currentIndex++];
    }

    readIntegerArray(count) {
        const slice = this.tokens.slice(this.currentIndex, this.currentIndex + count);
        this.currentIndex += count;
        return slice.map(Number);
    }

    readMatrix(height, width) {
        const matrix = [];
        for (let i = 0; i < height; i++) {
            matrix.push(this.readIntegerArray(width));
        }
        return matrix;
    }
}

function createMultiDimensionalArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDim = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDim }, () =>
        createMultiDimensionalArray(initialValue, ...remainingDims)
    );
}

function processSolution() {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputReader = new InputProcessor(rawInput);

    const dimensionSize = inputReader.readInteger();
    let scoreGrid = createMultiDimensionalArray(-1, dimensionSize, dimensionSize);
    let globalMaxScore = 0;
    let skippedTripletsCount = 0;

    const initialPair = inputReader.readIntegerArray(2).sort((a, b) => a - b).map(val => val - 1);
    scoreGrid[initialPair[0]][initialPair[1]] = 0;

    function* generateUpdateTuples(currentN, val0, val1, val2) {
        yield [val0, val0, val1, val2];

        if (val0 !== val1) {
            yield [val1, val1, val0, val2];
        } else {
            for (let j = 0; j < val0; j++) yield [j, val0, j, val2];
            for (let j = val0 + 1; j < val2; j++) yield [val0, j, j, val2];
            for (let j = val2; j < currentN; j++) yield [val0, j, val2, j];
        }

        if (val1 !== val2) {
            yield [val2, val2, val0, val1];
        } else {
            for (let j = 0; j < val0; j++) yield [j, val1, j, val0];
            for (let j = val0; j < val2; j++) yield [j, val2, val0, j];
            for (let j = val2 + 1; j < currentN; j++) yield [val2, j, val0, j];
        }
    }

    Array.from({ length: dimensionSize - 1 }).forEach(() => {
        const currentTriplet = inputReader.readIntegerArray(3).sort((a, b) => a - b).map(val => val - 1);

        if (currentTriplet[0] === currentTriplet[2]) {
            skippedTripletsCount++;
            return;
        }

        const pendingUpdates = new Map();

        for (const [sourceT, sourceU, targetV, targetW] of generateUpdateTuples(
            dimensionSize,
            currentTriplet[0],
            currentTriplet[1],
            currentTriplet[2]
        )) {
            const currentSourceScore = scoreGrid[sourceT][sourceU];
            if (currentSourceScore === -1) continue;

            const potentialNewScore = Math.max(scoreGrid[targetV][targetW], currentSourceScore + 1);
            const updateKey = `${targetV},${targetW}`;

            pendingUpdates.set(updateKey, Math.max(pendingUpdates.get(updateKey) || -1, potentialNewScore));
            globalMaxScore = Math.max(globalMaxScore, potentialNewScore);
        }

        for (const [key, value] of pendingUpdates.entries()) {
            const [row, col] = key.split(',').map(Number);
            scoreGrid[row][col] = Math.max(scoreGrid[row][col], value);
        }
    });

    const finalTargetIndex = inputReader.readInteger() - 1;
    const finalCellScore = scoreGrid[finalTargetIndex][finalTargetIndex];
    if (finalCellScore !== -1) {
        globalMaxScore = Math.max(globalMaxScore, finalCellScore + 1);
    }

    return globalMaxScore + skippedTripletsCount;
}

const finalResult = processSolution();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}
