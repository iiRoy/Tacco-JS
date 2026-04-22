let currentDynamicValue = 'A';

const DATA_FIELD_SEPARATOR = ',';

process.stdin.resume();

process.stdin.setEncoding('utf8');

let segmentProcessingCount = 0;

const determineNextValue = (firstCandidate, secondCandidate, activeValue) => {
    if (firstCandidate === activeValue) {
        return secondCandidate;
    } else if (secondCandidate === activeValue) {
        return firstCandidate;
    }
    return activeValue;
};

process.stdin.on('data', (inputBuffer) => {
    segmentProcessingCount++;

    if (!inputBuffer || typeof inputBuffer !== 'string' || inputBuffer.trim().length === 0) {
        return;
    }

    const parsedTokens = inputBuffer.trim().split(DATA_FIELD_SEPARATOR);

    if (parsedTokens.length < 2) {
        return;
    }

    const primaryToken = parsedTokens[0].trim();
    const secondaryToken = parsedTokens[1].trim();

    currentDynamicValue = determineNextValue(primaryToken, secondaryToken, currentDynamicValue);
});

process.stdin.on('end', () => {
    console.log(currentDynamicValue);
});

process.stdin.on('error', (err) => {
    // Error handling can be added here if needed,
    // for example, console.error('Input stream error:', err.message);
});