let gatheredInput = '';

const performShiftAndInsert = (collection, targetValue, shiftPosition) => {
    if (shiftPosition < 0 || Number(collection[shiftPosition]) <= Number(targetValue)) {
        collection[shiftPosition + 1] = targetValue;
        return;
    }
    collection[shiftPosition + 1] = collection[shiftPosition];
    performShiftAndInsert(collection, targetValue, shiftPosition - 1);
};

const processNextElement = (dataset, currentIterationIndex, totalElements) => {
    if (currentIterationIndex >= totalElements) {
        return;
    }

    let elementToInsert = dataset[currentIterationIndex];
    performShiftAndInsert(dataset, elementToInsert, currentIterationIndex - 1);

    process.stdout.write(dataset.join(" ") + "\n");

    processNextElement(dataset, currentIterationIndex + 1, totalElements);
};

const handleIncomingData = (dataSegment) => {
    gatheredInput += dataSegment;
};

const commenceProcessing = () => {
    const inputParts = gatheredInput.split('\n');
    const elementCount = Number(inputParts[0]);
    const numericCollection = inputParts[1].split(' ');

    process.stdout.write(numericCollection.join(" ") + "\n");

    processNextElement(numericCollection, 1, elementCount);
};

process.stdin.setEncoding('utf8');
process.stdin.on('data', handleIncomingData);
process.stdin.on('end', commenceProcessing);
process.stdin.resume();