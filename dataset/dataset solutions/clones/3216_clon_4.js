const xorBits = (firstBit, secondBit) => firstBit === secondBit ? 0 : 1;

const xorRows = (firstRow, secondRow) => firstRow.map((bitValue, index) => xorBits(bitValue, secondRow[index]));

const MOD_CONSTANT = 998244353;

function computeModularPower(baseValue, exponentValue) {
    let outcome = 1;
    baseValue %= MOD_CONSTANT;
    while (exponentValue > 0) {
        if (exponentValue % 2 === 1) outcome = (outcome * baseValue) % MOD_CONSTANT;
        baseValue = (baseValue * baseValue) % MOD_CONSTANT;
        exponentValue = Math.floor(exponentValue / 2);
    }
    return outcome;
}

function deriveBinaryMatrixRank(initialMatrixRows) {
    let activeMatrixRows = initialMatrixRows;
    let currentAchievedRank = 0;
    let currentRemainingColumnCount = initialMatrixRows.length > 0 ? initialMatrixRows[0].length : 0;

    while (activeMatrixRows.length > 0 && currentRemainingColumnCount > 0) {
        let pivotRowIndex = activeMatrixRows.findIndex(row => row[0] === 1);

        if (pivotRowIndex === -1) {
            // No pivot (1) found in the first column. This column is linearly dependent.
            // Effectively remove this column from all active rows.
            activeMatrixRows = activeMatrixRows.map(row => row.slice(1));
            currentRemainingColumnCount--;
        } else {
            // A pivot (1) was found. Increment the rank.
            currentAchievedRank++;
            let pivotRow = activeMatrixRows[pivotRowIndex];

            // Construct the next set of rows by XORing with the pivot row
            // and excluding the pivot row itself from further consideration.
            let nextIterationRows = [];
            for (let i = 0; i < activeMatrixRows.length; i++) {
                if (i === pivotRowIndex) {
                    continue; // The pivot row has been used; it's effectively removed.
                }
                let currentRow = activeMatrixRows[i];
                if (currentRow[0] === 1) {
                    nextIterationRows.push(xorRows(currentRow, pivotRow));
                } else {
                    nextIterationRows.push(currentRow);
                }
            }

            // All rows in `nextIterationRows` now have '0' in their first column.
            // Effectively remove this column from these rows.
            activeMatrixRows = nextIterationRows.map(row => row.slice(1));
            currentRemainingColumnCount--;
        }
        // Filter out any rows that became all zeros after XOR operations.
        activeMatrixRows = activeMatrixRows.filter(row => row.some(bit => bit === 1));
    }
    return currentAchievedRank;
}

function processAndOutputResult(rawInputString) {
    let numericalData = rawInputString.trim().split(/\s+/).map(Number);
    let totalRows = numericalData.shift();
    let totalColumns = numericalData.shift();

    let binaryMatrix = [];
    for (let i = 0; i < totalRows; i++) {
        let currentRow = [];
        for (let j = 0; j < totalColumns; j++) {
            currentRow.push(numericalData[i * totalColumns + j]);
        }
        binaryMatrix.push(currentRow);
    }

    let calculatedRank = deriveBinaryMatrixRank(binaryMatrix);

    let powerExponentOne = totalRows + totalColumns - 1;
    let powerExponentTwo = totalRows + totalColumns - calculatedRank - 1;

    let firstTerm = computeModularPower(2, powerExponentOne);
    let secondTerm = computeModularPower(2, powerExponentTwo);

    let finalAnswer = (firstTerm - secondTerm + MOD_CONSTANT) % MOD_CONSTANT;

    console.log(finalAnswer);
}

processAndOutputResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
