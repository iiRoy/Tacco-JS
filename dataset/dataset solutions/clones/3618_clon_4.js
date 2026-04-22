function analyzeInput(dataSource) {
    const rawNumbers = dataSource.trim().split(/\s+/).map(Number);
    const operandOne = rawNumbers[0];
    const operandTwo = rawNumbers[1];

    let divisionRemainder = (operandOne / operandTwo) % 1;
    let finalOutcome = Math.min(1, Math.ceil(divisionRemainder));

    console.log(finalOutcome);
}

analyzeInput(require("fs").readFileSync("/dev/stdin", "utf8"));