var inputBuffer = [];
var ioModule = require('readline');

var inputHandler = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentInputLine) {
    inputBuffer.push(currentInputLine);
});

inputHandler.on('close', function () {
    const parseMatrixData = (rawLines) => {
        return rawLines.map(rowString => {
            return rowString.split(" ").map(numStr => Number(numStr));
        });
    };

    const inputMatrix = parseMatrixData(inputBuffer);

    const MAX_ITERATION_VALUE = 100;
    let hasSolutionBeenFound = false;

    const checkSumEquality = (valA, valB, expectedC) => {
        return (valA + valB) === expectedC;
    };

    // Iterate for the first component of vector A (A[0])
    for (let aVal0 = 0; aVal0 <= MAX_ITERATION_VALUE; aVal0++) {
        // Derive the components of vector B (B[0], B[1], B[2]) using A[0] and the first row of C
        const bVal0 = inputMatrix[0][0] - aVal0;
        const bVal1 = inputMatrix[0][1] - aVal0;
        const bVal2 = inputMatrix[0][2] - aVal0;

        // Iterate for the second component of vector A (A[1])
        for (let aVal1 = 0; aVal1 <= MAX_ITERATION_VALUE; aVal1++) {
            // Validate A[1] against the second row of C and derived B values
            if (!checkSumEquality(aVal1, bVal0, inputMatrix[1][0])) { continue; }
            if (!checkSumEquality(aVal1, bVal1, inputMatrix[1][1])) { continue; }
            if (!checkSumEquality(aVal1, bVal2, inputMatrix[1][2])) { continue; }

            // Iterate for the third component of vector A (A[2])
            for (let aVal2 = 0; aVal2 <= MAX_ITERATION_VALUE; aVal2++) {
                // Validate A[2] against the third row of C and derived B values
                if (!checkSumEquality(aVal2, bVal0, inputMatrix[2][0])) { continue; }
                if (!checkSumEquality(aVal2, bVal1, inputMatrix[2][1])) { continue; }
                if (!checkSumEquality(aVal2, bVal2, inputMatrix[2][2])) { continue; }

                // If all checks pass, a valid combination is found
                console.log("Yes");
                hasSolutionBeenFound = true;
                // Exit the event handler immediately
                return;
            }
        }
    }

    // If the loops complete without finding a solution
    if (!hasSolutionBeenFound) {
        console.log("No");
    }
});
