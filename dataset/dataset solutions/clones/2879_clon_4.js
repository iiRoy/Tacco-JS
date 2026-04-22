const inputBufferCollection = [];

process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputSegment) => {
    inputBufferCollection.push(inputSegment);
});

process.stdin.on('end', () => {
    const completeInputString = inputBufferCollection.join('');

    const initialDataUnit = completeInputString.split('\n')[0];

    function evaluatePatternShift(currentSequenceState, currentOperationTally) {
        const targetPattern = "ABC";
        const substitutePattern = "BCA";

        const detectedPosition = currentSequenceState.indexOf(targetPattern);

        if (detectedPosition === -1) {
            return currentOperationTally;
        } else {
            const prefixPortion = currentSequenceState.substring(0, detectedPosition);
            const suffixPortion = currentSequenceState.substring(detectedPosition + targetPattern.length);

            const modifiedSequenceState = prefixPortion + substitutePattern + suffixPortion;

            return evaluatePatternShift(modifiedSequenceState, currentOperationTally + 1);
        }
    }

    const finalTransformationOutcome = evaluatePatternShift(initialDataUnit, 0);

    console.log(finalTransformationOutcome);
});