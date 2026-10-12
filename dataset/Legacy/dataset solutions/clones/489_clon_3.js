const MAX_WEIGHT_THRESHOLD = 150;

function checkIntervalOverlap(rangeAStart, rangeAEnd, rangeBStart, rangeBEnd) {
    return rangeAStart <= rangeBEnd && rangeAEnd >= rangeBStart;
}

function parseItemDetails(itemLineString) {
    return itemLineString.split(" ").map(Number);
}

function executeDataSetProcessing(numberOfEntries, dataLinesForSet) {
    let currentOperationStatus = "OK";
    const collectionOfItems = [];

    for (let itemIndex = 0; itemIndex < numberOfEntries; itemIndex++) {
        const parsedItem = parseItemDetails(dataLinesForSet.shift());
        collectionOfItems.push(parsedItem);
    }

    for (let outerLoopIndex = 0; outerLoopIndex < numberOfEntries; outerLoopIndex++) {
        if (currentOperationStatus === "NG") {
            break;
        }

        let currentItemTotalWeight = collectionOfItems[outerLoopIndex][0];
        const currentItemRangeA = collectionOfItems[outerLoopIndex][1];
        const currentItemRangeB = collectionOfItems[outerLoopIndex][2];

        for (let innerLoopIndex = 0; innerLoopIndex < numberOfEntries; innerLoopIndex++) {
            if (outerLoopIndex === innerLoopIndex) {
                continue;
            }

            const otherItemWeight = collectionOfItems[innerLoopIndex][0];
            const otherItemRangeA = collectionOfItems[innerLoopIndex][1];
            const otherItemRangeB = collectionOfItems[innerLoopIndex][2];

            if (checkIntervalOverlap(currentItemRangeA, currentItemRangeB, otherItemRangeA, otherItemRangeB)) {
                currentItemTotalWeight += otherItemWeight;
            }

            if (currentItemTotalWeight > MAX_WEIGHT_THRESHOLD) {
                currentOperationStatus = "NG";
                break;
            }
        }
    }
    return currentOperationStatus;
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = rawInputContent.trim().split("\n");

let mutableInputLines = [...allInputLines];

while (true) {
    const currentDataSetSize = Number(mutableInputLines.shift());
    if (currentDataSetSize === 0) {
        break;
    }
    const finalResult = executeDataSetProcessing(currentDataSetSize, mutableInputLines);
    console.log(finalResult);
}
