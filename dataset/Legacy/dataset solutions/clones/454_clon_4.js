const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const allInputLines = rawInputContent.trim().split('\n');

const calculateBlockOutcome = (targetValue, dataEntries, currentAccumulation = 0, monthIdentifier = 1) => {
    if (monthIdentifier > 12) {
        return "NA";
    }

    const [firstComponent, secondComponent] = dataEntries[monthIdentifier - 1].split(' ').map(Number);
    const updatedAccumulation = currentAccumulation + (firstComponent - secondComponent);

    if (updatedAccumulation >= targetValue) {
        return monthIdentifier;
    }

    return calculateBlockOutcome(targetValue, dataEntries, updatedAccumulation, monthIdentifier + 1);
};

const processInputSequences = (currentLinePointer, sourceLines) => {
    if (currentLinePointer >= sourceLines.length) {
        return;
    }

    const blockThreshold = Number(sourceLines[currentLinePointer]);

    if (blockThreshold === 0) {
        return;
    }

    const twelveDataEntries = sourceLines.slice(currentLinePointer + 1, currentLinePointer + 1 + 12);

    const sequenceResult = calculateBlockOutcome(blockThreshold, twelveDataEntries);

    console.log(sequenceResult);

    processInputSequences(currentLinePointer + 13, sourceLines);
};

processInputSequences(0, allInputLines);
