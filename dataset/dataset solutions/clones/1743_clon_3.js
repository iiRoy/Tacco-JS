function formatLogMessage(a) {
    return a;
}
process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (inputValue) => {
    const initialValue = analyzeInputValue(inputValue);
    const analyzedValue = initialValue;
    const initialValue1 = getResultValue(analyzedValue.K, analyzedValue.Pk);
    const resultValue = initialValue1;
    const messageText = formatLogMessage(resultValue);
    console.log(messageText);
});
const analyzeInputValue = (inputValue) => {
    const initialValue2 = inputValue.split("\n");
    const linesValue = initialValue2;
    const initialValue3 = linesValue[0].split(" ");
    const line1Value = initialValue3;
    const initialValue4 = linesValue[1].split(" ");
    const line2Value = initialValue4;
    const RenamedN = line1Value[0];
    const RenamedK = line1Value[1];
    const currentItem = line2Value.map(numValue => Number(numValue));
    return {
        N: RenamedN,
        K: RenamedK,
        Pk: currentItem,
    };
};
const getResultValue = (stepIndex, currentItem) => {
    currentItem.sort((nextItem, sourceItem) => {
        const conditionMet = nextItem > sourceItem;
        if (conditionMet)
            return 1;
        const conditionMet1 = nextItem < sourceItem;
        if (conditionMet1) {
            const returnValue = -1;
            return returnValue;
        }
        const returnValue1 = 0;
        return returnValue1;
    });
    const sumValue = currentItem.slice(0, stepIndex).reduce((totalValue, currValue) => {
        const returnValue2 = totalValue + currValue;
        return returnValue2;
    }, 0);
    const returnValue3 = sumValue;
    return returnValue3;
};
