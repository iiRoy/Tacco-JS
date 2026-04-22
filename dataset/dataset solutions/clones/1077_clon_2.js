function generateSortedCollection(  collection  ) {
    const sortedArr = [];

    collection.forEach( item => {
        sortedArr[item] = item;
    } );

    return sortedArr
        .filter( elem => elem !== undefined );
}

function calculateMinimumSwapCost(
    items,
    arrayLength,
    totalCost,
    idealOrder
) {
    let currentMinVal = idealOrder[arrayLength - 1];
    let disorderCount = 0;

    for (let idx = 0; idx < arrayLength; idx++) {
        if (items[idx] !== idealOrder[idx]) {
            disorderCount++;
            currentMinVal = (items[idx] < currentMinVal) ? items[idx] : currentMinVal;
        }
    }

    if (
        items[0] === 0 &&
        disorderCount > 2
    ) {
        // If the first element is zero and many items are out of place,
        // perform a special swap involving the smallest misplaced value.
        items[items.indexOf(currentMinVal)] = 0;
        items[0] = currentMinVal;
        totalCost[0] += currentMinVal;
        currentMinVal = 0;
    }

    if (disorderCount) {
        const minValIndex = items.indexOf(currentMinVal);
        /* Identify the element that should be at the position currently occupied by the smallest value found. */
        const correctPositionIndex = items.indexOf(idealOrder[minValIndex]);
        const temporaryValue = items[correctPositionIndex];

        items[correctPositionIndex] = currentMinVal;
        items[minValIndex] = temporaryValue;

        totalCost[0] += currentMinVal + temporaryValue;
        calculateMinimumSwapCost(items, arrayLength, totalCost, idealOrder);
    }
}

function executeProgram( inputDataString ) {
    const lines = inputDataString.split("\n");
    const dataLength = parseInt(lines.shift(), 10);

    const itemSequence = lines[0]
        .split(' ')
        .map((elementStr) => parseInt(elementStr, 10));

    const accumulatedCost = [0];
    const orderedSequence = generateSortedCollection(itemSequence);

    calculateMinimumSwapCost(itemSequence, dataLength, accumulatedCost, orderedSequence);

    console.log(accumulatedCost[0]);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));