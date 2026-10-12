process.stdin.resume();
process.stdin.setEncoding('utf8');

function determineMaxAchievable(paramA, paramB, targetSum) {
    const growthFactorA = paramA / 100 + 1;
    const growthFactorB = paramB / 100 + 1;
    let currentMaxAchieved = 0;

    for (let valueI = 1; valueI < 1000; valueI++) {
        for (let valueJ = 1; valueJ < 1000; valueJ++) {
            const sumTermA = (valueI * growthFactorA) | 0;
            const sumTermB = (valueJ * growthFactorA) | 0;

            if ((sumTermA + sumTermB) === targetSum) {
                const potentialMax = ((valueI * growthFactorB) | 0) + ((valueJ * growthFactorB) | 0);
                currentMaxAchieved = Math.max(currentMaxAchieved, potentialMax);
            }
        }
    }
    return currentMaxAchieved;
}

process.stdin.on('data', function(incomingDataChunk){
    const processedLines = incomingDataChunk.split('\n');

    for (const singleLineText of processedLines) {
        const numericStringParts = singleLineText.split(' ');

        // Replicating the original `if(row[0] | row[1] | row[2])` behavior
        // This implicitly converts to number and then performs bitwise OR.
        // If a part is undefined or non-numeric, Number() makes it NaN, then || 0 makes it 0.
        const checkVal0 = Number(numericStringParts[0]) || 0;
        const checkVal1 = Number(numericStringParts[1]) || 0;
        const checkVal2 = Number(numericStringParts[2]) || 0;

        if (checkVal0 || checkVal1 || checkVal2) {
            // Explicitly convert to integer using Number() then | 0 for consistency with original
            const paramA = Number(numericStringParts[0]) | 0;
            const paramB = Number(numericStringParts[1]) | 0;
            const targetSum = Number(numericStringParts[2]) | 0;

            const computedMaximum = determineMaxAchievable(paramA, paramB, targetSum);
            console.log(computedMaximum);
        }
    }
});
