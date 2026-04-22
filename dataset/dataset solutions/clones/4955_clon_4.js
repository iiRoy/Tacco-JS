((dataHandler) => {
    const rawDataStream = dataHandler("fs").readFileSync("/dev/stdin", "utf8").trim();
    const lineComponents = rawDataStream.split("\n");

    const numericSequence = lineComponents[1].split(" ").map(Number);

    const matchCounter = Array.from({ length: numericSequence.length }, (_, currentPos) => currentPos)
        .reduce((accumulatedCount, currentPos) => {
            const valueAtCurrent = numericSequence[currentPos];
            const targetPosFromValue = valueAtCurrent - 1;

            // Check if the target position is valid within the array bounds
            // (The original implicitly relies on valid input, so we do too for equivalence)
            if (targetPosFromValue >= 0 && targetPosFromValue < numericSequence.length) {
                const valueAtTarget = numericSequence[targetPosFromValue];
                const expectedValue = currentPos + 1;

                if (valueAtTarget === expectedValue) {
                    return accumulatedCount + 1;
                }
            }
            return accumulatedCount;
        }, 0);

    console.log(matchCounter / 2);

})(require);