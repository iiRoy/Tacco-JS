function processInput(rawInput) {
    const inputSegments = rawInput.trim().split(" ");
    const firstOperand = parseInt(inputSegments[0], 10);
    const secondOperand = parseInt(inputSegments[1], 10);

    const calculationStrategy = {
        true: () => 1, // Case where one dimension is 1
        false: (op1, op2) => { // General case
            const productValue = op1 * op2;
            // Equivalent to Math.ceil(productValue / 2)
            return (productValue % 2 === 0) ? productValue / 2 : (productValue + 1) / 2;
        }
    };

    const specialConditionMet = (Math.min(firstOperand, secondOperand) === 1);
    const finalOutcome = calculationStrategy[specialConditionMet](firstOperand, secondOperand);

    console.log(finalOutcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
