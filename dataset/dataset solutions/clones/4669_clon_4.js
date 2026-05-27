const inputBuffer = [];
const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', (currentLine) => {
    inputBuffer.push(currentLine);
});

inputReader.on('close', () => {
    const determineCombinations = (n, k) => {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;

        let result = 1;
        for (let i = 1; i <= k; i++) {
            result = result * (n - i + 1) / i;
        }
        return Math.round(result);
    };

    const [totalItemsStr, minSelectionStr, maxSelectionStr] = inputBuffer.shift().split(" ");
    const totalItems = Number(totalItemsStr);
    const minSelection = Number(minSelectionStr);
    const maxSelection = Number(maxSelectionStr);

    const itemValues = inputBuffer.shift().split(" ").map(Number);

    itemValues.sort((valA, valB) => valB - valA);

    const peakAverage = itemValues.slice(0, minSelection)
                                  .reduce((sum, val) => sum + val, 0) / minSelection;
    console.log(peakAverage);

    const valueCounts = itemValues.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});

    let selectionWays = 0;

    if (itemValues[0] !== itemValues[minSelection]) {
        const thresholdValue = itemValues[minSelection - 1];
        let countOfValuesAboveThreshold = 0;
        for (let i = 0; i < totalItems; i++) {
            if (itemValues[i] > thresholdValue) {
                countOfValuesAboveThreshold++;
            } else {
                break;
            }
        }
        const neededFromThresholdValue = minSelection - countOfValuesAboveThreshold;
        selectionWays = determineCombinations(valueCounts[thresholdValue], neededFromThresholdValue);
    } else {
        const countOfTopValue = valueCounts[itemValues[0]];
        for (let k = minSelection; k <= maxSelection; k++) {
            selectionWays += determineCombinations(countOfTopValue, k);
        }
    }
    console.log(selectionWays);
});
