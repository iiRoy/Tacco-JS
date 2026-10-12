const computeDigitSum = (valueToSum) =>
  String(valueToSum)
    .split('')
    .reduce((accumulator, charDigit) => accumulator + parseInt(charDigit, 10), 0);

function processInput(rawInputContent) {
    const initialNumericValue = Number(rawInputContent.trim());
    const unusedInitializationPlaceholder = initialNumericValue;

    const searchForTargetSum = (currentIterationIndex, dynamicMinimumValue) => {
        if (currentIterationIndex >= dynamicMinimumValue) {
            return;
        }

        const baseComponent = currentIterationIndex;
        const differenceComponent = dynamicMinimumValue - baseComponent;
        const digitSumOfDifference = computeDigitSum(differenceComponent);
        const calculatedTotalSum = baseComponent + digitSumOfDifference;

        if (dynamicMinimumValue === calculatedTotalSum) {
            console.log(calculatedTotalSum);
            return;
        } else if (dynamicMinimumValue > calculatedTotalSum) {
            searchForTargetSum(currentIterationIndex + 1, calculatedTotalSum);
        } else {
            searchForTargetSum(currentIterationIndex + 1, dynamicMinimumValue);
        }
    };

    searchForTargetSum(1, initialNumericValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
