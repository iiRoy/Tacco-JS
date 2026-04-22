const sourceSystem = require('fs');
const acquiredText = sourceSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = acquiredText.trim().split("\n");

function* blockProcessor(allInputElements) {
    let currentBlockSizeIndicator = null;
    let accumulatedDataSets = [];
    let elementPointer = 0;

    const padAndAlign = (numericVal) => ("     " + numericVal).slice(-5);

    while (elementPointer < allInputElements.length) {
        const currentElementLine = allInputElements[elementPointer];
        const numericSegments = currentElementLine.split(" ").map(Number);

        if (numericSegments.length === 1) {
            const blockHeaderOrStopper = numericSegments[0];

            if (currentBlockSizeIndicator === null) {
                currentBlockSizeIndicator = blockHeaderOrStopper;
            } else {
                let segmentTotals = Array(currentBlockSizeIndicator + 1).fill(0);
                for (const dataRow of accumulatedDataSets) {
                    for (let segmentIndex = 0; segmentIndex < dataRow.length; segmentIndex++) {
                        segmentTotals[segmentIndex] += dataRow[segmentIndex];
                    }
                    yield dataRow.map(padAndAlign).join("");
                }
                yield segmentTotals.map(padAndAlign).join("");

                if (blockHeaderOrStopper === 0) {
                    return;
                } else {
                    currentBlockSizeIndicator = blockHeaderOrStopper;
                    accumulatedDataSets = [];
                }
            }
        } else {
            const rowTotal = numericSegments.reduce((sumAccumulator, currentNum) => sumAccumulator + currentNum, 0);
            accumulatedDataSets.push([...numericSegments, rowTotal]);
        }
        elementPointer++;
    }
}

for (const finalOutputLine of blockProcessor(processedLines)) {
    console.log(finalOutputLine);
}