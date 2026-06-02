const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

let processedOutputBuffer = '';

const currencyDenominations = [500, 100, 50, 10];
const coinValueOrder = [10, 50, 100, 500];

for (let dataIndex = 0; dataIndex < rawInputData.length; dataIndex += 2) {
    const paymentRequired = Number(rawInputData[dataIndex]);

    if (paymentRequired === 0) {
        break;
    }

    const customerProvidedCoins = rawInputData[dataIndex + 1].split(' ').map(Number);

    const totalCustomerValue = customerProvidedCoins.reduce((sum, count, idx) => {
        return sum + count * coinValueOrder[idx];
    }, 0);

    let changeAmount = totalCustomerValue - paymentRequired;

    const changeCoinDistribution = currencyDenominations.reduce((acc, denom) => {
        const numCoins = Math.floor(changeAmount / denom);
        acc[denom] = numCoins;
        changeAmount -= numCoins * denom;
        return acc;
    }, {});

    const linesForCurrentBlock = coinValueOrder.flatMap((denomValue, index) => {
        const initialCount = customerProvidedCoins[index];
        const returnedCount = changeCoinDistribution[denomValue] || 0;

        if (initialCount > returnedCount) {
            return [`${denomValue} ${initialCount - returnedCount}`];
        }
        return [];
    });

    processedOutputBuffer += linesForCurrentBlock.join('\n');
    processedOutputBuffer += '\n\n';
}

console.log(processedOutputBuffer);
