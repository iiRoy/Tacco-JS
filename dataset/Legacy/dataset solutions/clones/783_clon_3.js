const fs = require('fs');

const rawData = fs.readFileSync('/dev/stdin', 'utf8');
const lines = rawData.trim().split("\n");

let lineIndex = 0;
let outputBuffer = "";

const coinDenominations = [10, 50, 100, 500];

const calculateCoinValue = (counts, denominations) => {
    let totalValue = 0;
    for (let i = 0; i < counts.length; i++) {
        totalValue += counts[i] * denominations[i];
    }
    return totalValue;
};

const determineReturnedCoins = (amount, denominations) => {
    const counts = new Array(denominations.length).fill(0);
    let currentAmount = amount;
    for (let i = denominations.length - 1; i >= 0; i--) {
        const denom = denominations[i];
        if (currentAmount >= denom) {
            const numCoins = Math.floor(currentAmount / denom);
            counts[i] = numCoins;
            currentAmount -= numCoins * denom;
        }
    }
    return counts;
};

while (true) {
    const transactionPrice = parseInt(lines[lineIndex++], 10);
    if (transactionPrice === 0) {
        break;
    }

    const initialCoinCountsStr = lines[lineIndex++].split(" ");
    const initialCoinCounts = initialCoinCountsStr.map(Number);

    const totalInitialMoney = calculateCoinValue(initialCoinCounts, coinDenominations);

    const amountToReturn = totalInitialMoney - transactionPrice;

    const returnedCoinCounts = determineReturnedCoins(amountToReturn, coinDenominations);

    initialCoinCounts.forEach((initialCount, denomIdx) => {
        const difference = initialCount - returnedCoinCounts[denomIdx];
        if (difference > 0) {
            outputBuffer += `${coinDenominations[denomIdx]} ${difference}\n`;
        }
    });
    outputBuffer += "\n";
}

console.log(outputBuffer.trim());
