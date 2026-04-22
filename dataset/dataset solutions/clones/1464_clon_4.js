let collectedInput = '';

process.stdin.on('data', (inputChunk) => {
    collectedInput += inputChunk.toString();
});

process.stdin.on('end', () => {
    const processedLines = collectedInput.trim().split('\n');

    const primarySet = processedLines[1].split(' ').reduce((accumulator, currentElement) => {
        accumulator.add(currentElement);
        return accumulator;
    }, new Set());

    const finalResult = processedLines[3].split(' ').reduce((counter, currentElement) => {
        if (primarySet.has(currentElement)) {
            return counter + 1;
        }
        return counter;
    }, 0);

    process.stdout.write(String(finalResult) + '\n');
});

process.stdin.resume();