function parseNumericPair(lineString) {
    return lineString.split(" ").map(Number);
}

function handleSingleCase(dataLinesBuffer) {
    const numberOfItems = Number(dataLinesBuffer.shift());

    if (numberOfItems === 0) {
        return false;
    }

    let itemCollection = [];
    let totalInitialWeight = 0;

    for (let itemIndex = 0; itemIndex < numberOfItems; itemIndex++) {
        const currentItemPair = parseNumericPair(dataLinesBuffer.shift());
        itemCollection.push(currentItemPair);
        totalInitialWeight += currentItemPair[0];
    }

    itemCollection.sort((firstPair, secondPair) => {
        const valueOfFirst = firstPair[1];
        const valueOfSecond = secondPair[1];
        return valueOfSecond - valueOfFirst;
    });

    let outcomeMessage = "YES";

    for (let itemIndex = 0; itemIndex < itemCollection.length; itemIndex++) {
        const itemForCheck = itemCollection[itemIndex];
        if (totalInitialWeight > itemForCheck[1]) {
            outcomeMessage = "NO";
            break;
        }
        totalInitialWeight -= itemForCheck[0];
    }

    console.log(outcomeMessage);
    return true;
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputDataLines = rawInputContent.trim().split("\n");

while (handleSingleCase(inputDataLines)) {
    // Continue processing test cases until handleSingleCase returns false (when numberOfItems is 0)
}
