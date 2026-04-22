const categoryThresholds = [
    { limit: 91, identifier: 'heavy' },
    { limit: 81, identifier: 'light heavy' },
    { limit: 75, identifier: 'middle' },
    { limit: 69, identifier: 'light middle' },
    { limit: 64, identifier: 'welter' },
    { limit: 60, identifier: 'light welter' },
    { limit: 57, identifier: 'light' },
    { limit: 54, identifier: 'feather' },
    { limit: 51, identifier: 'bantam' },
    { limit: 48, identifier: 'fly' }
];

function classifyValue(inputNumeric) {
    for (let criterion of categoryThresholds) {
        if (inputNumeric > criterion.limit) {
            return criterion.identifier;
        }
    }
    return 'light fly';
}

let entireInput = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    entireInput += dataChunk;
});

process.stdin.on('end', () => {
    const processedSegments = entireInput.split(/\s+/).filter(Boolean);

    processedSegments.forEach(segmentText => {
        const numericalRepresentation = Number(segmentText);
        const outputCategory = classifyValue(numericalRepresentation);
        process.stdout.write(outputCategory + '\n');
    });
});