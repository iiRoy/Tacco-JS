const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = fileContent.trim().split('\n');

const parseNumbersFromString = (numberString) => {
    return numberString.split(' ').map(Number);
};

const firstLineData = parseNumbersFromString(contentLines[0]);
const numItems = firstLineData[0];
const maxBudget = firstLineData[1];

const itemPrices = parseNumbersFromString(contentLines[1]);

let currentBestSum = 0;

for (let firstItemIndex = 0; firstItemIndex < numItems; firstItemIndex++) {
    for (let secondItemIndex = 0; secondItemIndex < numItems; secondItemIndex++) {
        if (firstItemIndex === secondItemIndex) {
            continue; // Ensure distinct items are selected
        }

        const priceOfFirstItem = itemPrices[firstItemIndex];
        const priceOfSecondItem = itemPrices[secondItemIndex];
        const potentialPairSum = priceOfFirstItem + priceOfSecondItem;

        // Check if the current pair sum is within the budget limit
        // AND if it's a better (larger) sum than what we've found so far
        if (potentialPairSum <= maxBudget && potentialPairSum > currentBestSum) {
            currentBestSum = potentialPairSum;
        }
    }
}

if (currentBestSum > 0) {
    console.log(currentBestSum);
} else {
    console.log("NONE");
}
