let inputBuffer = '';

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk.toString();
});

process.stdin.on('end', () => {
    const dataLines = inputBuffer.split('\n').filter(line => line.trim() !== '');

    let lineIndexCursor = 0;

    const firstCollectionSize = Number(dataLines[lineIndexCursor++]);
    const firstCollection = new Map();

    for (let currentItem = 0; currentItem < firstCollectionSize; currentItem++) {
        const itemComponents = dataLines[lineIndexCursor++].split(' ');
        const componentA = Number(itemComponents[0]);
        const componentB = Number(itemComponents[1]);
        firstCollection.set(currentItem, [componentA, componentB]);
    }

    const secondCollectionSize = Number(dataLines[lineIndexCursor++]);
    const secondCollection = [];

    for (let currentItem = 0; currentItem < secondCollectionSize; currentItem++) {
        const itemComponents = dataLines[lineIndexCursor++].split(' ');
        const initialReferenceAdjusted = Number(itemComponents[0]) - 1;
        const weightLimit = Number(itemComponents[1]);
        secondCollection.push([initialReferenceAdjusted, weightLimit]);
    }

    const finalOutput = [];

    // Recursive function to perform the path accumulation logic
    // currentReference: Corresponds to 'x' in original
    // maxAllowedWeight: Corresponds to 'L' in original
    // historicalWeight: Corresponds to 'w' at the start of the original loop iteration
    // dataSource: Corresponds to 'v' in original
    function calculateAccumulatedValue(currentReference, maxAllowedWeight, historicalWeight, dataSource) {
        // This condition mirrors the `w <= L` loop condition in the original code,
        // which checks `w` (historicalWeight) at the beginning of an iteration.
        if (historicalWeight > maxAllowedWeight) {
            return 0; // If accumulated weight from previous steps already exceeds limit, stop.
        }

        const currentEntry = dataSource.get(currentReference);
        if (!currentEntry) {
            return 0; // Should not happen with valid inputs based on problem context
        }

        const entryValue = currentEntry[0]; // Corresponds to v[x][0]
        const entryWeight = currentEntry[1]; // Corresponds to v[x][1]

        let currentIterationValue = 0;
        const newHistoricalWeight = historicalWeight + entryWeight; // Update cumulative weight

        // This condition mirrors `if(w<=L)val+=v[x][0];`
        if (newHistoricalWeight <= maxAllowedWeight) {
            currentIterationValue = entryValue;
        }

        // This condition mirrors `if(x==0)break;`
        if (currentReference === 0) {
            return currentIterationValue; // No further traversal if current reference is 0
        }

        // This calculation mirrors `x>>=1`
        const nextReference = Math.floor(currentReference / 2);

        // Recursive call for the next node in the path
        return currentIterationValue + calculateAccumulatedValue(nextReference, maxAllowedWeight, newHistoricalWeight, dataSource);
    }

    for (let queryIndex = 0; queryIndex < secondCollectionSize; queryIndex++) {
        const currentQuery = secondCollection[queryIndex];
        const startingNode = currentQuery[0]; // Corresponds to v2[i][0]
        const weightThreshold = currentQuery[1]; // Corresponds to v2[i][1]

        // Initiate the recursive calculation with a starting historical weight of 0
        const queryResult = calculateAccumulatedValue(startingNode, weightThreshold, 0, firstCollection);
        finalOutput.push(queryResult);
    }

    process.stdout.write(finalOutput.join('\n') + '\n');
});