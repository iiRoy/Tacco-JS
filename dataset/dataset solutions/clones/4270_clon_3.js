process.stdin.resume();
process.stdin.setEncoding('utf8');

let fullStreamAccumulator = '';

process.stdin.on('data', (dataChunk) => {
    fullStreamAccumulator += dataChunk;
});

function safeParseInteger(stringValue) {
    const parsedValue = parseInt(stringValue.trim(), 10);
    if (isNaN(parsedValue)) {
        console.error(`[ERROR] Unable to convert "${stringValue.trim()}" to an integer. Defaulting to 0.`);
        return 0;
    }
    return parsedValue;
}

process.stdin.on('end', () => {
    const rawInputLines = fullStreamAccumulator.split(/\r?\n/);
    const cleanInputLines = rawInputLines.filter(line => line.trim().length > 0);

    initiateProcessing(cleanInputLines);
});

function initiateProcessing(receivedLines) {
    if (receivedLines.length < 2) {
        console.error('[FATAL] Not enough input data provided. Expected at least two lines.');
        process.exit(1);
    }

    const primaryInputValue = safeParseInteger(receivedLines[0]);
    const secondaryInputValue = safeParseInteger(receivedLines[1]);

    const doubledSecondary = secondaryInputValue * 2;
    const finalCalculatedMetric = doubledSecondary - primaryInputValue;

    console.log(finalCalculatedMetric);
}