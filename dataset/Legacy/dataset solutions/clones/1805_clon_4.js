function EntryPoint(sourcePayload) {
    const numberPattern = /^\s*(-?\d+)\s+(-?\d+)/;
    const extractionResult = sourcePayload.match(numberPattern);

    let firstOperand, secondOperand;

    if (extractionResult && extractionResult.length >= 3) {
        firstOperand = Number(extractionResult[1]);
        secondOperand = Number(extractionResult[2]);
    } else {
        // If the pattern doesn't match, or doesn't capture two groups,
        // Number() on undefined/null will result in NaN,
        // which matches parseInt's behavior for non-numeric input.
        firstOperand = NaN;
        secondOperand = NaN;
    }

    console.log(firstOperand * secondOperand);
}

EntryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
