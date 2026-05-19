function processInputData(rawData) {
    const lines = rawData.split("\n");
    const ITEM_COUNT = 5;

    const numericValues = [];
    for (let idx = 0; idx < ITEM_COUNT; idx++) {
        const parsedValue = parseInt(lines[idx], 10);
        numericValues.push(parsedValue);
    }

    const roundUpToNearestTen = (num) => Math.ceil(num / 10) * 10;

    const sumRoundedUp = numericValues.reduce((accumulator, currentNum) => {
        return accumulator + roundUpToNearestTen(currentNum);
    }, 0);

    let minRemainderForAdjustment = numericValues[0] % 10;

    for (let loopIndex = 0; loopIndex < ITEM_COUNT; loopIndex++) {
        const currentRemainder = numericValues[loopIndex] % 10;

        if (currentRemainder === 0) {
            continue;
        }

        if (minRemainderForAdjustment > currentRemainder) {
            minRemainderForAdjustment = currentRemainder;
        }
    }

    const finalResult = sumRoundedUp - (10 - minRemainderForAdjustment);

    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
