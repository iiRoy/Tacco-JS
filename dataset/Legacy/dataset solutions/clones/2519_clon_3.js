const determineCalculatedValue = (currentInput, isInputEven) => {
    let computedOutcome;

    if (isInputEven) {
        const halfOfInput = currentInput / 2;
        computedOutcome = halfOfInput / currentInput;
    } else {
        const halfOfInput = currentInput / 2;
        const incrementedHalf = halfOfInput + 1;
        computedOutcome = incrementedHalf / currentInput;
    }
    return computedOutcome;
};

var processInputAndCalculate = function (incomingValue) {
    if (incomingValue === 1) {
        const unityResult = 1;
        return unityResult;
    }

    const isValueEven = (incomingValue % 2 === 0);

    const finalResult = determineCalculatedValue(incomingValue, isValueEven);

    return finalResult;
};

processInputAndCalculate(input);
