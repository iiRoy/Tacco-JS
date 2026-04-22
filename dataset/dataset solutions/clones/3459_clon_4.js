const PRIME_MODULUS = 1000000007;

function obtainInputExtractor(rawInputString) {
    const allTokens = rawInputString.trim().split(/\s+/).map(Number);
    let currentTokenIndex = 0;

    return {
        fetchNext: function() {
            if (currentTokenIndex < allTokens.length) {
                return allTokens[currentTokenIndex++];
            }
            return undefined;
        }
    };
}

function generateNumericProgression(limit) {
    const progression = new Array(limit + 1);
    if (limit >= 0) progression[0] = 1;
    if (limit >= 1) progression[1] = 1;

    for (let idx = 2; idx <= limit; idx++) {
        progression[idx] = progression[idx - 1] + progression[idx - 2];
    }
    return progression;
}

function computeGridPaths(rowsCount, columnsCount, finalColumnIndex, fibonacciValues) {
    const memoizationStore = Array.from({ length: rowsCount }, () => Array(columnsCount).fill(null));

    function determineCellVal(currentRow, currentColumn) {
        if (currentColumn < 0 || currentColumn >= columnsCount) {
            return 0;
        }

        if (currentRow === 0) {
            if (currentColumn === 0) {
                return fibonacciValues[columnsCount - 1];
            } else if (currentColumn === 1 && columnsCount >= 2) {
                return fibonacciValues[columnsCount - 2];
            } else {
                return 0;
            }
        }

        if (memoizationStore[currentRow][currentColumn] !== null) {
            return memoizationStore[currentRow][currentColumn];
        }

        let totalWays = 0;

        // Path from (currentRow - 1, currentColumn) to (currentRow, currentColumn)
        totalWays = (totalWays +
            determineCellVal(currentRow - 1, currentColumn) *
            (fibonacciValues[columnsCount - currentColumn - 1] * fibonacciValues[currentColumn])) % PRIME_MODULUS;

        // Path from (currentRow - 1, currentColumn - 1) to (currentRow, currentColumn)
        if (currentColumn - 1 >= 0) {
            totalWays = (totalWays +
                determineCellVal(currentRow - 1, currentColumn - 1) *
                (fibonacciValues[columnsCount - currentColumn - 1] * fibonacciValues[currentColumn - 1])) % PRIME_MODULUS;
        }

        // Path from (currentRow - 1, currentColumn + 1) to (currentRow, currentColumn)
        if (currentColumn + 1 < columnsCount) {
            totalWays = (totalWays +
                determineCellVal(currentRow - 1, currentColumn + 1) *
                (fibonacciValues[columnsCount - (currentColumn + 1) - 1] * fibonacciValues[currentColumn])) % PRIME_MODULUS;
        }

        memoizationStore[currentRow][currentColumn] = totalWays;
        return totalWays;
    }

    return determineCellVal(rowsCount - 1, finalColumnIndex - 1);
}

function processCalculation(inputContent) {
    const numericalExtractor = obtainInputExtractor(inputContent);

    const heightDimension = numericalExtractor.fetchNext();
    const widthDimension = numericalExtractor.fetchNext();
    const desiredColumn = numericalExtractor.fetchNext();

    const fibonacciSeries = generateNumericProgression(widthDimension - 1);

    const finalResult = computeGridPaths(heightDimension, widthDimension, desiredColumn, fibonacciSeries);

    console.log(finalResult);
}

processCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));