var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var numList = (rawData.trim()).split("\n").map(Number);

function calculateChangeCoins(amountToProcess) {
    let currentCoinTotal = 0;
    let remainingValue = amountToProcess;

    const YEN_500 = 500;
    const YEN_100 = 100;
    const YEN_50 = 50;
    const YEN_10 = 10;
    const YEN_5 = 5;

    // Process 500 yen coin
    if (remainingValue >= YEN_500) {
        currentCoinTotal++;
        remainingValue -= YEN_500;
    }

    // Process 100 yen coins
    let hundredsCount = Math.floor(remainingValue / YEN_100);
    currentCoinTotal += hundredsCount;
    remainingValue %= YEN_100;

    // Process 50 yen coin
    if (remainingValue >= YEN_50) {
        currentCoinTotal++;
        remainingValue -= YEN_50;
    }

    // Process 10 yen coins
    let tensCount = Math.floor(remainingValue / YEN_10);
    currentCoinTotal += tensCount;
    remainingValue %= YEN_10;

    // Process 5 yen coin
    if (remainingValue >= YEN_5) {
        currentCoinTotal++;
        remainingValue -= YEN_5;
    }

    // The remaining value is the count of 1 yen coins
    currentCoinTotal += remainingValue;

    return currentCoinTotal;
}

for (let currentIdx = 0; currentIdx < numList.length; currentIdx++) {
    let inputAmount = numList[currentIdx];
    
    if (inputAmount === 0) {
        break;
    }

    const TARGET_AMOUNT = 1000;
    let amountNeeded = TARGET_AMOUNT - inputAmount;
    
    let finalCoinResult = calculateChangeCoins(amountNeeded);
    
    console.log(finalCoinResult);
}
