const processCulinaryJourney = (rawSequenceData) => {
    const sequenceLines = rawSequenceData.split('\n');

    const servingQuantity = parseInt(sequenceLines[0], 10);
    const eatenSequence = sequenceLines[1].split(' ').map(s => parseInt(s, 10));
    const baseFlavorValues = sequenceLines[2].split(' ').map(s => parseInt(s, 10));
    const consecutiveBonusValues = sequenceLines[3].split(' ').map(s => parseInt(s, 10));

    const totalFlavorScore = eatenSequence.reduce((accumulatedFlavor, currentDishType, dishIndex, fullOrder) => {
        const previousDishType = fullOrder[dishIndex - 1];

        const bonusValue = (currentDishType === previousDishType + 1)
            ? consecutiveBonusValues[currentDishType - 2]
            : 0;

        return accumulatedFlavor + baseFlavorValues[currentDishType - 1] + bonusValue;
    }, 0);

    return totalFlavorScore;
};

const cuisineInput = require("fs").readFileSync("/dev/stdin", "utf8");
const finalSatisfaction = processCulinaryJourney(cuisineInput);
console.log(finalSatisfaction);