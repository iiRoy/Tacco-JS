function performBitwiseAddition(firstOperand, secondOperand) {
    let currentSum = firstOperand;
    let currentCarry = secondOperand;

    while (currentCarry !== 0) {
        let tempCarry = (currentSum & currentCarry) << 1;
        currentSum = currentSum ^ currentCarry;
        currentCarry = tempCarry;
    }
    return currentSum;
}

function performBitwiseNegation(operand) {
    return performBitwiseAddition(~operand, 1);
}

function processInputAndCalculate(rawInput) {
    const inputNumber = parseInt(rawInput);

    const negatedInput = performBitwiseNegation(inputNumber);

    const finalValue = performBitwiseAddition(48, negatedInput);

    console.log('%d', finalValue);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
