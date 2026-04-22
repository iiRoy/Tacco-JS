const rawInputData = process.stdin.readFileSync(0, "utf8").trim();
const tokenCollection = rawInputData.split(/\s+/);
let tokenCursor = 0;

function fetchNextNumeric() {
    return Number(tokenCollection[tokenCursor++]);
}

function fetchNumericSequence(count) {
    const sequence = [];
    for (let index = 0; index < count; index++) {
        sequence.push(Number(tokenCollection[tokenCursor++]));
    }
    return sequence;
}

function createMultiDimensionalMatrix(initialVal, ...dims) {
    if (dims.length === 0) {
        return initialVal;
    }
    const currentDimSize = dims[0];
    const remainingDims = dims.slice(1);
    return Array.from({ length: currentDimSize }, () => createMultiDimensionalMatrix(initialVal, ...remainingDims));
}

function computeFinalScore() {
    const initialGridValue = Number.MIN_SAFE_INTEGER;
    const gridDimensionParam = fetchNextNumeric();
    let scoreMatrix = createMultiDimensionalMatrix(initialGridValue, gridDimensionParam + 1, gridDimensionParam + 1);
    let cumulativeBonus = 0;

    const initialElementPair = fetchNumericSequence(2).sort((valA, valB) => valA - valB);
    scoreMatrix[0][0] = 0;
    scoreMatrix[0][initialElementPair[0]] = 0;
    scoreMatrix[0][initialElementPair[1]] = 0;
    scoreMatrix[initialElementPair[0]][initialElementPair[1]] = 0;

    Array.from({ length: gridDimensionParam - 1 }).forEach(() => {
        const currentTriple = fetchNumericSequence(3).sort((valA, valB) => valA - valB);
        const [elementX, elementY, elementZ] = currentTriple;

        const { updatesBatch, shouldAddBonus } = processingUnit(scoreMatrix, gridDimensionParam, elementX, elementY, elementZ);

        if (shouldAddBonus) {
            cumulativeBonus++;
        }

        updatesBatch.forEach(upd => {
            if (scoreMatrix[upd.r][upd.c] < upd.v) {
                scoreMatrix[upd.r][upd.c] = upd.v;
            }
        });
    });

    const finalLookupIndex = fetchNextNumeric();
    return Math.max(scoreMatrix[0][0], scoreMatrix[finalLookupIndex][finalLookupIndex] + 1) + cumulativeBonus;
}

function generateCopyOperation(currentMatrix, targetRow, targetCol, sourceRow, sourceCol) {
    if (currentMatrix[targetRow][targetCol] < currentMatrix[sourceRow][sourceCol]) {
        return { r: targetRow, c: targetCol, v: currentMatrix[sourceRow][sourceCol] };
    }
    return null;
}

function generateIncrementOperation(currentMatrix, targetRow, targetCol, sourceRow, sourceCol) {
    if (currentMatrix[targetRow][targetCol] < currentMatrix[sourceRow][sourceCol] + 1) {
        return { r: targetRow, c: targetCol, v: currentMatrix[sourceRow][sourceCol] + 1 };
    }
    return null;
}

function produceUpdatesForSingleElement(currentMatrix, matrixLimit, currentVal) {
    const localUpdates = [];
    let potentialOperation;

    potentialOperation = generateIncrementOperation(currentMatrix, 0, 0, currentVal, currentVal);
    if (potentialOperation) localUpdates.push(potentialOperation);

    Array.from({ length: currentVal }).forEach((_, k) => {
        potentialOperation = generateCopyOperation(currentMatrix, k, currentVal, 0, k);
        if (potentialOperation) localUpdates.push(potentialOperation);
    });

    Array.from({ length: matrixLimit - currentVal + 1 }).forEach((_, k) => {
        const index = currentVal + k;
        potentialOperation = generateCopyOperation(currentMatrix, currentVal, index, 0, index);
        if (potentialOperation) localUpdates.push(potentialOperation);
    });

    return localUpdates;
}

function produceUpdatesForTwoElements(currentMatrix, matrixLimit, valA, valB) {
    const localUpdates = [];
    let potentialOperation;

    potentialOperation = generateCopyOperation(currentMatrix, valA, valB, 0, 0);
    if (potentialOperation) localUpdates.push(potentialOperation);

    potentialOperation = generateIncrementOperation(currentMatrix, 0, valB, valA, valA);
    if (potentialOperation) localUpdates.push(potentialOperation);

    if (valA < valB) {
        potentialOperation = generateIncrementOperation(currentMatrix, 0, valA, valB, valB);
        if (potentialOperation) localUpdates.push(potentialOperation);
    } else {
        Array.from({ length: valA }).forEach((_, k) => {
            potentialOperation = generateIncrementOperation(currentMatrix, 0, k, k, valA);
            if (potentialOperation) localUpdates.push(potentialOperation);
        });
        Array.from({ length: matrixLimit - valA + 1 }).forEach((_, k) => {
            const index = valA + k;
            potentialOperation = generateIncrementOperation(currentMatrix, 0, index, valA, index);
            if (potentialOperation) localUpdates.push(potentialOperation);
        });
    }
    return localUpdates;
}

