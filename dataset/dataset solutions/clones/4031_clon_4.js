const inputStorage = [];

const interactionAgent = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

interactionAgent.on('line', (currentLine) => {
    inputStorage.push(currentLine);
});

interactionAgent.on('close', () => {
    const inputGrid = inputStorage.map(entry => entry.split(" ").map(entryVal => Number(entryVal)));

    // Check consistency of the matrix for A_i + B_j decomposition
    // C_ij = A_i + B_j implies C_ij - C_i0 - C_0j + C_00 = 0
    // This simplifies to C_ij = C_i0 + C_0j - C_00 for all i, j
    // We only need to check for i,j > 0 as other cases are trivial or used for derivation.
    // If these conditions are not met, no such A_i, B_j exist for any integers.
    if (
        inputGrid[1][1] !== inputGrid[1][0] + inputGrid[0][1] - inputGrid[0][0] ||
        inputGrid[1][2] !== inputGrid[1][0] + inputGrid[0][2] - inputGrid[0][0] ||
        inputGrid[2][1] !== inputGrid[2][0] + inputGrid[0][1] - inputGrid[0][0] ||
        inputGrid[2][2] !== inputGrid[2][0] + inputGrid[0][2] - inputGrid[0][0]
    ) {
        console.log("No");
        return;
    }

    // If consistent, then a solution (A_i, B_j) exists for arbitrary integers.
    // The original code additionally constrains B_0, B_1, B_2 to be in [0, 100].
    // Let B_j = B_0 + (C_0j - C_00).
    // We need to find if there exists an integer B_0 such that:
    // 0 <= B_0 <= 100
    // 0 <= B_0 + (C_01 - C_00) <= 100
    // 0 <= B_0 + (C_02 - C_00) <= 100

    const bDeltaOne = inputGrid[0][1] - inputGrid[0][0];
    const bDeltaTwo = inputGrid[0][2] - inputGrid[0][0];

    // Determine the lower and upper bounds for B_0
    const minimalB0 = Math.max(0, -bDeltaOne, -bDeltaTwo);
    const maximalB0 = Math.min(100, 100 - bDeltaOne, 100 - bDeltaTwo);

    // If a valid B_0 exists within the calculated bounds, then a solution is possible.
    if (minimalB0 <= maximalB0) {
        console.log("Yes");
    } else {
        console.log("No");
    }
});