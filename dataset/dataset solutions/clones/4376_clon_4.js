const extractAndParse = (textBlock) => {
    let cleanBlock = textBlock.trim();
    let currentPosition = 0;
    let parsedValues = [];

    const customParseInteger = (sourceString, initialIndex) => {
        let numericAccumulator = '';
        let isNegativeFlag = false;
        let traversalIndex = initialIndex;

        while (traversalIndex < sourceString.length && /\s/.test(sourceString[traversalIndex])) {
            traversalIndex++;
        }

        if (sourceString[traversalIndex] === '-') {
            isNegativeFlag = true;
            traversalIndex++;
        }

        let hasDigits = false;
        while (traversalIndex < sourceString.length && sourceString[traversalIndex] >= '0' && sourceString[traversalIndex] <= '9') {
            numericAccumulator += sourceString[traversalIndex];
            hasDigits = true;
            traversalIndex++;
        }

        if (!hasDigits) {
            return { value: NaN, nextIdx: initialIndex };
        }

        return {
            value: parseInt((isNegativeFlag ? '-' : '') + numericAccumulator, 10),
            nextIdx: traversalIndex
        };
    };

    let firstParseResult = customParseInteger(cleanBlock, currentPosition);
    parsedValues.push(firstParseResult.value);
    currentPosition = firstParseResult.nextIdx;

    while (currentPosition < cleanBlock.length && !/\s/.test(cleanBlock[currentPosition])) {
        currentPosition++;
    }

    while (currentPosition < cleanBlock.length && /\s/.test(cleanBlock[currentPosition])) {
        currentPosition++;
    }

    if (currentPosition < cleanBlock.length) {
        let secondParseResult = customParseInteger(cleanBlock, currentPosition);
        parsedValues.push(secondParseResult.value);
        currentPosition = secondParseResult.nextIdx;
    }

    const valueOne = parsedValues[0];
    const valueTwo = parsedValues[1];

    const arithmeticPerformer = new Function('operandA', 'operandB', 'return operandA - operandB;');
    const finalComputation = arithmeticPerformer(valueOne, valueTwo);

    console.log(finalComputation);
};

extractAndParse(require("fs").readFileSync("/dev/stdin", "utf8"));