function evaluateArithmetic(sourceInput) {
    const expressionParts = sourceInput.trim().split(" ");

    const operandOne = parseInt(expressionParts[0], 10);
    const operatorSymbol = expressionParts[1];
    const operandTwo = parseInt(expressionParts[2], 10);

    const operationDispatch = {
        "+": (a, b) => a + b,
        "-": (a, b) => a - b,
    };

    // The original logic implies that if the operator is not '+', it defaults to '-'.
    const chosenOperation = (operatorSymbol === '+') ? operationDispatch['+'] : operationDispatch['-'];

    const computedValue = chosenOperation(operandOne, operandTwo);

    console.log(computedValue);
}

evaluateArithmetic(require("fs").readFileSync("/dev/stdin", "utf8"));
