let displayOutputValue;
let obtainInputRecord;

const executeProcessingLogic = () => {
    const processNextDataUnit = () => {
        const currentRawLine = obtainInputRecord();
        if (currentRawLine === null) {
            return;
        }

        const numericalComponents = currentRawLine.split(' ').map(Number);
        const primaryValue = numericalComponents[0];

        if (primaryValue !== 0) {
            displayOutputValue(0);
            processNextDataUnit();
        }
    };

    processNextDataUnit();
};

if (1) {
    displayOutputValue = (val) => console.log(val);

    let bufferedInputLines = [];
    let currentLinePointer = 0;
    let inputAccumulator = "";
    
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (inputChunk) => {
        const combinedContent = inputAccumulator + inputChunk;
        const lineSegments = combinedContent.split('\n');
        inputAccumulator = lineSegments.pop();
        for (const segment of lineSegments) {
            if (segment !== '') {
                bufferedInputLines.push(segment);
            }
        }
    });

    process.stdin.on('end', () => {
        if (inputAccumulator !== '') {
            bufferedInputLines.push(inputAccumulator);
        }
    });

    obtainInputRecord = () => {
        if (currentLinePointer < bufferedInputLines.length) {
            return bufferedInputLines[currentLinePointer++];
        }
        return null;
    };

} else {
    executeProcessingLogic();
}
