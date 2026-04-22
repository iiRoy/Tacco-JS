const processInput = (rawTextData) => {
    const dataSegments = rawTextData.trim().split("\n");
    const primarySegment = dataSegments[0];

    const numericForm = parseInt(primarySegment, 10);

    const fullPrecisionValue = BigInt(numericForm);

    const incrementedValue = fullPrecisionValue + 1n;
    const multipliedResult = fullPrecisionValue * incrementedValue;
    const dividedResult = multipliedResult / 2n;

    const stringRepresentation = dividedResult.toString();
    const standardNumericResult = parseInt(stringRepresentation, 10);

    const finalComputation = standardNumericResult - numericForm;

    console.log(finalComputation);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));