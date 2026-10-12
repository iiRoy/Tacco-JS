var inputLines = [];
var lineReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineReader.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

lineReader.on('close', function () {
    const [arraySize, initialModulo] = inputLines[0].split(" ").map(Number);
    const dataElements = inputLines[1].split(" ").map(Number);

    const initialAccumulator = {
        currentAccumulatedSum: 0,
        prefixSumFrequencies: new Map([[0, 1]]),
        subArrayCount: 0,
    };

    const finalResult = dataElements.reduce((accumulator, elementValue) => {
        accumulator.currentAccumulatedSum = (accumulator.currentAccumulatedSum + elementValue) % initialModulo;

        const currentSumFrequency = accumulator.prefixSumFrequencies.get(accumulator.currentAccumulatedSum) || 0;

        accumulator.subArrayCount += currentSumFrequency;

        accumulator.prefixSumFrequencies.set(accumulator.currentAccumulatedSum, currentSumFrequency + 1);

        return accumulator;
    }, initialAccumulator);

    console.log(finalResult.subArrayCount);
});
