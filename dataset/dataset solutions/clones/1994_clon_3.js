(function(inputLine) {
    const MODULO_VALUE = 1000000007; // Constant for the modulo operation

    // Parse input values from the provided string
    const inputParts = inputLine.split(' ');
    const numRows = parseInt(inputParts[0], 10);
    const columnLimit = parseInt(inputParts[1], 10);

    // Helper function to compute the Greatest Common Divisor (GCD)
    const computeGCD = (valA, valB) => {
        // Inner recursive function for GCD calculation
        const recursiveGCD = (a, b) => {
            if (b === 0) {
                return a;
            }
            return recursiveGCD(b, a % b);
        };
        return recursiveGCD(valA, valB);
    };

    // Precompute GCD contribution factors for each column index
    // This array stores lists of [GCD_value, count] pairs
    const gcdContributionFactors = [];
    for (let i = 0; i < columnLimit; ++i) {
        // Map to store temporary counts of GCDs for the current 'i'
        const currentGCDMap = {};
        for (let j = 0; j < columnLimit; ++j) {
            const commonDivisor = computeGCD(i + 1, j + 1);
            // Initialize count if GCD is encountered for the first time
            if (currentGCDMap[commonDivisor] === undefined) {
                currentGCDMap[commonDivisor] = 0;
            }
            currentGCDMap[commonDivisor]++;
        }

        // Convert the map of GCD counts into a list of [GCD_value, count] pairs
        const currentGCDList = [];
        for (const [keyStr, count] of Object.entries(currentGCDMap)) {
            // Convert string key back to number
            currentGCDList.push([parseInt(keyStr, 10), count]);
        }
        gcdContributionFactors.push(currentGCDList);
    }

    // Initialize the Dynamic Programming table
    const dpTable = [];
    // The first row of the DP table is initialized with all 1s
    const initialRow = new Array(columnLimit + 1).fill(1);
    dpTable.push(initialRow);

    // Fill the DP table row by row
    for (let rowIdx = 1; rowIdx < numRows; ++rowIdx) {
        const currentRow = new Array(columnLimit + 1).fill(0);
        dpTable.push(currentRow);

        // Iterate through possible previous column states (j in original)
        for (let prevColIdx = 0; prevColIdx < columnLimit; ++prevColIdx) {
            const previousValue = dpTable[rowIdx - 1][prevColIdx];

            // Iterate through precomputed GCD contributions for the current prevColIdx
            for (const dataEntry of gcdContributionFactors[prevColIdx]) {
                const targetGCD = dataEntry[0]; // The GCD value
                const contributionCount = dataEntry[1]; // How many times this GCD occurs

                // The target column index in the DP table is GCD - 1
                const targetColumnIndex = targetGCD - 1;

                // Calculate the value to add to the current DP cell
                const valueToAdd = (previousValue * contributionCount) % MODULO_VALUE;

                // Add the calculated value and apply modulo
                dpTable[rowIdx][targetColumnIndex] = (dpTable[rowIdx][targetColumnIndex] + valueToAdd) % MODULO_VALUE;
            }
        }
    }

    // Calculate the final result from the last row of the DP table
    // Access the last row directly instead of using pop()
    const finalRowValues = dpTable[numRows - 1];
    let totalSum = 0;

    for (let i = 0; i < finalRowValues.length; ++i) {
        const currentGCDValue = i + 1; // The actual GCD value represented by index 'i'
        const countForGCD = finalRowValues[i]; // The count for this GCD from the DP table

        // Calculate the term for the sum and apply modulo
        const term = (currentGCDValue * countForGCD) % MODULO_VALUE;
        totalSum = (totalSum + term) % MODULO_VALUE;
    }

    console.log(totalSum);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
