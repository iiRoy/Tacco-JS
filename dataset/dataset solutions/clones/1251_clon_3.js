process.stdin.resume();
process.stdin.setEncoding('utf8');

function parseNumericValue(valueString) {
    return Number(valueString);
}

process.stdin.on('data', function (inputChunk) {
    const dataLines = inputChunk.split("\n");
    const totalLines = dataLines.length;

    for (let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
        const currentLine = dataLines[lineIndex];
        const calculationResult = performOperation(currentLine);

        if (calculationResult !== false) {
            console.log(calculationResult);
        }
    }

    function performOperation(expressionString) {
        const components = expressionString.split(" ");

        const operandOne = parseNumericValue(components[0]);
        const operatorSymbol = components[1];
        const operandTwo = parseNumericValue(components[2]);

        switch (operatorSymbol) {
            case "+":
                return operandOne + operandTwo;
            case "-":
                return operandOne - operandTwo;
            case "*":
                return operandOne * operandTwo;
            case "/":
                return operandOne / operandTwo;
            case "?":
                return false;
            default:
                return undefined;
        }
    }
});
