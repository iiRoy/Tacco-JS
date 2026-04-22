let inputBuffer = '';

function* createTokenGenerator() {
    const tokens = inputBuffer.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
        yield token;
    }
}

let tokenSource;

const getNextValue = (isText) => {
    const token = tokenSource.next().value;
    return isText ? token : Number(token);
};

const outputValue = (value) => {
    console.log(value);
};

const determineProximityIndicators = (sequence, sequenceLength) => {
    const initialCalculationState = { calculatedValues: [], currentOffset: -1 };

    const finalCalculationState = Array.from({ length: sequenceLength }).reduce((state, _, position) => {
        const charAtPosition = sequence[position];
        let newCalculatedValues = [...state.calculatedValues];
        let newOffset = state.currentOffset;

        if (charAtPosition === 'c') {
            newCalculatedValues.push(0);
            newOffset = 1;
        } else {
            newCalculatedValues.push(newOffset !== -1 ? newOffset : -1);
            if (newOffset !== -1) {
                newOffset++;
            }
        }
        return { calculatedValues: newCalculatedValues, currentOffset: newOffset };
    }, initialCalculationState);

    return finalCalculationState.calculatedValues.join(' ');
};

const orchestrateExecution = (linesToProcess, segmentLength) => {
    if (linesToProcess <= 0) {
        return;
    }

    const lineContent = getNextValue('text');
    const resultString = determineProximityIndicators(lineContent, segmentLength);
    outputValue(resultString);

    orchestrateExecution(linesToProcess - 1, segmentLength);
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    tokenSource = createTokenGenerator();
    const totalLines = getNextValue(false);
    const segmentLength = getNextValue(false);
    orchestrateExecution(totalLines, segmentLength);
});