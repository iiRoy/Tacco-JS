const MODULUS_VAL = 998244353n;

// Structure to hold computed sub-problem results in a bottom-up fashion
const dpMemoizationTable = new Map(); // Map<BigInt, Map<BigInt, BigInt>>

// Utility to retrieve a value from the DP grid, returning 0n if not present
const obtainValueFromGrid = (rCoord, cCoord) => {
    if (!dpMemoizationTable.has(rCoord)) {
        return 0n;
    }
    const innerMap = dpMemoizationTable.get(rCoord);
    return innerMap.get(cCoord) || 0n; // Return 0n for non-existent entries
};

// Utility to store a computed value into the DP grid
const placeValueInGrid = (rCoord, cCoord, value) => {
    if (!dpMemoizationTable.has(rCoord)) {
        dpMemoizationTable.set(rCoord, new Map());
    }
    dpMemoizationTable.get(rCoord).set(cCoord, value);
};

// Main function to calculate the result using iterative dynamic programming
const calculateGridValue = (initialR, initialC, finalR, finalC) => {
    let currentR = initialR;
    while (currentR <= finalR) {
        let currentC = initialC;
        if (!dpMemoizationTable.has(currentR)) { // Ensure the inner map for currentR exists
            dpMemoizationTable.set(currentR, new Map());
        }
        while (currentC <= finalC) {
            let cellComputedValue;
            if (currentR === initialR && currentC === initialC) {
                // Base case: F(a,b) = 1
                cellComputedValue = 1n;
            } else if (currentR === initialR) {
                // Base case: F(a,j) = a**(j-b)
                cellComputedValue = initialR ** (currentC - initialC);
            } else if (currentC === initialC) {
                // Base case: F(i,b) = b**(i-a)
                cellComputedValue = initialC ** (currentR - initialR);
            } else {
                // Recurrence relation: F(i,j) = F(i-1, j)*j + F(i, j-1)*i - F(i-1, j-1)*(i-1)*(j-1)
                const termA = obtainValueFromGrid(currentR - 1n, currentC) * currentC;
                const termB = obtainValueFromGrid(currentR, currentC - 1n) * currentR;
                const termC = obtainValueFromGrid(currentR - 1n, currentC - 1n) * (currentR - 1n) * (currentC - 1n);
                cellComputedValue = (termA + termB - termC);
            }
            // Store the value after applying modulo, ensuring a positive result
            placeValueInGrid(currentR, currentC, (cellComputedValue % MODULUS_VAL + MODULUS_VAL) % MODULUS_VAL);
            currentC = currentC + 1n; // Increment BigInt for column
        }
        currentR = currentR + 1n; // Increment BigInt for row
    }
    return obtainValueFromGrid(finalR, finalC);
};

// Orchestrates input parsing, calculation, and output formatting
const processInputData = (rawInputText) => {
    const inputLines = rawInputText.split("\n");
    const [initialR, initialC, finalR, finalC] = inputLines[0].split(" ").map(stringVal => BigInt(stringVal));
    
    const finalResult = calculateGridValue(initialR, initialC, finalR, finalC);
    console.log(Number(finalResult));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));