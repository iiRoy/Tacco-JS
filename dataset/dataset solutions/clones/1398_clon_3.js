function processInputExpressions(inputString) {
    const sentinelValue = "?";
    let expressionLines = inputString.split("\n").filter(line => line.trim().length > 0);

    if (expressionLines.length === 0) {
        return;
    }

    let currentExpressionIndex = 0;
    const totalExpressions = expressionLines.length;

    while (currentExpressionIndex < totalExpressions) {
        let currentLineContent = expressionLines[currentExpressionIndex].trim();

        if (currentLineContent === sentinelValue) {
            break;
        }

        try {
            let evaluationOutcome = eval(currentLineContent);
            console.log(evaluationOutcome);
        } catch (exceptionDetails) {
            // Errors during evaluation are caught, but not explicitly logged
            // to maintain a similar output behavior to the original,
            // which would simply fail or output undefined for bad eval.
        }

        currentExpressionIndex++;
    }
}

processInputExpressions(require("fs").readFileSync("/dev/stdin", "utf8"));