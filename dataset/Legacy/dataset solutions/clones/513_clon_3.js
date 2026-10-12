const calculateArraySum = (accumulator, currentValue) => accumulator + currentValue;

const sortNumbersDescending = (valueA, valueB) => valueB - valueA;

const parseNumberStringToArray = (inputString) => inputString.split(" ").map(Number);

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

let inputDataLines = rawInputContent.trim().split("\n");

let currentProcessingIndex = 0;

while (true) {
    const itemCountLine = inputDataLines[currentProcessingIndex++];
    let currentItemCount = parseInt(itemCountLine, 10);

    if (currentItemCount === 0) {
        break;
    }

    const initialPricesLine = inputDataLines[currentProcessingIndex++];
    const initialPricesArray = parseNumberStringToArray(initialPricesLine);

    const bonusValuesLine = inputDataLines[currentProcessingIndex++];
    const bonusValuesArray = parseNumberStringToArray(bonusValuesLine);

    let basePricesTotalSum = initialPricesArray.reduce(calculateArraySum, 0);

    bonusValuesArray.sort(sortNumbersDescending);

    let maximumAchievableValue = basePricesTotalSum * currentItemCount;

    let remainingItemsForCalculation = currentItemCount;

    while (bonusValuesArray.length > 0) {
        remainingItemsForCalculation--;

        const nextBonusValue = bonusValuesArray.shift();

        const potentialNewMaximum = (basePricesTotalSum + nextBonusValue) * remainingItemsForCalculation;

        maximumAchievableValue = Math.max(maximumAchievableValue, potentialNewMaximum);
    }

    console.log(maximumAchievableValue);
}
