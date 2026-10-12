var inputLines = [];
var readline = require('readline');

var inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (lineContent) {
    inputLines.push(lineContent);
});

inputReader.on('close', function () {
    const [totalElements, minSelection, maxSelection] = inputLines.shift().split(" ").map(Number);
    const numericValues = inputLines.shift().split(" ").map(Number);

    numericValues.sort((valA, valB) => valB - valA);

    const valueFrequencies = numericValues.reduce((accumulator, currentVal) => {
        accumulator[currentVal] = (accumulator[currentVal] || 0) + 1;
        return accumulator;
    }, {});

    const sumOfTopElements = numericValues.slice(0, minSelection).reduce((sum, val) => sum + val, 0);
    const highestAverage = sumOfTopElements / minSelection;
    console.log(highestAverage);

    const calculateCombinationsAlt = (nVal, kVal) => {
        if (kVal < 0 || kVal > nVal) return 0;
        if (kVal === 0 || kVal === nVal) return 1;
        if (kVal > nVal / 2) kVal = nVal - kVal;

        let result = 1;
        for (let i = 1; i <= kVal; ++i) {
            result = result * (nVal - i + 1) / i;
        }
        return result;
    };

    let totalCombinationWays = 0;

    if (numericValues[0] === numericValues[maxSelection - 1]) {
        const commonValue = numericValues[0];
        const commonValueCount = valueFrequencies[commonValue];

        totalCombinationWays = Array.from({ length: maxSelection - minSelection + 1 }, (_, idx) => minSelection + idx)
                                 .reduce((acc, selectCount) => acc + calculateCombinationsAlt(commonValueCount, selectCount), 0);
    } else {
        const topSelectedValues = numericValues.slice(0, minSelection);
        const topSelectionFrequencies = topSelectedValues.reduce((accumulator, currentVal) => {
            accumulator[currentVal] = (accumulator[currentVal] || 0) + 1;
            return accumulator;
        }, {});

        totalCombinationWays = Object.entries(topSelectionFrequencies).reduce((acc, [valStr, neededCount]) => {
            const val = Number(valStr);
            const availableCount = valueFrequencies[val];
            return acc * calculateCombinationsAlt(availableCount, neededCount);
        }, 1);
    }
    console.log(totalCombinationWays);
});
