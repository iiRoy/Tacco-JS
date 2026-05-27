function processInput(initialInputString) {
    const dataLines = initialInputString.split("\n");

    const operandOne = Number(dataLines[0]);
    const operandTwo = Number(dataLines[1]);

    const productOfSecondOperand = operandTwo * 2;

    const intermediateDifference = operandOne - productOfSecondOperand;

    const finalCalculatedValue = Math.max(0, intermediateDifference);

    console.log(finalCalculatedValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
