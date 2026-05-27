const getRawInput = (filePath) => require('fs').readFileSync(filePath, 'utf8');

const parseNumericLines = (inputString) => {
    return inputString.trim().split("\n").map(Number);
};

const propagateValueBackwardAndForward = (targetArray, valueToPropagate, initialLookbackIndex) => {
    let propagationStartPoint = initialLookbackIndex;
    while (propagationStartPoint > 0 && targetArray[propagationStartPoint] !== valueToPropagate) {
        propagationStartPoint--;
    }
    for (let k = propagationStartPoint; k < targetArray.length - 1; k++) {
        targetArray[k] = valueToPropagate;
    }
};

const rawInputContent = getRawInput('/dev/stdin');
let numericSequence = parseNumericLines(rawInputContent);

while (true) {
    let datasetSize = numericSequence.shift();
    if (datasetSize === 0) {
        break;
    }

    const currentBlockValues = Array.from({ length: datasetSize }, () => numericSequence.shift());

    const finalProcessedBlocks = [];
    for (let i = 0; i < currentBlockValues.length; i++) {
        const blockValue = currentBlockValues[i];
        const isEvenPosition = (i % 2 === 0);

        if (isEvenPosition) {
            finalProcessedBlocks.push(blockValue);
        } else {
            const lastElementInProcessed = finalProcessedBlocks[finalProcessedBlocks.length - 1];
            if (lastElementInProcessed === blockValue) {
                finalProcessedBlocks.push(blockValue);
            } else {
                finalProcessedBlocks.push(blockValue);
                propagateValueBackwardAndForward(finalProcessedBlocks, blockValue, i - 1);
            }
        }
    }

    const zeroOccurrences = finalProcessedBlocks.reduce((count, val) => {
        return count + (val === 0 ? 1 : 0);
    }, 0);

    console.log(zeroOccurrences);
}
