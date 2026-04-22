const sequenceStorage = [];
const permutator = (itemsToArrange) => {
    if (itemsToArrange.length === 0) {
        return [[]];
    }
    return itemsToArrange.flatMap((headItem, headIndex) => {
        const tailItems = [...itemsToArrange.slice(0, headIndex), ...itemsToArrange.slice(headIndex + 1)];
        return permutator(tailItems).map(tailPermutation => [headItem, ...tailPermutation]);
    });
};
for (let currentLength = 1; currentLength <= 10; currentLength++) {
    const indicesToPermute = Array.from({ length: currentLength }, (_, idx) => idx);
    sequenceStorage[currentLength] = permutator(indicesToPermute).map(permutationArray => permutationArray.join(''));
}
const rawContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = rawContent.trim().split('\n');
let linePointer = 0;
const obtainLine = () => contentLines[linePointer++];
while (true) {
    const itemCount = parseInt(obtainLine(), 10);
    if (itemCount === 0) {
        break;
    }
    const itemDetailsCollection = [];
    for (let i = 0; i < itemCount; i++) {
        const itemSegments = obtainLine().split(' ');
        itemDetailsCollection.push({
            itemName: itemSegments[0],
            itemWeight: parseInt(itemSegments[1], 10),
            safetyThreshold: parseInt(itemSegments[2], 10)
        });
    }
    let bestOverallScore = Infinity;
    let selectedSequenceIndex;
    const candidateSequences = sequenceStorage[itemCount];
    candidateSequences.forEach((sequenceString, sequenceIdentifier) => {
        const sequenceOrder = sequenceString.split('').map(Number);
        const evaluationResult = sequenceOrder.reduce((currentStatus, currentItemIndex, stepNumber) => {
            if (!currentStatus.isValidPath) {
                return currentStatus;
            }
            const currentFoodItem = itemDetailsCollection[currentItemIndex];
            const weightOfCurrentItem = currentFoodItem.itemWeight;
            const safetyLimitOfCurrentItem = currentFoodItem.safetyThreshold;
            const newTotalWeight = currentStatus.accumulatedWeight + weightOfCurrentItem;
            const newWeightedSum = currentStatus.accumulatedWeightedSum + (weightOfCurrentItem * (itemCount - stepNumber));
            if (newTotalWeight > safetyLimitOfCurrentItem) {
                return { ...currentStatus, isValidPath: false };
            }
            return {
                accumulatedWeight: newTotalWeight,
                accumulatedWeightedSum: newWeightedSum,
                isValidPath: true
            };
        }, { accumulatedWeight: 0, accumulatedWeightedSum: 0, isValidPath: true });
        if (!evaluationResult.isValidPath) {
            const calculatedMetric = evaluationResult.accumulatedWeightedSum / evaluationResult.accumulatedWeight;
            if (calculatedMetric < bestOverallScore) {
                bestOverallScore = calculatedMetric;
                selectedSequenceIndex = sequenceIdentifier;
            }
        }
    });
    const optimalSequenceString = candidateSequences[selectedSequenceIndex];
    const finalOutputIndices = optimalSequenceString.split('').map(Number).reverse();
    const finalOutputNames = finalOutputIndices.map(idx => itemDetailsCollection[idx].itemName);
    console.log(finalOutputNames.join('\n'));
}