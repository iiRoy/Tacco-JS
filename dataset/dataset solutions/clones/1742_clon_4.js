function executeCoreOperation(incomingText) {
    const fullNumericSequence = incomingText.trim().split(/\s+/).map(Number);

    const [totalQuantity, selectionQuantity, ...datasetItems] = fullNumericSequence;

    const accumulatedValue = datasetItems
        .sort((firstValue, secondValue) => firstValue - secondValue)
        .slice(0, selectionQuantity)
        .reduce((currentSum, currentElement) => currentSum + currentElement, 0);

    return accumulatedValue;
}

function Main(input) {
    const finalResult = executeCoreOperation(input);
    console.log(finalResult);
}