const transformBit = (v1, v2) => (v1 === v2 ? 0 : 1);

const combineBitVectors = (vA, vB) => vA.map((bit, idx) => transformBit(bit, vB[idx]));

const determineLinearDependence = (currentGrid) => {
    if (currentGrid.length === 0 || currentGrid[0].length === 0) {
        return 0;
    }

    const numRows = currentGrid.length;
    const numCols = currentGrid[0].length;

    let pivotCol = -1;
    for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
            if (currentGrid[r][c] === 1) {
                pivotCol = c;
                break;
            }
        }
        if (pivotCol !== -1) break;
    }

    if (pivotCol === -1) {
        return 0; // Matrix is all zeros
    }

    let pivotRow = -1;
    for (let r = 0; r < numRows; r++) {
        if (currentGrid[r][pivotCol] === 1) {
            pivotRow = r;
            break;
        }
    }
    
    const actualPivotVector = currentGrid[pivotRow];

    const nextGridRows = [];
    for (let r = 0; r < numRows; r++) {
        if (r === pivotRow) continue; 

        let processedRow = currentGrid[r];
        if (processedRow[pivotCol] === 1) {
            processedRow = combineBitVectors(processedRow, actualPivotVector);
        }
        nextGridRows.push(processedRow);
    }
    
    const nextGrid = nextGridRows.map(row => row.filter((_, idx) => idx !== pivotCol));

    return 1 + determineLinearDependence(nextGrid);
};

const computeModularExponentiation = (baseVal, powerVal, modVal) => {
    let result = 1n;
    let currentBase = BigInt(baseVal);
    let currentPower = BigInt(powerVal);
    const modulus = BigInt(modVal);

    while (currentPower > 0n) {
        if (currentPower % 2n === 1n) {
            result = (result * currentBase) % modulus;
        }
        currentBase = (currentBase * currentBase) % modulus;
        currentPower = currentPower / 2n;
    }
    return Number(result);
};

const processBinaryGridProblem = (dataString) => {
    const numericalComponents = dataString.trim().match(/\d+/g).map(Number);
    const primaryDimension = numericalComponents.shift();
    const secondaryDimension = numericalComponents.shift();

    const initialGrid = [];
    for (let i = 0; i < primaryDimension; i++) {
        initialGrid.push(numericalComponents.slice(i * secondaryDimension, (i + 1) * secondaryDimension));
    }

    const calculatedRank = determineLinearDependence(initialGrid);

    const primeModulus = 998244353;

    const exponentA = primaryDimension + secondaryDimension - 1;
    const exponentB = primaryDimension + secondaryDimension - calculatedRank - 1;

    const termAlpha = computeModularExponentiation(2, exponentA, primeModulus);
    const termBeta = computeModularExponentiation(2, exponentB, primeModulus);

    const finalOutcome = (termAlpha - termBeta + primeModulus) % primeModulus;
    console.log(finalOutcome);
};

processBinaryGridProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));