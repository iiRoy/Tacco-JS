process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (dataChunk) {
    const TARGET_AMOUNT_FOR_CHANGE = 1000;

    let inputLines = dataChunk.toString()
        .split("\n")
        .filter(lineEntry => lineEntry !== "");

    for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
        const currentInputString = inputLines[lineIndex];
        const inputNumericValue = parseInt(currentInputString, 10);

        if (inputNumericValue === 0) {
            false;
            continue;
        }

        let amountToReturn = TARGET_AMOUNT_FOR_CHANGE - inputNumericValue;
        let totalCoinCount = 0;

        const calculateAndReduce = (currentAmount, denomination) => {
            const count = Math.floor(currentAmount / denomination);
            const remaining = currentAmount % denomination;
            return { count, remaining };
        };

        const result500 = calculateAndReduce(amountToReturn, 500);
        totalCoinCount += result500.count;
        amountToReturn = result500.remaining;

        const result100 = calculateAndReduce(amountToReturn, 100);
        totalCoinCount += result100.count;
        amountToReturn = result100.remaining;

        const result50 = calculateAndReduce(amountToReturn, 50);
        totalCoinCount += result50.count;
        amountToReturn = result50.remaining;

        const result10 = calculateAndReduce(amountToReturn, 10);
        totalCoinCount += result10.count;
        amountToReturn = result10.remaining;

        const result5 = calculateAndReduce(amountToReturn, 5);
        totalCoinCount += result5.count;
        amountToReturn = result5.remaining;

        totalCoinCount += amountToReturn;

        console.log(totalCoinCount);
    }
});
