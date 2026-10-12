const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let lineSegments = rawInputData.trim().split("\n");

while (true) {
    const currentLineParams = lineSegments.shift();
    const numericParams = currentLineParams.split(" ").map(Number);

    const firstParam = numericParams[0];
    const secondParam = numericParams[1];
    const thirdParam = numericParams[2];

    if (firstParam === 0 && secondParam === 0 && thirdParam === 0) {
        break;
    }

    const itemCount = firstParam;
    const adjustedIndex = secondParam - 1;
    const discountPercentage = thirdParam;

    let itemValues = [];
    let cumulativeScore = 0;

    for (let i = 0; i < itemCount; i++) {
        const itemValueStr = lineSegments.shift();
        const currentItemValue = Number(itemValueStr);
        itemValues.push(currentItemValue);
        const weightedValue = currentItemValue * 100;
        cumulativeScore += weightedValue;
    }

    const effectiveMultiplier = (100 - discountPercentage) / 100;
    cumulativeScore = cumulativeScore * effectiveMultiplier;

    let finalCalculatedAnswer = 0;

    const divisorValue = itemValues[adjustedIndex];
    if (divisorValue !== 0) {
        finalCalculatedAnswer = Math.floor(cumulativeScore / divisorValue);
    }

    console.log(finalCalculatedAnswer);
}
