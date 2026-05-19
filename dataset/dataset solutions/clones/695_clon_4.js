let inputData = '';
process.stdin.on('data', chunk => {
    inputData += chunk;
});

process.stdin.on('end', () => {
    const tokens = inputData.trim().split(/\s+/);
    let tokenPointer = 0;

    const retrieveNextInteger = () => parseInt(tokens[tokenPointer++], 10);

    while (true) {
        const deckSize = retrieveNextInteger();
        const operationCount = retrieveNextInteger();

        if (operationCount === 0 && deckSize === 0) {
            break;
        }

        let currentDeck = Array.from({ length: deckSize }, (_, index) => deckSize - index);

        for (let opIndex = 0; opIndex < operationCount; opIndex++) {
            const cutPoint = retrieveNextInteger() - 1;
            const moveLength = retrieveNextInteger();

            const segmentA = currentDeck.slice(0, cutPoint);
            const segmentB = currentDeck.slice(cutPoint, cutPoint + moveLength);
            const segmentC = currentDeck.slice(cutPoint + moveLength);

            currentDeck = [...segmentB, ...segmentA, ...segmentC];
        }

        process.stdout.write(currentDeck[0] + '\n');
    }
});
