function processInputAndCalculate(dataLines) {
    const numericTarget = parseInt(dataLines[0], 10);

    let currentSum = 0;
    let iterationCount = 0;

    while (currentSum < numericTarget) {
        iterationCount++;
        currentSum += iterationCount;
    }

    console.log(iterationCount);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
