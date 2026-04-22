function processInputData(inputRawString) {
    const allLines = inputRawString.split('\n').filter(Boolean);

    function analyzeDataBlocks(currentDataSet) {
        if (currentDataSet.length === 0) {
            return [];
        }

        const blockParameters = currentDataSet[0].split(' ').map(Number);
        const [numEntries, targetIdx, percentReduction] = blockParameters;

        if (numEntries === 0 && targetIdx === 0 && percentReduction === 0) {
            return [];
        }

        const entryValueStrings = currentDataSet.slice(1, 1 + numEntries);
        const entryNumericValues = entryValueStrings.map(Number);

        const overallPoints = entryNumericValues.reduce((accumulator, currentValue) => accumulator + currentValue * 100, 0);
        const focalItemValue = entryNumericValues[targetIdx - 1];

        const adjustedOverallPoints = overallPoints * (100 - percentReduction) / 100;

        let finalOutcome;
        if (focalItemValue > 0) {
            finalOutcome = Math.floor(adjustedOverallPoints / focalItemValue);
        } else {
            finalOutcome = 0;
        }

        const remainingData = currentDataSet.slice(1 + numEntries);
        return [finalOutcome, ...analyzeDataBlocks(remainingData)];
    }

    const allOutcomes = analyzeDataBlocks(allLines);

    allOutcomes.forEach(result => console.log(result.toString()));
}

const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(systemInput);