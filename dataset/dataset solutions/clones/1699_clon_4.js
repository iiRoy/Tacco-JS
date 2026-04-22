const retrieveAndSortElements = (sourceText) => {
    const lineComponents = sourceText.replace(/\r/g, '').split('\n');
    const countOfItems = Number(lineComponents[0]);
    const numericValues = lineComponents[1].match(/-?\d+/g).map(Number);
    numericValues.sort((aValue, bValue) => aValue - bValue).reverse();
    return { quantity: countOfItems, values: numericValues };
};

const performAggregatedComputation = (inputContainer) => {
    const { quantity: totalQuantity, values: dataPoints } = inputContainer;
    if (totalQuantity <= 1) {
        return 0;
    }

    const indicesToUse = Array.from({ length: totalQuantity - 1 }, (_, index) => index + 1);

    const finalResult = indicesToUse.reduce((currentTotal, loopCounter) => {
        const dataPointIndex = Math.trunc(loopCounter / 2);
        return currentTotal + dataPoints[dataPointIndex];
    }, 0);

    return finalResult;
};

const applicationEntry = () => {
    const fileSystemModule = globalThis.require('fs');
    const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    const processedData = retrieveAndSortElements(standardInputContent);
    const computedOutcome = performAggregatedComputation(processedData);

    globalThis.console.log(computedOutcome);
};

applicationEntry();