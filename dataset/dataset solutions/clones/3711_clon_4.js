let accumulatedInputContent = '';

const setupInputPipeline = (callbackFunction) => {
    process.stdin.on('data', (dataChunk) => {
        accumulatedInputContent += dataChunk.toString();
    });

    process.stdin.on('end', () => {
        callbackFunction(accumulatedInputContent.trim().split('\n'));
    });

    process.stdin.on('error', (err) => {
        process.stderr.write('Input Stream Error: ' + err.message + '\n');
        process.exit(1);
    });
};

const transformSequence = (initialSequence) =>
    initialSequence.map((elementValue, ordinalPosition) =>
        elementValue - ordinalPosition - 1
    );

const findCentralPoint = (orderedSequence) => {
    const sequenceLength = orderedSequence.length;
    const midPoint = Math.floor(sequenceLength / 2);
    return (sequenceLength % 2 === 0)
        ? (orderedSequence[midPoint - 1] + orderedSequence[midPoint]) / 2
        : orderedSequence[midPoint];
};

const calculateTotalDeviation = (dataSeries, referencePoint) =>
    dataSeries.reduce((summation, currentValue) =>
        summation + Math.abs(currentValue - referencePoint), 0
    );

const arrangeElements = (collectionToArrange) => {
    if (collectionToArrange.length <= 1) {
        return collectionToArrange;
    }

    const pivotValue = collectionToArrange[Math.floor(collectionToArrange.length / 2)];
    const elementsSmaller = [];
    const elementsLarger = [];
    const elementsEqual = [];

    for (const item of collectionToArrange) {
        if (item < pivotValue) {
            elementsSmaller.push(item);
        } else if (item > pivotValue) {
            elementsLarger.push(item);
        } else {
            elementsEqual.push(item);
        }
    }

    return arrangeElements(elementsSmaller).concat(elementsEqual).concat(arrangeElements(elementsLarger));
};

const initiateCalculation = (inputSourceLines) => {
    const quantity = Number(inputSourceLines[0]);
    const numericData = inputSourceLines[1].split(' ').map(Number);

    const processedData = transformSequence(numericData);
    const orderedProcessedData = arrangeElements(processedData);
    const medianEquivalent = findCentralPoint(orderedProcessedData);
    const finalSum = calculateTotalDeviation(orderedProcessedData, medianEquivalent);

    process.stdout.write(finalSum.toString() + '\n');
};

setupInputPipeline(initiateCalculation);