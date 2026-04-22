const renderOutput = console.log;

let acquiredData = "";
if (typeof process !== "undefined") {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (fragment) => {
        acquiredData += fragment;
    });
    process.stdin.on('end', () => {
        const inputSegments = acquiredData.split("\n").filter(segment => segment.trim() !== '');
        initiateProcessing(inputSegments);
    });
}

function initiateProcessing(dataRows) {
    const parsedData = dataRows.map(row => {
        const components = row.split(" ").map(Number);
        return components.length > 1 ? components : components[0];
    });

    const initialParameters = parsedData[0];
    const capacityLimit = initialParameters[1];

    const itemDetails = parsedData.slice(1);

    const finalResult = determineOptimalValue(itemDetails, capacityLimit);
    renderOutput(finalResult);
}

function determineOptimalValue(itemArray, maximumCapacity) {
    const memoizationCache = new Map(); // Map<itemIndex, Map<remainingCapacity, maxValue>>

    function computeValue(currentItemIndex, currentCapacity) {
        if (currentItemIndex >= itemArray.length || currentCapacity <= 0) {
            return 0;
        }

        if (memoizationCache.has(currentItemIndex) && memoizationCache.get(currentItemIndex).has(currentCapacity)) {
            return memoizationCache.get(currentItemIndex).get(currentCapacity);
        }

        const [itemWorth, itemSize] = itemArray[currentItemIndex];

        const valueWithoutCurrent = computeValue(currentItemIndex + 1, currentCapacity);

        let valueWithCurrent = 0;
        if (itemSize <= currentCapacity) {
            valueWithCurrent = itemWorth + computeValue(currentItemIndex + 1, currentCapacity - itemSize);
        }

        if (!memoizationCache.has(currentItemIndex)) {
            memoizationCache.set(currentItemIndex, new Map());
        }
        const result = Math.max(valueWithoutCurrent, valueWithCurrent);
        memoizationCache.get(currentItemIndex).set(currentCapacity, result);

        return result;
    }

    return computeValue(0, maximumCapacity);
}