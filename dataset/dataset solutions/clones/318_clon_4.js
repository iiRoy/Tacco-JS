process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingContent){
    const fullLineSet = incomingContent.trim().split('\n');
    let currentLinePointer = 0;

    const traverseInputBlocks = (sourceLines, blockStartIdx) => {
        const numberOfEntriesInBlock = Number(sourceLines[blockStartIdx]);

        if (numberOfEntriesInBlock === 0) {
            return;
        }

        const currentBlockData = sourceLines.slice(blockStartIdx + 1, blockStartIdx + 1 + numberOfEntriesInBlock);

        const aggregatedFinancials = currentBlockData.reduce((accumulatorMap, entryString) => {
            const entryComponents = entryString.trim().split(' ');
            const personIdentifier = Number(entryComponents[0]);
            const quantityVal = Number(entryComponents[1]);
            const priceVal = Number(entryComponents[2]);
            const transactionValue = quantityVal * priceVal;
            
            const existingTotal = accumulatorMap.get(personIdentifier) || 0;
            accumulatorMap.set(personIdentifier, existingTotal + transactionValue);
            return accumulatorMap;
        }, new Map());

        const highEarners = Array.from(aggregatedFinancials.entries())
            .filter(([, totalRevenue]) => totalRevenue >= 1000000)
            .map(([individualId,]) => individualId)
            .sort((idOne, idTwo) => idOne - idTwo);

        if (highEarners.length > 0) {
            console.log(highEarners.join('\n'));
        } else {
            console.log('NA');
        }

        traverseInputBlocks(sourceLines, blockStartIdx + 1 + numberOfEntriesInBlock);
    };

    traverseInputBlocks(fullLineSet, currentLinePointer);
});