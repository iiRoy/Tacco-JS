process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputBuffer) => {
    const targetValue = 1000;
    const denominations = [500, 100, 50, 10, 5, 1];

    const calculateChangeCoins = (valueToConvert) => {
        return denominations.reduce((accumulator, coinUnit) => {
            const countForCurrentUnit = Math.floor(accumulator.remainingAmount / coinUnit);
            return {
                totalCoinCount: accumulator.totalCoinCount + countForCurrentUnit,
                remainingAmount: accumulator.remainingAmount % coinUnit
            };
        }, { totalCoinCount: 0, remainingAmount: valueToConvert }).totalCoinCount;
    };

    inputBuffer
        .toString()
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(cleanedLine => cleanedLine.length > 0 && cleanedLine !== "0")
        .map(Number)
        .forEach(numericInput => {
            const amountNeeded = targetValue - numericInput;
            const resultCount = calculateChangeCoins(amountNeeded);
            process.stdout.write(resultCount.toString() + '\n');
        });
});