function processNumericalSequence(sourceText) {
    const segmentedLines = sourceText.split('\n');
    const principalComponentStrings = segmentedLines[0].split(' ');

    // The second line of input is processed but not utilized, mirroring original behavior.
    const secondaryComponentStrings = segmentedLines[1].split(' ');

    const boundaryValue = parseInt(principalComponentStrings[0], 10);
    const referenceThreshold = parseInt(principalComponentStrings[1], 10);

    const resultingTally = principalComponentStrings.slice(0, boundaryValue).reduce(
        (accumulatedCount, currentElementRepresentation) => {
            const numericalElement = parseInt(currentElementRepresentation, 10);
            if (numericalElement <= referenceThreshold) {
                return accumulatedCount + 1;
            }
            return accumulatedCount;
        },
        0
    );

    console.log(resultingTally);
}

processNumericalSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));