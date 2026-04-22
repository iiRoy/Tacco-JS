const fileSystemModule = require('fs');
const rawInputBuffer = fileSystemModule.readFileSync('/dev/stdin');
const entireText = rawInputBuffer.toString().trim();
const contentLines = entireText.split('\n');

const dimensionsString = contentLines[0];
const dimensionValues = dimensionsString.split(' ').map(str => parseInt(str, 10));

const assetCount = dimensionValues[0];
const bagCapacity = dimensionValues[1];

const assetDetails = [];
for (let k = 1; k < contentLines.length; k++) {
    const itemPair = contentLines[k].split(' ').map(str => parseInt(str, 10));
    assetDetails.push(itemPair);
}

const memoizationMatrix = Array.from({ length: assetCount }, () => new Array(bagCapacity + 1).fill(undefined));

const determineOptimalValue = (currentAssetIndex, remainingCapacity) => {
    if (currentAssetIndex >= assetCount || remainingCapacity <= 0) {
        return 0;
    }

    if (memoizationMatrix[currentAssetIndex][remainingCapacity] !== undefined) {
        return memoizationMatrix[currentAssetIndex][remainingCapacity];
    }

    const currentAssetWeight = assetDetails[currentAssetIndex][0];
    const currentAssetWorth = assetDetails[currentAssetIndex][1];

    const valueIfSkipped = determineOptimalValue(currentAssetIndex + 1, remainingCapacity);

    let maximumAchievableValue;

    if (currentAssetWeight <= remainingCapacity) {
        const valueIfTaken = currentAssetWorth + determineOptimalValue(currentAssetIndex + 1, remainingCapacity - currentAssetWeight);
        maximumAchievableValue = Math.max(valueIfSkipped, valueIfTaken);
    } else {
        maximumAchievableValue = valueIfSkipped;
    }

    memoizationMatrix[currentAssetIndex][remainingCapacity] = maximumAchievableValue;

    return maximumAchievableValue;
};

console.log(determineOptimalValue(0, bagCapacity));