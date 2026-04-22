const parseNumericValue = (textualData, radix = 10) => {
    const convertedValue = Number.parseInt(textualData, radix);

    if (Number.isNaN(convertedValue)) {
        return 0;
    }
    return convertedValue;
};

function processDataStream() {
    let inputLineCursor = 0;
    let currentSequenceSize;

    while (true) {
        if (inputLineCursor >= allInputLines.length) {
            break;
        }

        const rawSizeString = allInputLines[inputLineCursor];
        currentSequenceSize = parseNumericValue(rawSizeString);

        inputLineCursor++;

        if (currentSequenceSize <= 0) {
            break;
        }

        const currentNumericElements = [];

        for (let elementIndex = 0; elementIndex < currentSequenceSize; ++elementIndex) {
            if (inputLineCursor + elementIndex >= allInputLines.length) {
                currentSequenceSize = elementIndex;
                break;
            }

            const elementString = allInputLines[inputLineCursor + elementIndex];
            const parsedElement = parseNumericValue(elementString);

            currentNumericElements.push(parsedElement);
        }

        inputLineCursor += currentSequenceSize;

        let overallMaximumSum = -Number.MAX_VALUE;

        if (currentNumericElements.length === 0) {
            console.log(0);
            continue;
        }

        for (let startPoint = 0; startPoint < currentSequenceSize; ++startPoint) {
            let currentRunningSum = 0;

            for (let endPoint = startPoint; endPoint < currentSequenceSize; ++endPoint) {
                currentRunningSum += currentNumericElements[endPoint];

                if (currentRunningSum > overallMaximumSum) {
                    overallMaximumSum = currentRunningSum;
                }
            }
        }

        console.log(overallMaximumSum === -Number.MAX_VALUE ? 0 : overallMaximumSum);
    }
}

let allInputLines = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputChunk) => {
    allInputLines += inputChunk;
});

process.stdin.on('end', () => {
    allInputLines = allInputLines.split('\n');
    allInputLines = allInputLines.filter(line => line.trim() !== '');

    processDataStream();
});