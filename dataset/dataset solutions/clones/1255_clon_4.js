process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (inputBuffer) {
    const processedLines = inputBuffer.split("\n").filter(Boolean);

    const elementCount = Number(processedLines[0]);
    const rawNumericStrings = processedLines[1].split(" ");

    const numericValuesToProcess = rawNumericStrings.slice(0, elementCount).map(Number);

    const initialAccumulator = {
        minimumValue: numericValuesToProcess[0],
        maximumValue: numericValuesToProcess[0],
        totalSum: numericValuesToProcess[0]
    };

    const finalStatistics = numericValuesToProcess.slice(1).reduce((accumulator, currentValue) => ({
        minimumValue: Math.min(accumulator.minimumValue, currentValue),
        maximumValue: Math.max(accumulator.maximumValue, currentValue),
        totalSum: accumulator.totalSum + currentValue
    }), initialAccumulator);

    console.log(`${finalStatistics.minimumValue} ${finalStatistics.maximumValue} ${finalStatistics.totalSum}`);
});
