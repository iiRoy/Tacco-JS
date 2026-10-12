const { stdin: dataInput, stdout: textOutput } = require('process');

let accumulatedData = '';

dataInput.on('data', (receivedFragment) => {
    accumulatedData += receivedFragment.toString();
});

dataInput.on('end', () => {
    const inputNumber = parseInt(accumulatedData.trim(), 10);

    let searchLow = 0;
    let searchHigh = inputNumber;
    let foundRootCandidate = 0;

    while (searchLow <= searchHigh) {
        const pivotPoint = Math.floor((searchLow + searchHigh) / 2);
        const pivotSquared = pivotPoint * pivotPoint;

        if (pivotSquared <= inputNumber) {
            foundRootCandidate = pivotPoint;
            searchLow = pivotPoint + 1;
        } else {
            searchHigh = pivotPoint - 1;
        }
    }

    const finalOutputValue = foundRootCandidate * foundRootCandidate;

    textOutput.write(`${finalOutputValue}\n`);
});