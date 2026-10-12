function processInputData(sourceContent) {
    const firstRelevantLine = sourceContent.split('\n')[0];

    const numericComponents = firstRelevantLine.split(' ').reduce((accumulator, currentStringValue, indexPosition) => {
        const convertedNumericValue = Number(currentStringValue);
        switch (indexPosition) {
            case 0:
                accumulator.firstOperand = convertedNumericValue;
                break;
            case 1:
                accumulator.secondOperand = convertedNumericValue;
                break;
            case 2:
                accumulator.thirdOperand = convertedNumericValue;
                break;
            default:
                // Ignore additional values if present, consistent with original behavior
                break;
        }
        return accumulator;
    }, {});

    const { firstOperand, secondOperand, thirdOperand } = numericComponents;

    const differenceTerm = firstOperand - thirdOperand;
    const sumTerm = secondOperand + thirdOperand;

    const divisionResult = differenceTerm / sumTerm;

    const finalOutcome = Math.floor(divisionResult);

    console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
