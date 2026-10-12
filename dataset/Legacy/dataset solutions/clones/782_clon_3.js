var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var trimmedInput = rawData.trim();
var lineData = trimmedInput.split("\n");
var outputBuffer = "";

function getNextNumericValue(dataLines) {
    const nextLine = dataLines.shift();
    return parseInt(nextLine, 10);
}

function getNextCoinCounts(dataLines) {
    const coinLine = dataLines.shift();
    return coinLine.split(" ").map(Number);
}

while (true) {
    var itemPrice = getNextNumericValue(lineData);

    if (itemPrice === 0) {
        break;
    }

    var initialCoins = getNextCoinCounts(lineData);

    const coinDenominationsAsc = [10, 50, 100, 500];
    let totalReceivedMoney = 0;
    for (let i = 0; i < initialCoins.length; i++) {
        totalReceivedMoney += initialCoins[i] * coinDenominationsAsc[i];
    }
    var remainingChange = totalReceivedMoney - itemPrice;

    var returnedCoins = [0, 0, 0, 0]; // Corresponds to [10, 50, 100, 500]

    const changeDenominationsDesc = [500, 100, 50, 10];
    const denominationMappingIndices = [3, 2, 1, 0]; // Maps changeDenominationsDesc to returnedCoins indices

    for (let i = 0; i < changeDenominationsDesc.length; i++) {
        const currentDenomination = changeDenominationsDesc[i];
        const targetIndex = denominationMappingIndices[i];
        while (remainingChange >= currentDenomination) {
            returnedCoins[targetIndex]++;
            remainingChange -= currentDenomination;
        }
    }

    initialCoins.forEach(function(countProvided, index) {
        const denominationValue = coinDenominationsAsc[index];
        const coinsToReturn = countProvided - returnedCoins[index];
        if (coinsToReturn > 0) {
            outputBuffer += denominationValue + " " + coinsToReturn + "\n";
        }
    });

    outputBuffer += "\n";
}

console.log(outputBuffer);
