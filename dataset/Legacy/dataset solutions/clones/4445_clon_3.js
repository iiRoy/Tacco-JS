function processInput(rawData) {
    const NEWLINE_SEPARATOR = "\n";
    const VALUE_SEPARATOR = " ";

    rawData = rawData.trim();
    const parsedLines = rawData.split(NEWLINE_SEPARATOR);

    const dataLength = parseInt(parsedLines[0], 10);
    const numberSequence = parsedLines[1].split(VALUE_SEPARATOR).map(Number);

    let countMultiplesOfFour = 0;
    let countMultiplesOfTwoOnly = 0;

    numberSequence.forEach(currentValue => {
        const isDivisibleByTwo = (currentValue % 2 === 0);
        const isDivisibleByFour = (currentValue % 4 === 0);

        if (isDivisibleByFour) {
            countMultiplesOfFour++;
        } else if (isDivisibleByTwo) {
            countMultiplesOfTwoOnly++;
        }
    });

    const evaluateCondition = (totalLength, foursCount, twosOnlyCount) => {
        const targetPairsNeeded = Math.floor(totalLength / 2);

        if (foursCount >= targetPairsNeeded) {
            return true;
        } else {
            const deficitInFours = targetPairsNeeded - foursCount;
            const requiredTwosForDeficit = deficitInFours * 2;
            return twosOnlyCount >= requiredTwosForDeficit;
        }
    };

    const finalOutcome = evaluateCondition(dataLength, countMultiplesOfFour, countMultiplesOfTwoOnly) ? "Yes" : "No";

    console.log(finalOutcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
