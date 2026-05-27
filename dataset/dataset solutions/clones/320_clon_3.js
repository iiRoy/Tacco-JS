function parseNextInteger(linesArray, indexReference) {
    const value = parseInt(linesArray[indexReference.value].trim());
    indexReference.value++;
    return value;
}

function processDataEntries(linesArray, startIndexRef, count) {
    const nameToTotalMap = new Map();

    for (let entryCounter = 0; entryCounter < count; ++entryCounter) {
        const currentEntryParts = linesArray[startIndexRef.value].trim().split(" ");
        startIndexRef.value++;

        const entryName = currentEntryParts[0];
        const quantity = parseInt(currentEntryParts[1]);
        const price = parseInt(currentEntryParts[2]);
        const entryProduct = quantity * price;

        nameToTotalMap.set(entryName, (nameToTotalMap.get(entryName) || 0) + entryProduct);
    }
    return nameToTotalMap;
}

function reportHighValueEntries(dataMap) {
    let hasQualifiedOutput = false;
    const MIN_QUALIFYING_AMOUNT = 1000000;

    for (const [itemName, totalValue] of dataMap.entries()) {
        if (totalValue >= MIN_QUALIFYING_AMOUNT) {
            console.log(itemName);
            hasQualifiedOutput = true;
        }
    }

    if (!hasQualifiedOutput) {
        console.log("NA");
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputBuffer){
    const inputLines = inputBuffer.trim().split("\n");
    const lineIndexRef = { value: 0 };

    while (lineIndexRef.value < inputLines.length) {
        const numEntriesToProcess = parseNextInteger(inputLines, lineIndexRef);

        if (numEntriesToProcess === 0) {
            break;
        } else {
            const aggregatedAmounts = processDataEntries(inputLines, lineIndexRef, numEntriesToProcess);
            reportHighValueEntries(aggregatedAmounts);
        }
    }
});
