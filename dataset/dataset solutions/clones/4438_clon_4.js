function assessNumericCharacteristics(incomingData) {
    const textLines = incomingData.split('\n');
    const totalCount = Number(textLines[0]);
    const numberSeries = textLines[1].split(' ').map(Number);

    const tally = numberSeries.reduce((currentTally, itemValue) => {
        if (itemValue % 2 !== 0) {
            currentTally.oddCounter++;
        } else if (itemValue % 4 === 0) {
            currentTally.fourMultipleCounter++;
        }
        return currentTally;
    }, { oddCounter: 0, fourMultipleCounter: 0 });

    const totalOdds = tally.oddCounter;
    const totalFours = tally.fourMultipleCounter;

    const conditionOne = (totalOdds === 0);
    const conditionTwo = (totalOdds - totalFours <= 0);
    const conditionThree = (totalCount === 3 && (totalOdds - totalFours <= 1) && totalFours > 0);

    const outcome = (conditionOne || conditionTwo || conditionThree) ? "Yes" : "No";

    console.log(outcome);
}

assessNumericCharacteristics(require("fs").readFileSync("/dev/stdin", "utf8"));