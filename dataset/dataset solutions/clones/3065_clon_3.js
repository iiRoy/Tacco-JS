function processInputData(rawInputString) {
    const parseNumericLine = (lineContent) => parseInt(lineContent, 10);

    const inputLines = rawInputString.split("\n");
    const parsedNumbers = inputLines.map(parseNumericLine);

    let targetIndex = 0;
    let minNonZeroRemainder = parsedNumbers[0] % 10;

    const fixedItemCount = 5;

    for (let currentIndex = 0; currentIndex < fixedItemCount; currentIndex++) {
        const currentNumberRemainder = parsedNumbers[currentIndex] % 10;

        if (currentNumberRemainder === 0) {
            continue;
        }

        if (currentNumberRemainder < minNonZeroRemainder) {
            minNonZeroRemainder = currentNumberRemainder;
            targetIndex = currentIndex;
        }
    }

    const roundUpToNearestTen = (valueToRound) => Math.ceil(valueToRound / 10) * 10;

    let finalCalculatedSum = 0;

    for (let currentIndex = 0; currentIndex < fixedItemCount; currentIndex++) {
        const currentNumber = parsedNumbers[currentIndex];
        let itemContribution;

        if (currentIndex === targetIndex) {
            itemContribution = currentNumber;
        } else {
            itemContribution = roundUpToNearestTen(currentNumber);
        }
        finalCalculatedSum += itemContribution;
    }

    console.log(finalCalculatedSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
