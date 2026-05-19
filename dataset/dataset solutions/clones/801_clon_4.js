const getRawInputData = () => require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputRecords = getRawInputData().trim().split("\n");

function processNextDataSet(remainingRecords) {
    if (remainingRecords.length === 0) {
        return;
    }

    const [currentHeaderLine, ...subsequentRecords] = remainingRecords;
    const [countN, indexM, percentageP] = currentHeaderLine.split(" ").map(Number);

    if (countN === 0 && indexM === 0 && percentageP === 0) {
        return;
    }

    const zeroBasedIndex = indexM - 1;

    const currentCaseNumericValues = subsequentRecords.slice(0, countN).map(Number);

    const accumulatedScore = currentCaseNumericValues.reduce((accumulator, currentVal) => accumulator + (currentVal * 100), 0);

    const finalAdjustedScore = accumulatedScore * (100 - percentageP) / 100;

    const targetDivisor = currentCaseNumericValues[zeroBasedIndex];
    
    const calculatedOutcome = (targetDivisor !== 0) ? Math.floor(finalAdjustedScore / targetDivisor) : 0;

    console.log(calculatedOutcome);

    processNextDataSet(subsequentRecords.slice(countN));
}

processNextDataSet(allInputRecords);
