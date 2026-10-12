var inputLines = [];

var inputReader = require('readline');

var lineInterface = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineInterface.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

lineInterface.on('close', function () {
    var gridData = inputLines.map(rowStr => rowStr.split(" ").map(Number));

    // A 3x3 grid 'C' can be represented as C[i][j] = A[i] + B[j]
    // if and only if the following conditions hold:
    // C[i][j] - C[i][0] - C[0][j] + C[0][0] === 0 for all i, j.
    // This is equivalent to checking if the "cross-difference" is zero.
    // For i=0 or j=0, this condition is trivially true.
    // We only need to verify it for i,j in {1,2}.

    const verifyStructuralIntegrity = (rowOffset, colOffset) => {
        return gridData[rowOffset][colOffset] - gridData[rowOffset][0] - gridData[0][colOffset] + gridData[0][0] === 0;
    };

    if (!verifyStructuralIntegrity(1, 1) ||
        !verifyStructuralIntegrity(1, 2) ||
        !verifyStructuralIntegrity(2, 1) ||
        !verifyStructuralIntegrity(2, 2)) {
        console.log("No");
        return;
    }

    // If the structural integrity holds, then a solution (A, B) exists for any integers.
    // Now, we must check if a solution exists where A[0], A[1], A[2] are all within [0, 100].
    // Let A[0] be denoted by 'initialA'.
    // From C[i][j] = A[i] + B[j], we know C[i][0] = A[i] + B[0].
    // Also, C[0][0] = A[0] + B[0].
    // Subtracting these: C[i][0] - C[0][0] = A[i] - A[0].
    // So, A[i] = A[0] + (C[i][0] - C[0][0]).

    const a1RelativeOffset = gridData[1][0] - gridData[0][0];
    const a2RelativeOffset = gridData[2][0] - gridData[0][0];

    // We need to find an 'initialA' (which is A[0]) such that:
    // 0 <= initialA <= 100
    // 0 <= initialA + a1RelativeOffset <= 100  (for A[1])
    // 0 <= initialA + a2RelativeOffset <= 100  (for A[2])

    // From 0 <= initialA + a1RelativeOffset <= 100:
    // -a1RelativeOffset <= initialA <= 100 - a1RelativeOffset

    // From 0 <= initialA + a2RelativeOffset <= 100:
    // -a2RelativeOffset <= initialA <= 100 - a2RelativeOffset

    // Combine all lower bounds and upper bounds for 'initialA':
    const effectiveLowerBound = Math.max(0, -a1RelativeOffset, -a2RelativeOffset);
    const effectiveUpperBound = Math.min(100, 100 - a1RelativeOffset, 100 - a2RelativeOffset);

    if (effectiveLowerBound <= effectiveUpperBound) {
        console.log("Yes");
    } else {
        console.log("No");
    }
});
