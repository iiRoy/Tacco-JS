process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedInput = '';

process.stdin.on('data', (chunk) => {
    accumulatedInput += chunk;
});

process.stdin.on('end', () => {
    const inputLines = accumulatedInput.split('\n');
    const outputCollection = [];

    while (inputLines[0] !== '0') {
        const currentBlock = inputLines.splice(0, 5);

        const distinctItems = Array.from(new Set(currentBlock));

        const logicMap = new Map([
            [1, () => [3, 3, 3]],
            [2, () => [1, 2, 0]],
            [3, () => [3, 3, 3]],
            [0, () => [1, 2, 0]], // Handles empty block, falls into original's 'else'
            [4, () => [1, 2, 0]], // Handles blocks with 4 distinct items, falls into original's 'else'
            [5, () => [1, 2, 0]], // Handles blocks with 5 distinct items, falls into original's 'else'
        ]);

        const outcomeArray = logicMap.has(distinctItems.length)
            ? logicMap.get(distinctItems.length)()
            : [1, 2, 0]; // Default for any other length, matching original's 'else' branch

        currentBlock.forEach(valString => {
            outputCollection.push(outcomeArray[Number(valString) - 1]);
        });
    }
    console.log(outputCollection.join('\n'));
});
