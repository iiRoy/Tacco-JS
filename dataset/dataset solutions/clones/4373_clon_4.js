const evaluateAndPresent = (payloadText) => {
    const tokenizedParts = payloadText.split(' ');
    let firstOperand = 0;
    let secondOperand = 0;

    let processingIndex = 0;
    while (processingIndex < tokenizedParts.length && processingIndex < 2) {
        const currentToken = tokenizedParts[processingIndex];
        if (processingIndex === 0) {
            firstOperand = parseInt(currentToken, 10);
        } else {
            secondOperand = parseInt(currentToken, 10);
        }
        processingIndex++;
    }

    const calculationInput = firstOperand - secondOperand;
    const computedOutcome = (calculationInput + Math.abs(calculationInput)) / 2;

    process.stdout.write(String(computedOutcome) + '\n');
};

evaluateAndPresent(require("fs").readFileSync("/dev/stdin", "utf8"));