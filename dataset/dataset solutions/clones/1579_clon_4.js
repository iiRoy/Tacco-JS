function processInput(rawData) {
    const lines = rawData.split('\n');
    const sequenceLength = Number(lines[0]);
    const numericSequence = lines[1].split(' ').map(Number);

    const finalAccumulatedState = numericSequence.reduce((accumulator, currentElementValue, elementIndex, fullSequence) => {
        let [currentTotalSum, lastCalculatedBValue] = accumulator;

        if (elementIndex === 0) {
            // The first element of the 'b' sequence is always 0.
            // It contributes 0 to the total sum, and sets the 'lastCalculatedBValue' for the next iteration.
            return [currentTotalSum, 0];
        } else {
            const priorElementValue = fullSequence[elementIndex - 1];
            const currentCalculatedBValue = Math.max(0, priorElementValue + lastCalculatedBValue - currentElementValue);
            return [currentTotalSum + currentCalculatedBValue, currentCalculatedBValue];
        }
    }, [0, 0]); // Initial accumulator: [totalSumOfB, previousBValue]

    console.log(finalAccumulatedState[0]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
