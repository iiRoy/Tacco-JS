const acquireRawData = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const transformInputLines = (textPayload) => {
    const adjustedPayload = textPayload.trimEnd();
    return adjustedPayload.split('\n');
};

const formulateNumericRanges = (startpoint, endpoint) => {
    const ascendingProgression = (initial, final) => Array.from({ length: final - initial + 1 }, (_, idx) => initial + idx);
    const descendingProgression = (initial, final) => Array.from({ length: initial - final + 1 }, (_, idx) => initial - idx);

    let resultingPath = [];

    const pathStrategies = [
        {
            test: (currentPosition, destination) => currentPosition < destination,
            sequence: (currentPosition, destination) => ascendingProgression(currentPosition, destination)
        },
        {
            test: (currentPosition, destination) => currentPosition > destination && currentPosition <= 5,
            sequence: (currentPosition, destination) => descendingProgression(currentPosition, destination)
        },
        {
            test: (currentPosition, destination) => currentPosition > destination && currentPosition >= 6 && destination >= 6,
            sequence: (currentPosition, destination) => [...ascendingProgression(currentPosition, 10), ...ascendingProgression(5, destination)]
        },
        {
            test: (currentPosition, destination) => currentPosition > destination && currentPosition >= 6 && destination <= 5,
            sequence: (currentPosition, destination) => [...ascendingProgression(currentPosition, 10), ...descendingProgression(5, destination)]
        }
    ];

    for (const strat of pathStrategies) {
        if (strat.test(startpoint, endpoint)) {
            resultingPath = strat.sequence(startpoint, endpoint);
            break;
        }
    }
    return resultingPath;
};

const executeProcessing = () => {
    const sourceData = acquireRawData();
    const entryItems = transformInputLines(sourceData);

    const quantityOfOperations = parseInt(entryItems.shift(), 10);
    const generatedOutputs = [];

    Array.from({ length: quantityOfOperations }, (_, index) => {
        const currentDataPair = entryItems[index].split(' ').map(val => parseInt(val, 10));
        const initialValue = currentDataPair[0];
        const finalValue = currentDataPair[1];
        const computedSequence = formulateNumericRanges(initialValue, finalValue);
        generatedOutputs.push(computedSequence.join(' '));
    });

    generatedOutputs.forEach(line => process.stdout.write(line + '\n'));
};

executeProcessing();