const collectedInputLines = [];

const inputReaderModule = require('readline');

const ioInterface = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', (currentLineString) => {
    collectedInputLines.push(currentLineString);
});

ioInterface.on('close', () => {
    const inputMatrixData = collectedInputLines.map(lineStr =>
        lineStr.split(" ").map(numStr => Number(numStr))
    );

    let isSolutionAchieved = false;
    const MAX_ITERATION_LIMIT = 100;

    // The problem seeks to determine if a 3x3 matrix C can be represented as the sum of
    // two vectors, a (3x1) and b (1x3), such that C[i][j] = a[i] + b[j].
    // This loop iterates through all possible integer values for a[0] within a defined range.
    for (let currentA0 = 0; currentA0 <= MAX_ITERATION_LIMIT; currentA0++) {
        // Given a[0], we can derive the components of vector b using the first column of the matrix C.
        // b[j] = C[j][0] - a[0]
        const bVector = [];
        bVector[0] = inputMatrixData[0][0] - currentA0;
        bVector[1] = inputMatrixData[1][0] - currentA0;
        bVector[2] = inputMatrixData[2][0] - currentA0;

        // Now, iterate through possible integer values for a[1].
        for (let currentA1 = 0; currentA1 <= MAX_ITERATION_LIMIT; currentA1++) {
            // Check if the assumed a[1] is consistent with the second column of C,
            // using the already derived bVector components.
            // If any of the conditions C[j][1] = a[1] + b[j] are not met, this a[1] is invalid.
            if (currentA1 + bVector[0] !== inputMatrixData[0][1] ||
                currentA1 + bVector[1] !== inputMatrixData[1][1] ||
                currentA1 + bVector[2] !== inputMatrixData[2][1]) {
                continue; // Skip to the next potential currentA1 value.
            }

            // If a[0] and a[1] are consistent, iterate through possible integer values for a[2].
            for (let currentA2 = 0; currentA2 <= MAX_ITERATION_LIMIT; currentA2++) {
                // Check if the assumed a[2] is consistent with the third column of C,
                // using the derived bVector components.
                // If any of the conditions C[j][2] = a[2] + b[j] are not met, this a[2] is invalid.
                if (currentA2 + bVector[0] !== inputMatrixData[0][2] ||
                    currentA2 + bVector[1] !== inputMatrixData[1][2] ||
                    currentA2 + bVector[2] !== inputMatrixData[2][2]) {
                    continue; // Skip to the next potential currentA2 value.
                }

                // If all checks pass for currentA0, currentA1, currentA2, and the derived bVector,
                // then a valid decomposition has been found.
                isSolutionAchieved = true;
                break; // Exit the innermost loop (currentA2).
            }

            // If a solution was found and the flag is set, break out of the middle loop (currentA1).
            if (isSolutionAchieved) {
                break;
            }
        }

        // If a solution was found and the flag is set, break out of the outermost loop (currentA0).
        if (isSolutionAchieved) {
            break;
        }
    }

    // Output the final result based on whether a solution was successfully identified.
    if (isSolutionAchieved) {
        console.log("Yes");
    } else {
        console.log("No");
    }
});