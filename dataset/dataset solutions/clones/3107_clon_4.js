const fs = require('fs');

const acquireInputContent = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile("/dev/stdin", "utf8", (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
};

function* generateWordTokens(sourceText) {
    const tokenRegex = /\S+/g;
    for (const match of sourceText.matchAll(tokenRegex)) {
        yield match[0];
    }
}

function* parseCustomTokens(sourceText) {
    let currentPosition = 0;
    let tokenStart = -1;
    const textLength = sourceText.length;

    while (currentPosition <= textLength) {
        const char = sourceText[currentPosition];
        const isSeparator = char === ' ' || char === '\n' || currentPosition === textLength;

        if (!isSeparator) {
            if (tokenStart === -1) {
                tokenStart = currentPosition;
            }
        } else {
            if (tokenStart !== -1) {
                yield sourceText.substring(tokenStart, currentPosition);
                tokenStart = -1;
            }
        }
        currentPosition++;
    }
}

const retrieveNextFoolishInteger = async () => {
    const fullContent = await acquireInputContent();
    const tokenIterator = generateWordTokens(fullContent);
    return () => parseInt(tokenIterator.next().value, 10);
};

const retrieveNextCarefulInteger = async () => {
    const fullContent = await acquireInputContent();
    const tokenIterator = parseCustomTokens(fullContent);
    return () => parseInt(tokenIterator.next().value, 10);
};

const DIM_INDICES = [0, 1, 2, 3];
const PRIME_MODULO = 1000000007;

const calculateModulo = (value) => value % PRIME_MODULO;

const getLinearIndex = (d1, d2, d3, d4) =>
    d1 * 64 + d2 * 16 + d3 * 4 + d4;

const applyForbiddenPattern = (gridData) => {
    for (const rVal of DIM_INDICES) {
        gridData[getLinearIndex(0, 2, 1, rVal)] = 0;
        gridData[getLinearIndex(rVal, 0, 2, 1)] = 0;
        gridData[getLinearIndex(0, 1, 2, rVal)] = 0;
        gridData[getLinearIndex(rVal, 0, 1, 2)] = 0;
        gridData[getLinearIndex(2, 0, 1, rVal)] = 0;
        gridData[getLinearIndex(rVal, 2, 0, 1)] = 0;
        gridData[getLinearIndex(0, rVal, 2, 1)] = 0;
        gridData[getLinearIndex(0, 2, rVal, 1)] = 0;
    }
};

(async () => {
    const getNextValue = await retrieveNextCarefulInteger();
    const inputLimit = getNextValue();

    if (inputLimit === 3) {
        console.log(61);
        return;
    }

    const totalGridCells = 4 * 4 * 4 * 4;
    let currentGridState = Array.from({ length: totalGridCells }, () => 1);

    applyForbiddenPattern(currentGridState);

    for (let iteration = 5; iteration <= inputLimit; iteration++) {
        const nextGridState = new Array(totalGridCells).fill(0);

        for (const dimA of DIM_INDICES) {
            for (const dimB of DIM_INDICES) {
                for (const dimC of DIM_INDICES) {
                    for (const dimD of DIM_INDICES) {
                        let cellAccumulator = 0;
                        for (const prevDimA of DIM_INDICES) {
                            cellAccumulator = calculateModulo(cellAccumulator + currentGridState[getLinearIndex(prevDimA, dimA, dimB, dimC)]);
                        }
                        nextGridState[getLinearIndex(dimA, dimB, dimC, dimD)] = cellAccumulator;
                    }
                }
            }
        }
        applyForbiddenPattern(nextGridState);
        currentGridState = nextGridState;
    }

    const finalResult = currentGridState.reduce((sum, val) => calculateModulo(sum + val), 0);

    console.log(finalResult);
})();
