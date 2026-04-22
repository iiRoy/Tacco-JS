const queryReader = require('readline').createInterface({
    input: process.stdin
});

const initialCapital = 100;

function calculateFutureAccumulation(currentBalance, remainingPeriods) {
    if (remainingPeriods === 0) {
        return currentBalance;
    }
    const nextBalance = Math.ceil(currentBalance * 1.05);
    return calculateFutureAccumulation(nextBalance, remainingPeriods - 1);
}

queryReader.on('line', (inputString) => {
    const numberOfPeriods = parseInt(inputString.trim(), 10);

    const finalTotal = calculateFutureAccumulation(initialCapital, numberOfPeriods);
    const outputValue = finalTotal * 1000;

    process.stdout.write(outputValue.toString() + '\n');
    queryReader.close();
});