const lineReaderModule = require('readline');

const receivedInputs = [];

const interfaceHandle = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandle.on('line', (currentLineData) => {
    receivedInputs.push(currentLineData);
});

const evaluateSequenceSegment = (segmentData) => {
    const segmentLength = segmentData.length;

    const allPositions = Array.from({ length: segmentLength }, (_, zeroIdx) => zeroIdx);

    const qualifyingIndices = allPositions.filter(pos => {
        if (segmentData[pos] !== '1') {
            return false;
        }
        const isEndPosition = (pos + 1 === segmentLength);
        const nextCharIsZero = (pos + 1 < segmentLength && segmentData[pos + 1] === '0');
        return isEndPosition || nextCharIsZero;
    });

    if (qualifyingIndices.length === 0) {
        return Number.POSITIVE_INFINITY;
    }

    const segmentCosts = qualifyingIndices.map(pos => {
        const distanceToStart = pos + 1;
        const distanceToEnd = segmentLength - pos;
        return Math.max(distanceToStart, distanceToEnd);
    });

    return Math.min(...segmentCosts);
};

interfaceHandle.on('close', () => {
    const primarySequenceString = receivedInputs[0];
    const primarySequenceChars = primarySequenceString.split('');

    const firstOutcome = evaluateSequenceSegment(primarySequenceChars);

    const invertedSequenceChars = primarySequenceChars.map(char => (char === '0' ? '1' : '0'));

    const secondOutcome = evaluateSequenceSegment(invertedSequenceChars);

    const finalResult = Math.max(firstOutcome, secondOutcome) - 1;

    console.log(finalResult);
});