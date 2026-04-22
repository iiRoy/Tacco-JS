const processInputData = (sourceText) => {
    const numericTokens = sourceText.split(/\s+/).filter(Boolean).map(Number);
    let currentPosition = 0;
    return {
        grabNext: () => numericTokens[currentPosition++],
    };
};

const computeOptimalPath = (rawData) => {
    const dataAccess = processInputData(rawData);

    const dataLength = dataAccess.grabNext();
    const sequenceElements = Array.from({ length: dataLength }, () => dataAccess.grabNext());

    const memoizationCache = new Map();

    const calculateStateCost = (rowId, stateId) => {
        if (rowId === 0) {
            return 0;
        }

        const cacheKey = `${rowId},${stateId}`;
        if (memoizationCache.has(cacheKey)) {
            return memoizationCache.get(cacheKey);
        }

        const currentElementValue = sequenceElements[rowId - 1];
        const costForEvenRule = currentElementValue === 0 ? 2 : currentElementValue % 2;
        const costForOddRule = (currentElementValue + 1) % 2;

        let calculatedCost;

        switch (stateId) {
            case 0:
                calculatedCost = calculateStateCost(rowId - 1, 0) + currentElementValue;
                break;
            case 1:
                calculatedCost = Math.min(calculateStateCost(rowId - 1, 0), calculateStateCost(rowId - 1, 1)) + costForEvenRule;
                break;
            case 2:
                calculatedCost = Math.min(calculateStateCost(rowId - 1, 0), calculateStateCost(rowId - 1, 1), calculateStateCost(rowId - 1, 2)) + costForOddRule;
                break;
            case 3:
                calculatedCost = Math.min(calculateStateCost(rowId - 1, 2), calculateStateCost(rowId - 1, 3)) + costForEvenRule;
                break;
            case 4:
                calculatedCost = Math.min(
                    calculateStateCost(rowId - 1, 0),
                    calculateStateCost(rowId - 1, 1),
                    calculateStateCost(rowId - 1, 2),
                    calculateStateCost(rowId - 1, 3),
                    calculateStateCost(rowId - 1, 4)
                ) + currentElementValue;
                break;
            default:
                calculatedCost = Infinity;
        }
        memoizationCache.set(cacheKey, calculatedCost);
        return calculatedCost;
    };

    let minimumOverallResult = Infinity;
    for (let s = 0; s < 5; s++) {
        minimumOverallResult = Math.min(minimumOverallResult, calculateStateCost(dataLength, s));
    }
    return minimumOverallResult;
};

console.log(computeOptimalPath(require("fs").readFileSync("/dev/stdin", "utf8")));