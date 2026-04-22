let collectedInput = '';
let inputProcessed = false;

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunkOfData) => {
    collectedInput += chunkOfData;
});

process.stdin.on('end', () => {
    if (inputProcessed) return;
    inputProcessed = true;

    const allRecords = collectedInput.trim().split('\n');
    const firstRecordSegments = allRecords[0].split(' ');

    const initialValue = BigInt(firstRecordSegments[0]);
    const divisorValue = BigInt(firstRecordSegments[1]);

    let outcome;

    const currentRemainder = initialValue % divisorValue;

    if (currentRemainder === BigInt(0)) {
        outcome = BigInt(0);
    } else {
        const complementaryRemainder = divisorValue - currentRemainder;
        outcome = currentRemainder < complementaryRemainder ? currentRemainder : complementaryRemainder;
    }

    process.stdout.write(outcome.toString() + '\n');
});

process.stdin.resume();