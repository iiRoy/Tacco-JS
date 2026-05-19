const { stdin: inputSource, stdout: outputSink } = process;

let collectedInput = '';
let numericValues = [];

const comparisonOutcomes = new Map([
    [-1, "a < b"],
    [1, "a > b"],
    [0, "a = b"]
]);

inputSource.on('data', (dataChunk) => {
    collectedInput += dataChunk.toString();
    const lineSegments = collectedInput.split('\n');

    for (let i = 0; i < lineSegments.length; i++) {
        const currentSegment = lineSegments[i].trim();
        if (currentSegment !== '') {
            const parsedNumber = parseInt(currentSegment, 10);
            if (!isNaN(parsedNumber)) {
                numericValues.push(parsedNumber);
                if (numericValues.length === 2) {
                    const firstOperand = numericValues[0];
                    const secondOperand = numericValues[1];

                    const differential = firstOperand - secondOperand;
                    const outcomeKey = Math.sign(differential);

                    outputSink.write(comparisonOutcomes.get(outcomeKey) + '\n');
                    inputSource.destroy();
                    return;
                }
            }
        }
    }
    collectedInput = lineSegments[lineSegments.length - 1];
});

inputSource.on('error', (err) => {
    // In a real application, more robust error handling would be here.
    // For cloning, we just ensure no extra output.
});
