(async () => {
    const readInputContent = async () => {
        let accumulatedData = '';
        for await (const dataChunk of process.stdin) {
            accumulatedData += dataChunk;
        }
        return accumulatedData;
    };

    const parseNumericLine = (lineString) => {
        return lineString.split(/\s/).map(strVal => +strVal);
    };

    const rawInputData = await readInputContent();
    const inputLines = rawInputData.split(/\n/);

    const [itemCount, iterations] = parseNumericLine(inputLines.shift());

    let processedItems = parseNumericLine(inputLines[0])
        .slice(0, itemCount)
        .map(initialVal => [initialVal, initialVal, 1])
        .sort((itemA, itemB) => itemB[1] - itemA[1]);

    for (let iter = 0; iter < iterations; iter++) {
        let currentTopItem = processedItems[0];

        currentTopItem[2]++;
        const newCalculatedValue = currentTopItem[0] / currentTopItem[2];
        currentTopItem[1] = newCalculatedValue;

        let insertionPoint = 1;
        while (processedItems[insertionPoint] && processedItems[insertionPoint][1] > newCalculatedValue) {
            insertionPoint++;
        }

        const remainingItems = processedItems.slice(1);
        remainingItems.splice(insertionPoint - 1, 0, currentTopItem);
        processedItems = remainingItems;
    }

    console.log(Math.ceil(processedItems[0][1]));
})();
