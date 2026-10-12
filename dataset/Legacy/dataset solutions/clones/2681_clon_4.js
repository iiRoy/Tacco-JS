function processHeightSequence(sourceText) {
    const inputLines = sourceText.split('\n');
    const heightValueStrings = inputLines[1].split(' ');
    const totalElements = heightValueStrings.length;

    let currentHeightValues = heightValueStrings.map(val => parseInt(val, 10));

    if (currentHeightValues[0] > 0) {
        currentHeightValues[0]--;
    }

    const evaluationOutcome = Array.from({ length: totalElements - 1 }, (_, idx) => idx + 1)
        .reduce((accumulatorState, currentPositionIndex) => {
            if (accumulatorState.validationStatus === 'No') {
                return accumulatorState;
            }

            const previousPositionValue = accumulatorState.modifiedValues[currentPositionIndex - 1];
            let presentPositionValue = accumulatorState.modifiedValues[currentPositionIndex];

            if (previousPositionValue < presentPositionValue) {
                accumulatorState.modifiedValues[currentPositionIndex] = presentPositionValue - 1;
            } else if (previousPositionValue > presentPositionValue) {
                if (previousPositionValue - presentPositionValue > 1) {
                    accumulatorState.validationStatus = 'No';
                }
            }

            return accumulatorState;
        }, { validationStatus: 'Yes', modifiedValues: [...currentHeightValues] });

    evaluationOutcome.modifiedValues.forEach(itemValue => {
        console.log(itemValue);
    });

    console.log(evaluationOutcome.validationStatus);
}

processHeightSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
