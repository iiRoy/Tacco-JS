const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split('\n');

const parseNumbersFromString = (str) => {
    return str.split(' ').map(Number);
};

let currentLineData;

while ((currentLineData = inputLines.shift()) !== undefined) {
    const parsedConfig = parseNumbersFromString(currentLineData);
    const itemCount = parsedConfig[0];
    const maxAllowedSum = parsedConfig[1];

    if (itemCount === 0 && maxAllowedSum === 0) {
        break;
    }

    const priceString = inputLines.shift();
    const itemPrices = parseNumbersFromString(priceString);

    const eligibleSums = [];
    const totalItemsCount = itemPrices.length;

    for (let i = 0; i < totalItemsCount; i++) {
        const priceA = itemPrices[i];
        for (let j = 0; j < totalItemsCount; j++) {
            if (i === j) {
                continue;
            }
            const priceB = itemPrices[j];
            const calculatedSum = priceA + priceB;

            if (calculatedSum <= maxAllowedSum) {
                eligibleSums.push(calculatedSum);
            }
        }
    }

    let finalAnswer = null;

    if (eligibleSums.length > 0) {
        eligibleSums.sort((val1, val2) => val2 - val1);
        finalAnswer = eligibleSums[0];
    }

    if (finalAnswer) {
        console.log(finalAnswer);
    } else {
        console.log('NONE');
    }
}
