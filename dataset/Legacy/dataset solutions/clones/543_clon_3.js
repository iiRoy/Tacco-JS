const getStrictInteger = (inputStringValue) => {
    const integerPattern = /^-?\d+$/;

    if (!integerPattern.test(inputStringValue)) {
        throw new Error(`NumberFormatException: For input string: "${inputStringValue}"`);
    }

    const parsedNumericValue = parseInt(inputStringValue, 10);
    return parsedNumericValue;
};

const runApplication = () => {
    const programArguments = process.argv.slice(2);
    const requiredArgumentCount = 2;

    if (programArguments.length !== requiredArgumentCount) {
        return;
    }

    try {
        const firstOperand = getStrictInteger(programArguments[0]);
        const secondOperand = getStrictInteger(programArguments[1]);

        const rawDivisionResult = secondOperand / firstOperand;
        const floorValue = Math.floor(rawDivisionResult);
        const finalComputedNumber = floorValue + 1;

        console.log(finalComputedNumber);
    } catch (parsingError) {
        throw parsingError;
    }
};

runApplication();
