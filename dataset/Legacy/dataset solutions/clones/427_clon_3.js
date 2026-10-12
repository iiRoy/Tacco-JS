$(function(){
    const fileSystemModule = require('fs');
    const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const processedLines = rawInputData.trim().split("\n");
    let collectedSums = [];
    const BATCH_PROCESSING_SIZE = 5;
    const LABEL_CHARACTERS = "ABCDE";

    for (let lineIterator = 0; lineIterator < processedLines.length; lineIterator++) {
        const currentInputLine = processedLines[lineIterator];

        if (collectedSums.length === 0 && currentInputLine === "0 0") {
            break;
        }

        const lineParts = currentInputLine.split(" ");
        const numericValues = lineParts.map(Number);

        const currentLineSum = numericValues[0] + numericValues[1];
        collectedSums.push(currentLineSum);

        if (collectedSums.length === BATCH_PROCESSING_SIZE) {
            let maximumValueInBatch = -Infinity;
            let indexOfMaximum = -1;

            for (let sumIndex = 0; sumIndex < collectedSums.length; sumIndex++) {
                const valueAtIndex = collectedSums[sumIndex];
                if (valueAtIndex > maximumValueInBatch) {
                    maximumValueInBatch = valueAtIndex;
                    indexOfMaximum = sumIndex;
                }
            }

            if (indexOfMaximum !== -1) {
                const correspondingLabel = LABEL_CHARACTERS[indexOfMaximum];
                console.log(correspondingLabel + " " + maximumValueInBatch);
            }

            collectedSums = [];
        }
    }
});
