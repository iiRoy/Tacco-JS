const readline = require('readline');

function obtainMetric(sourceText, targetText) {
    const distCache = new Map();

    const calcRecursive = (idx1, idx2) => {
        const cacheKey = `${idx1},${idx2}`;

        if (distCache.has(cacheKey)) {
            return distCache.get(cacheKey);
        }

        if (idx1 === 0) {
            return idx2;
        }
        if (idx2 === 0) {
            return idx1;
        }

        const charA = sourceText.charAt(idx1 - 1);
        const charB = targetText.charAt(idx2 - 1);

        let currentCost;
        if (charA === charB) {
            currentCost = calcRecursive(idx1 - 1, idx2 - 1);
        } else {
            const substitutionCost = calcRecursive(idx1 - 1, idx2 - 1);
            const deletionCost = calcRecursive(idx1 - 1, idx2);
            const insertionCost = calcRecursive(idx1, idx2 - 1);

            currentCost = 1 + Math.min(substitutionCost, deletionCost, insertionCost);
        }

        distCache.set(cacheKey, currentCost);
        return currentCost;
    };

    return calcRecursive(sourceText.length, targetText.length);
}

async function processInputAndOutput() {
    const rlInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let primaryStr = '';
    let secondaryStr = '';
    let lineCounter = 0;

    for await (const currentInput of rlInterface) {
        if (lineCounter === 0) {
            primaryStr = currentInput;
        } else if (lineCounter === 1) {
            secondaryStr = currentInput;
            break;
        }
        lineCounter++;
    }

    rlInterface.close();

    const resultValue = obtainMetric(primaryStr, secondaryStr);

    console.log(resultValue);
}

processInputAndOutput();