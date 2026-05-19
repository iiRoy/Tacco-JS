var storedLines = [];

const inputModule = require('readline');

const lineProcessor = inputModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineProcessor.on('line', function (currentInputLine) {
    storedLines.push(currentInputLine);
});

lineProcessor.on("close", function () {
    const MAX_ITERATION_LIMIT = 999;
    const firstLineContent = storedLines[0];
    const numberStrings = firstLineContent.split(" ");

    const valueA = Number(numberStrings[0]);
    const valueB = Number(numberStrings[1]);

    const difference = valueB - valueA;
    const cumulativeSums = new Array(MAX_ITERATION_LIMIT + 1).fill(0);

    for (let currentIdx = 1; currentIdx <= MAX_ITERATION_LIMIT; currentIdx++) {
        cumulativeSums[currentIdx] = cumulativeSums[currentIdx - 1] + currentIdx;
        if (difference === currentIdx) {
            console.log(cumulativeSums[currentIdx] - valueB);
            return 0;
        }
    }
});
