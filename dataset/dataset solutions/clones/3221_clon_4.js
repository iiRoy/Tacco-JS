function processInputData(dataPayload) {
    const numberSequenceString = dataPayload.split(/\r?\n/)[1];
    const parsedNumbers = numberSequenceString.match(/\d+/g).map(Number);

    const peakValue = Math.max(...parsedNumbers);
    const aggregateSum = parsedNumbers.reduce((currentTotal, item) => currentTotal + item, 0);
    const sumOfRemaining = aggregateSum - peakValue;

    const resultOutcomes = new Map();
    resultOutcomes.set(true, "Yes");
    resultOutcomes.set(false, "No");

    console.log(resultOutcomes.get(peakValue < sumOfRemaining));
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));