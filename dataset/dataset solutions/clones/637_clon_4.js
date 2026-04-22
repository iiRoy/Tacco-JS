let accumulatedInput = '';
let inputPosition = 0;

const fetchNumericValue = () => {
    return +accumulatedInput[inputPosition++];
};

const memoizationContainer = new Map();

const computeOptimalMetric = (firstDimensionSize, secondDimensionSize, dimensionOneItems, dimensionTwoItems) => {
    const uniqueKey = `${firstDimensionSize}-${secondDimensionSize}`;
    if (memoizationContainer.has(uniqueKey)) {
        return memoizationContainer.get(uniqueKey);
    }

    if (firstDimensionSize === 0) {
        return 0;
    }
    if (secondDimensionSize === 0) {
        return Number.POSITIVE_INFINITY;
    }

    const valueIfSkippingSecond = computeOptimalMetric(firstDimensionSize, secondDimensionSize - 1, dimensionOneItems, dimensionTwoItems);

    const currentProductTerm = dimensionOneItems[firstDimensionSize - 1] * dimensionTwoItems[secondDimensionSize - 1];
    const valueIfIncludingBoth = computeOptimalMetric(firstDimensionSize - 1, secondDimensionSize - 1, dimensionOneItems, dimensionTwoItems) + currentProductTerm;

    const finalResult = Math.min(valueIfSkippingSecond, valueIfIncludingBoth);
    memoizationContainer.set(uniqueKey, finalResult);
    return finalResult;
};

const commenceOperation = () => {
    const countOfFirstSet = fetchNumericValue();
    const countOfSecondSet = fetchNumericValue();

    const collectionOfFirstSet = Array.from({ length: countOfFirstSet }, fetchNumericValue);
    const collectionOfSecondSet = Array.from({ length: countOfSecondSet }, fetchNumericValue);

    memoizationContainer.clear();

    const ultimateOutcome = computeOptimalMetric(
        countOfFirstSet,
        countOfSecondSet,
        collectionOfFirstSet,
        collectionOfSecondSet
    );

    console.log(ultimateOutcome);
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataSegment) => {
    accumulatedInput += dataSegment;
});

process.stdin.on('end', () => {
    accumulatedInput = accumulatedInput.split(/\s+/).filter(entry => entry !== '');
    commenceOperation();
});