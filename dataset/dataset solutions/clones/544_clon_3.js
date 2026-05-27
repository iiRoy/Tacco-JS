(function() {
    const programArguments = process.argv;

    const userProvidedInputs = programArguments.slice(2);

    if (userProvidedInputs.length !== 2) {
        return;
    }

    const firstArgumentString = userProvidedInputs[0];
    const secondArgumentString = userProvidedInputs[1];

    const firstOperandValue = parseInt(firstArgumentString, 10);
    const secondOperandValue = parseInt(secondArgumentString, 10);

    if (isNaN(firstOperandValue)) {
        throw new Error(`Invalid number format for first argument: '${firstArgumentString}'`);
    }
    if (isNaN(secondOperandValue)) {
        throw new Error(`Invalid number format for second argument: '${secondArgumentString}'`);
    }

    const rawDivisionResult = firstOperandValue / secondOperandValue;

    const floorAdjustedResult = Math.floor(rawDivisionResult);

    const calculatedResultValue = floorAdjustedResult + 1;

    console.log(calculatedResultValue);
})();
