const dataSegments = [];

process.stdin.on('data', (chunk) => {
    dataSegments.push(chunk.toString());
});

process.stdin.on('end', () => {
    const completeInput = dataSegments.join('');
    const inputLines = completeInput.split('\n');

    const initialSize = parseInt(inputLines.shift(), 10);

    const startingSequence = inputLines.shift().split(' ').map(val => parseInt(val, 10));

    const elementFrequencies = new Map();
    let currentTotal = 0;

    for (const item of startingSequence) {
        elementFrequencies.set(item, (elementFrequencies.get(item) || 0) + 1);
        currentTotal += item;
    }

    const modificationRounds = parseInt(inputLines.shift(), 10);

    inputLines.pop();

    for (let roundCounter = 0; roundCounter < modificationRounds; ++roundCounter) {
        const transformSpecification = inputLines[roundCounter].split(' ');
        const targetValue = parseInt(transformSpecification[0], 10);
        const replacementValue = parseInt(transformSpecification[1], 10);

        if (currentTotal > 0 && !elementFrequencies.has(targetValue)) {
            process.stdout.write(`${currentTotal}\n`);
            continue;
        }

        if (elementFrequencies.has(targetValue)) {
            const occurrenceCount = elementFrequencies.get(targetValue);

            currentTotal -= occurrenceCount * targetValue;
            currentTotal += occurrenceCount * replacementValue;

            elementFrequencies.delete(targetValue);
            elementFrequencies.set(replacementValue, (elementFrequencies.get(replacementValue) || 0) + occurrenceCount);
        }

        process.stdout.write(`${currentTotal}\n`);
    }
});