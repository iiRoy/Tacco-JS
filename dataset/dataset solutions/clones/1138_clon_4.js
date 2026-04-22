const sourceContent = String(require('fs')['readFileSync']('/dev/stdin'));
const segmentedLines = sourceContent['trim']()['split']('\n');

const sizeCapacity = segmentedLines['shift']()['split'](' ')['map'](value => Number['parseInt'](value, 10));
const objectCount = sizeCapacity[0];
const capacityLimit = sizeCapacity[1];

const itemAttributes = [null]; // Retain 1-indexed structure
for (let idx = 0; idx < objectCount; ++idx) {
  const currentItemInfo = segmentedLines['shift']()['split'](' ')['map'](value => Number['parseInt'](value, 10));
  itemAttributes['push']({ worth: currentItemInfo[0], mass: currentItemInfo[1] });
}

const memoizationStore = new Map();

// Custom maximum function to replicate Math.max's NaN propagation
const findMaximumValue = (...values) => values['some'](Number['isNaN']) ? NaN : Math['max'](...values);

const calculateOptimalLoad = (itemIdentifier, currentLoadWeight) => {
    // If currentLoadWeight is negative, it corresponds to an array access C[...][negative_index]
    // in the original code, which would yield 'undefined'.
    // 'number + undefined' results in 'NaN', which then propagates via Math.max.
    // This condition replicates that behavior.
    if (currentLoadWeight < 0) {
        return undefined;
    }

    const cacheKey = `${itemIdentifier},${currentLoadWeight}`;
    if (memoizationStore['has'](cacheKey)) {
        return memoizationStore['get'](cacheKey);
    }

    // Base cases for DP table
    if (itemIdentifier === 0 || currentLoadWeight === 0) {
        return 0;
    }

    const currentItem = itemAttributes[itemIdentifier];
    let result;

    // This condition `currentItem.mass <= capacityLimit` directly mirrors `items[i].w <= W`
    // from the original code, which is a global check on total capacity W, not current sub-capacity j.
    if (currentItem['mass'] <= capacityLimit) {
        const valueWithoutCurrent = calculateOptimalLoad(itemIdentifier - 1, currentLoadWeight);
        
        // Term 2: itemValue + C[i-1][j-items[i].w]
        const term2SubProblemResult = calculateOptimalLoad(itemIdentifier - 1, currentLoadWeight - currentItem['mass']);
        const valueWithCurrentOnce = currentItem['worth'] + term2SubProblemResult;

        // Term 3: itemValue + C[i][j-items[i].w]
        const term3SubProblemResult = calculateOptimalLoad(itemIdentifier, currentLoadWeight - currentItem['mass']);
        const valueWithCurrentMultiple = currentItem['worth'] + term3SubProblemResult;
        
        result = findMaximumValue(valueWithoutCurrent, valueWithCurrentOnce, valueWithCurrentMultiple);

    } else { // currentItem.mass > capacityLimit
        result = calculateOptimalLoad(itemIdentifier - 1, currentLoadWeight);
    }

    memoizationStore['set'](cacheKey, result);
    return result;
};

const finalResult = calculateOptimalLoad(objectCount, capacityLimit);
console['log'](finalResult);