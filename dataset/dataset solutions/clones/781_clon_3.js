const fileSystem = require('fs');

function determineCoinsToReturn(amountToDispense, availableDenominations) {
    let currentRemainingAmount = amountToDispense;
    const coinCountsToReturn = new Array(availableDenominations.length).fill(0);

    for (let i = availableDenominations.length - 1; i >= 0; i--) {
        const currentDenominationValue = availableDenominations[i];
        while (currentRemainingAmount >= currentDenominationValue) {
            coinCountsToReturn[i]++;
            currentRemainingAmount -= currentDenominationValue;
        }
    }
    return coinCountsToReturn;
}

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split('\n');

const TEN_YEN_VALUE = 10;
const FIFTY_YEN_VALUE = 50;
const HUNDRED_YEN_VALUE = 100;
const FIVE_HUNDRED_YEN_VALUE = 500;

const allCoinDenominations = [TEN_YEN_VALUE, FIFTY_YEN_VALUE, HUNDRED_YEN_VALUE, FIVE_HUNDRED_YEN_VALUE];

while (true) {
    const purchasePrice = Number(inputLines.shift());

    if (purchasePrice === 0) {
        break;
    }

    const customerProvidedCoins = inputLines.shift().split(' ').map(Number);

    let totalCustomerCoinValue = (TEN_YEN_VALUE * customerProvidedCoins[0]) +
                                 (FIFTY_YEN_VALUE * customerProvidedCoins[1]) +
                                 (HUNDRED_YEN_VALUE * customerProvidedCoins[2]) +
                                 (FIVE_HUNDRED_YEN_VALUE * customerProvidedCoins[3]);

    let amountOfChangeDue = totalCustomerCoinValue - purchasePrice;

    const coinsToReturnCounts = determineCoinsToReturn(amountOfChangeDue, allCoinDenominations);

    let outputResultBuffer = '';

    customerProvidedCoins.forEach((initialCount, denominationIndex) => {
        if (initialCount > coinsToReturnCounts[denominationIndex]) {
            const coinValue = allCoinDenominations[denominationIndex];
            const countNotReturned = initialCount - coinsToReturnCounts[denominationIndex];
            outputResultBuffer += `${coinValue} ${countNotReturned}\n`;
        }
    });

    console.log(outputResultBuffer);
}
