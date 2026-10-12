process.stdin.resume();
process.stdin.setEncoding('utf8');

const getChangeCoinCount = (initialAmount) => {
    const coinValues = [500, 100, 50, 10, 5, 1];
    return coinValues.reduce((accumulator, currentDenomination) => {
        const numberOfCoins = Math.floor(accumulator.remaining / currentDenomination);
        return {
            totalCoins: accumulator.totalCoins + numberOfCoins,
            remaining: accumulator.remaining % currentDenomination
        };
    }, { totalCoins: 0, remaining: initialAmount }).totalCoins;
};

process.stdin.on('data', (inputBuffer) => {
    inputBuffer.toString()
        .split('\n')
        .filter(Boolean)
        .map(Number)
        .filter(inputValue => inputValue !== 0)
        .forEach(numericValue => {
            const amountToCalculate = 1000 - numericValue;
            console.log(getChangeCoinCount(amountToCalculate));
        });
});
