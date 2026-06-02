const calculatePermutations = (upperBound, count) => {
    if (count < 0 || count > upperBound) return 0;
    return Array.from({ length: count }, (_, index) => upperBound - index)
                .reduce((product, value) => product * value, 1);
};

const calculateCombinations = (totalItems, chosenItems) => {
    // Replicating the original's formula: P(n,r) / P(r,r)
    return calculatePermutations(totalItems, chosenItems) / calculatePermutations(chosenItems, chosenItems);
};

const collectedLines = [];
const inputInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputInterface.on('line', (currentInputLine) => {
    collectedLines.push(currentInputLine);
});

inputInterface.on('close', () => {
    const [configLine, dataLine] = collectedLines;

    const [itemCountStr, minSelectionStr, maxSelectionStr] = configLine.split(" ");
    const itemCount = Number(itemCountStr);
    const minSelection = Number(minSelectionStr);
    const maxSelection = Number(maxSelectionStr);

    const dataValues = dataLine.split(" ").map(Number);

    dataValues.sort((valA, valB) => valB - valA);

    const topValuesSum = dataValues.slice(0, minSelection)
                                   .reduce((sumAccumulator, currentVal) => sumAccumulator + currentVal, 0);
    const highestAverage = topValuesSum / minSelection;
    console.log(highestAverage);

    let waysToSelect;

    if (dataValues[0] !== dataValues[minSelection]) {
        waysToSelect = 1;
    } else {
        waysToSelect = Array.from({ length: maxSelection }, (_, index) => index + 1)
                            .reduce((totalWaysAccumulator, currentJ) =>
                                totalWaysAccumulator + calculateCombinations(50, currentJ), 0);
    }
    console.log(waysToSelect);
});
