function processInput(dataString) {
    const [firstOperand, secondOperand] = dataString.split(' ').map(Number);

    const outcomeIndicator = Number(firstOperand % secondOperand !== 0);

    console.log('%d', outcomeIndicator);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
