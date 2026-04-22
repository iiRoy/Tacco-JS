function* generateArrangements(availableItems, choiceCount) {
    if (choiceCount === 0) {
        yield [];
        return;
    }

    if (availableItems.length === 0 || choiceCount < 0) {
        return;
    }

    for (let itemIndex = 0; itemIndex < availableItems.length; itemIndex++) {
        const selectedItem = availableItems[itemIndex];
        const remainingItems = availableItems.filter((_, idx) => idx !== itemIndex);

        for (const subArrangement of generateArrangements(remainingItems, choiceCount - 1)) {
            yield [selectedItem, ...subArrangement];
        }
    }
}

const sourceCollection = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function processDataEntry(dataBlock) {
    if (dataBlock.trim() === '') {
        return null;
    }

    const numericParts = dataBlock.split(' ').map(parseFloat);
    const requiredLength = numericParts[0];
    const desiredValue = numericParts[1];

    let tally = 0;

    for (const currentArrangement of generateArrangements(sourceCollection, requiredLength)) {
        let computedValue = 0;
        for (let positionIndex = 0; positionIndex < currentArrangement.length; positionIndex++) {
            const entryValue = currentArrangement[positionIndex];
            computedValue += entryValue * (positionIndex + 1);
        }

        if (computedValue === desiredValue) {
            tally++;
        }
    }
    return tally;
}

var collectedData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    collectedData += chunk;
});

process.stdin.on('end', function() {
    const dataRows = collectedData.split('\n');

    for (const row of dataRows) {
        const outcome = processDataEntry(row);
        if (outcome !== null) {
            console.log(outcome);
        }
    }
});