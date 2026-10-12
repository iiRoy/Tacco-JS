const fileSystemHandler = require('fs');

const processRawInput = (rawTextContent) => {
    const cleanedContent = rawTextContent.trim();
    const lineSegments = cleanedContent.split("\n");
    const numericalData = lineSegments.map(Number);
    return numericalData;
};

const rawInputData = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
const processedNumbers = processRawInput(rawInputData);

const PRICE_ADJUSTMENT_VALUE = 50;

const minimumFoodPrice = Math.min(...processedNumbers.slice(0, 3));
const minimumBeveragePrice = Math.min(...processedNumbers.slice(3, 5));

const totalMinimumCost = minimumFoodPrice + minimumBeveragePrice;
const finalDiscountedPrice = totalMinimumCost - PRICE_ADJUSTMENT_VALUE;

console.log(finalDiscountedPrice);
