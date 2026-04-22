const retrieveOptimalValue = (itemIndex, currentCapacity, elements, memoizationCache) => {
    if (currentCapacity <= 0 || itemIndex >= elements.length) {
        return 0;
    }

    if (memoizationCache[itemIndex] && memoizationCache[itemIndex][currentCapacity] !== undefined) {
        return memoizationCache[itemIndex][currentCapacity];
    }

    const currentElement = elements[itemIndex];
    const elementWeight = currentElement.weight;
    const elementValue = currentElement.value;

    let resultValue;
    // Option 1: Exclude the current element
    const valueWithoutCurrent = retrieveOptimalValue(itemIndex + 1, currentCapacity, elements, memoizationCache);

    // Option 2: Include the current element (if it fits)
    if (elementWeight <= currentCapacity) {
        const valueWithCurrent = elementValue + retrieveOptimalValue(itemIndex + 1, currentCapacity - elementWeight, elements, memoizationCache);
        resultValue = Math.max(valueWithoutCurrent, valueWithCurrent);
    } else {
        resultValue = valueWithoutCurrent; // Element doesn't fit, so can only take value without it
    }

    if (!memoizationCache[itemIndex]) {
        memoizationCache[itemIndex] = {};
    }
    memoizationCache[itemIndex][currentCapacity] = resultValue;
    return resultValue;
};

const identifyChosenItemIndices = (itemIndex, currentCapacity, elements, memoizationCache) => {
    if (currentCapacity <= 0 || itemIndex >= elements.length) {
        return new Set();
    }

    const currentElement = elements[itemIndex];
    const elementWeight = currentElement.weight;
    const elementValue = currentElement.value;

    const optimalValueAtCurrentState = memoizationCache[itemIndex][currentCapacity];

    // Value if current element is skipped
    const valueFromSkipping = (memoizationCache[itemIndex + 1] && memoizationCache[itemIndex + 1][currentCapacity] !== undefined)
                             ? memoizationCache[itemIndex + 1][currentCapacity]
                             : 0; // Base case or not computed yet (should be computed)

    // Value if current element is taken
    let valueFromTaking = -1; // Sentinel value if not possible or not computed
    if (elementWeight <= currentCapacity) {
        valueFromTaking = elementValue + (
            (memoizationCache[itemIndex + 1] && memoizationCache[itemIndex + 1][currentCapacity - elementWeight] !== undefined)
            ? memoizationCache[itemIndex + 1][currentCapacity - elementWeight]
            : 0 // Base case or not computed yet
        );
    }

    // Reconstruct based on the original's tie-breaking: prefer not taking if values are equal or skipping is better
    if (optimalValueAtCurrentState === valueFromSkipping) {
        // This element was skipped
        return identifyChosenItemIndices(itemIndex + 1, currentCapacity, elements, memoizationCache);
    } else if (elementWeight <= currentCapacity && optimalValueAtCurrentState === valueFromTaking) {
        // This element was taken
        const subsequentChoices = identifyChosenItemIndices(itemIndex + 1, currentCapacity - elementWeight, elements, memoizationCache);
        subsequentChoices.add(itemIndex);
        return subsequentChoices;
    }
    // This path should ideally not be reached if the memoizationCache is fully consistent.
    return new Set();
};

const processInputData = (rawDataString) => {
    const dataLines = rawDataString.trim().split('\n');
    const firstLineValues = dataLines[0].split(' ').map(Number);
    const totalItemCount = firstLineValues[0];
    const maxCapacity = firstLineValues[1];

    let itemsCollection = [];
    for (let currentIdx = 0; currentIdx < totalItemCount; currentIdx++) {
        const [itemW, itemV] = dataLines[currentIdx + 1].split(' ').map(Number);
        itemsCollection.push({ weight: itemW, value: itemV });
    }

    // Sort items by value (B) in ascending order, mirroring original logic
    itemsCollection.sort((elementA, elementB) => elementA.value - elementB.value);

    // Calculate maximum worth for the full capacity
    const fullCapacityCache = [];
    const maxWorthFullCapacity = retrieveOptimalValue(0, maxCapacity, itemsCollection, fullCapacityCache);

    // Calculate maximum worth for (capacity - 1)
    const reducedCapacityCache = [];
    const maxWorthReducedCapacity = retrieveOptimalValue(0, maxCapacity - 1, itemsCollection, reducedCapacityCache);

    let secondaryWorthCalculation = 0;
    // The original code's 'lastOrder' logic is applied even if maxCapacity - 1 is negative or zero.
    // The recursive functions correctly handle currentCapacity <= 0.
    
    // Identify items chosen for (capacity - 1)
    const chosenIndicesForReducedCapacity = identifyChosenItemIndices(0, maxCapacity - 1, itemsCollection, reducedCapacityCache);

    // Find the highest value among items NOT chosen for (capacity - 1)
    let highestRemainingItemValue = 0;
    for (let itemIdx = 0; itemIdx < itemsCollection.length; itemIdx++) {
        if (!chosenIndicesForReducedCapacity.has(itemIdx)) {
            highestRemainingItemValue = Math.max(highestRemainingItemValue, itemsCollection[itemIdx].value);
        }
    }
    secondaryWorthCalculation = maxWorthReducedCapacity + highestRemainingItemValue;
    
    console.log(Math.max(maxWorthFullCapacity, secondaryWorthCalculation));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));