function produceUpdatesForThreeElements(currentMatrix, matrixLimit, valA, valB, valC) {
    const localUpdates = [];
    let potentialOperation;

    potentialOperation = generateIncrementOperation(currentMatrix, valB, valC, valA, valA);
    if (potentialOperation) localUpdates.push(potentialOperation);

    if (valA < valB) {
        potentialOperation = generateIncrementOperation(currentMatrix, valA, valC, valB, valB);
        if (potentialOperation) localUpdates.push(potentialOperation);
        if (valB < valC) {
            potentialOperation = generateIncrementOperation(currentMatrix, valA, valB, valC, valC);
            if (potentialOperation) localUpdates.push(potentialOperation);
        } else {
            Array.from({ length: valA }).forEach((_, k) => {
                potentialOperation = generateIncrementOperation(currentMatrix, k, valC, k, valA);
                if (potentialOperation) localUpdates.push(potentialOperation);
            });
            Array.from({ length: valC - valA }).forEach((_, k) => {
                const index = valA + k;
                potentialOperation = generateIncrementOperation(currentMatrix, valA, index, index, valC);
                if (potentialOperation) localUpdates.push(potentialOperation);
            });
            Array.from({ length: matrixLimit - valC + 1 }).forEach((_, k) => {
                const index = valC + k;
                potentialOperation = generateIncrementOperation(currentMatrix, valA, index, valC, index);
                if (potentialOperation) localUpdates.push(potentialOperation);
            });
        }
    } else {
        potentialOperation = generateIncrementOperation(currentMatrix, valA, valA, valC, valC);
        if (potentialOperation) localUpdates.push(potentialOperation);
        Array.from({ length: valA }).forEach((_, k) => {
            potentialOperation = generateIncrementOperation(currentMatrix, k, valC, k, valA);
            if (potentialOperation) localUpdates.push(potentialOperation);
        });
        Array.from({ length: valC - valA }).forEach((_, k) => {
            const index = valA + k;
            potentialOperation = generateIncrementOperation(currentMatrix, index, valC, valA, index);
            if (potentialOperation) localUpdates.push(potentialOperation);
        });
        Array.from({ length: matrixLimit - valC + 1 }).forEach((_, k) => {
            const index = valC + k;
            potentialOperation = generateIncrementOperation(currentMatrix, valC, index, valA, index);
            if (potentialOperation) localUpdates.push(potentialOperation);
        });
    }
    return localUpdates;
}

function processingUnit(currentMatrix, matrixLimit, prm1, prm2, prm3) {
    if (prm1 === prm3) {
        return { updatesBatch: [], shouldAddBonus: true };
    }

    let allCollectedUpdates = [];

    allCollectedUpdates = allCollectedUpdates.concat(produceUpdatesForSingleElement(currentMatrix, matrixLimit, prm1));
    if (prm1 < prm2) allCollectedUpdates = allCollectedUpdates.concat(produceUpdatesForSingleElement(currentMatrix, matrixLimit, prm2));
    if (prm2 < prm3) allCollectedUpdates = allCollectedUpdates.concat(produceUpdatesForSingleElement(currentMatrix, matrixLimit, prm3));

    allCollectedUpdates = allCollectedUpdates.concat(produceUpdatesForTwoElements(currentMatrix, matrixLimit, prm1, prm2));
    if (prm2 < prm3) allCollectedUpdates = allCollectedUpdates.concat(produceUpdatesForTwoElements(currentMatrix, matrixLimit, prm1, prm3));
    if (prm1 < prm2) allCollectedUpdates = allCollectedUpdates.concat(produceUpdatesForTwoElements(currentMatrix, matrixLimit, prm2, prm3));

    allCollectedUpdates = allCollectedUpdates.concat(produceUpdatesForThreeElements(currentMatrix, matrixLimit, prm1, prm2, prm3));

    return { updatesBatch: allCollectedUpdates.filter(u => u !== null), shouldAddBonus: false };
}

const finalOutcome = computeFinalScore();
if (finalOutcome !== undefined) console.log(String(finalOutcome));