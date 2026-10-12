var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

const getNextNumericValue = () => {
    const lineData = inputLines.shift();
    return Number(lineData);
};

const getNextNumericArray = () => {
    const lineData = inputLines.shift();
    return lineData.split(" ").map(Number);
};

const calculateSum = (valueA, valueB) => valueA + valueB;

while (true) {
    let itemCount = getNextNumericValue();
    if (itemCount === 0) {
        break;
    }

    let initialItems = getNextNumericArray();
    let bonusItems = getNextNumericArray();

    let currentTotal = initialItems.reduce(calculateSum, 0);

    bonusItems.sort((valueA, valueB) => valueB - valueA);

    let overallMaxProduct = currentTotal * itemCount;

    while (bonusItems.length > 0) {
        itemCount = itemCount - 1;
        const nextBonus = bonusItems.shift();
        currentTotal = currentTotal + nextBonus;

        const potentialProduct = currentTotal * itemCount;
        overallMaxProduct = Math.max(overallMaxProduct, potentialProduct);
    }

    console.log(overallMaxProduct);
}
