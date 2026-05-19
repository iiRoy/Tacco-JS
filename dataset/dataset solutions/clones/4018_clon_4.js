function computeNumericProperty(inputSource) {
    const stringRepresentation = inputSource.length;
    const initialDigitValue = Number(inputSource[0]);
    const terminalCharacter = inputSource[stringRepresentation - 1];

    const outcomeHandlers = {
        // Handler for inputs with a single character
        'single': () => initialDigitValue,

        // Handler for two-character inputs where the last character is '9'
        'twoAndNine': () => (stringRepresentation - 1) * 9 + initialDigitValue,

        // Default handler for all other multi-character inputs
        'multiOther': () => (stringRepresentation - 1) * 9 + initialDigitValue - 1
    };

    let chosenHandlerKey;

    if (stringRepresentation === 1) {
        chosenHandlerKey = 'single';
    } else if (stringRepresentation === 2 && terminalCharacter === '9') {
        chosenHandlerKey = 'twoAndNine';
    } else {
        chosenHandlerKey = 'multiOther';
    }

    const computedResult = outcomeHandlers[chosenHandlerKey]();
    console.log(computedResult);
}

computeNumericProperty(require("fs").readFileSync("/dev/stdin", "utf8"));
