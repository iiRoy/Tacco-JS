process.stdin.resume();
process.stdin.setEncoding('utf8');

let completeInputBuffer = '';

process.stdin.on('data', function(incomingChunk) {
    completeInputBuffer += incomingChunk;
});

process.stdin.on('end', function() {
    const allTextFragments = completeInputBuffer.split(/\r?\n/);
    
    const relevantFragments = allTextFragments.length > 0 && allTextFragments[allTextFragments.length - 1] === ''
                               ? allTextFragments.slice(0, -1)
                               : allTextFragments;

    if (relevantFragments.length === 0) {
        process.stdout.write("0\n");
        return;
    }

    const numericalInstruction = parseInt(relevantFragments[0], 10);

    const itemsToProcess = [];
    for (let currentSlotIndex = 1; currentSlotIndex <= numericalInstruction; currentSlotIndex++) {
        itemsToProcess.push(relevantFragments[currentSlotIndex]);
    }

    const uniqueItemRegistry = itemsToProcess.reduce((accumulatorObject, currentEntry) => {
        accumulatorObject[currentEntry] = true;
        return accumulatorObject;
    }, {});

    const totalDistinctItems = Object.keys(uniqueItemRegistry).length;

    process.stdout.write(totalDistinctItems.toString() + '\n');
});