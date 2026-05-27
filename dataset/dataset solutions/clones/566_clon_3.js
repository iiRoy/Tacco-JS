const fs = require('fs');
const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');

function getMinCoinsForChange(amountToProcess) {
    let totalCoinsCount = 0;
    let currentRemainingAmount = amountToProcess;

    // Process 500-yen coin
    if (currentRemainingAmount >= 500) {
        totalCoinsCount += 1;
        currentRemainingAmount -= 500;
    }

    // Process 100-yen coins
    const hundredsDenomination = 100;
    let numberOfHundreds = Math.floor(currentRemainingAmount / hundredsDenomination);
    totalCoinsCount += numberOfHundreds;
    currentRemainingAmount %= hundredsDenomination;

    // Process 50-yen coin
    if (currentRemainingAmount >= 50) {
        totalCoinsCount += 1;
        currentRemainingAmount -= 50;
    }

    // Process 10-yen coins
    const tensDenomination = 10;
    let numberOfTens = Math.floor(currentRemainingAmount / tensDenomination);
    totalCoinsCount += numberOfTens;
    currentRemainingAmount %= tensDenomination;

    // Process 5-yen coin
    if (currentRemainingAmount >= 5) {
        totalCoinsCount += 1;
        currentRemainingAmount -= 5;
    }

    // The rest are 1-yen coins
    totalCoinsCount += currentRemainingAmount;

    return totalCoinsCount;
}

const parsedNumbers = rawInputData.trim().split("\n").map(Number);

for (let currentIndex = 0; currentIndex < parsedNumbers.length; currentIndex++) {
    const currentInputVal = parsedNumbers[currentIndex];

    if (currentInputVal === 0) {
        break;
    }

    const initialAmount = 1000;
    const changeRequired = initialAmount - currentInputVal;

    const finalCoinSum = getMinCoinsForChange(changeRequired);

    console.log(finalCoinSum);
}
