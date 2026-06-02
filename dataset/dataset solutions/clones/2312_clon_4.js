function processInputAndCompute(rawInputText) {
    const numericValues = rawInputText.split(" ").map(Number);
    const [firstOperand, secondOperand, thirdOperand] = numericValues;

    const calculateEvenCase = (op2, op3) => (op3 - op2) / 2;
    const calculateOddCase = (op1, op2, op3) => Math.min(op1 - op2, op3 - 1);

    const isDifferenceEven = (thirdOperand - secondOperand) % 2 === 0;

    const finalOutcome = isDifferenceEven
        ? calculateEvenCase(secondOperand, thirdOperand)
        : calculateOddCase(firstOperand, secondOperand, thirdOperand);

    console.log(finalOutcome);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
