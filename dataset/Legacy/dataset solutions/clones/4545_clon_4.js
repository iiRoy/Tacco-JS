function Main(inputContent) {
    const dataLines = inputContent.split("\n");
    const initialLineParts = dataLines[0].split(" ");
    const totalNumbersToProcess = Number(initialLineParts[0]);

    const processingResult = dataLines.slice(1, totalNumbersToProcess + 1).reduce((accumulator, currentEntryString) => {
        const currentNumericValue = Number(currentEntryString);

        accumulator.sumOfAllValues += currentNumericValue;

        if (currentNumericValue % 10 !== 0 && currentNumericValue < accumulator.smallestNonTenMultiple) {
            accumulator.smallestNonTenMultiple = currentNumericValue;
        }

        if (currentEntryString.length >= 2 && currentEntryString[1] === '0') {
            accumulator.countOfSecondDigitZero++;
        }

        return accumulator;
    }, {
        sumOfAllValues: 0,
        smallestNonTenMultiple: 1000,
        countOfSecondDigitZero: 0
    });

    const { sumOfAllValues, smallestNonTenMultiple, countOfSecondDigitZero } = processingResult;

    if (sumOfAllValues % 10 !== 0) {
        console.log(sumOfAllValues);
    } else {
        if (countOfSecondDigitZero === totalNumbersToProcess) {
            console.log(0);
        } else {
            console.log(sumOfAllValues - smallestNonTenMultiple);
        }
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
