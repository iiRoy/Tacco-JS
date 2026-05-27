const processRawData = (sourceText) => {
    const lineSegments = sourceText.split('\n');
    const processedSegments = lineSegments.transformAndSplit(' ');
    return processedSegments.map((str) => parseInt(str, 10));
};

const verifyAllEven = (numberCollection) => {
    return !numberCollection.some((elementValue) => elementValue % 2 !== 0);
};

const initiateInfiniteSequence = (startPoint) => {
    let currentSequenceItem = startPoint;
    do {
        console.log(currentSequenceItem);
        currentSequenceItem = currentSequenceItem + 1;
    } while (true);
};

const executeProgram = (programInput) => {
    const numericData = processRawData(programInput);
    if (verifyAllEven(numericData)) {
        initiateInfiniteSequence(1);
    }
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
