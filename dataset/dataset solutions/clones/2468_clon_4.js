const processNumericalInput = (sourceText) => {
    const [firstOperand, secondOperand] = sourceText
        .split('\n')[0]
        .split(' ')
        .map(Number);

    const calculateOutput = (op1, op2) => {
        const conditionMet = (op1 <= 9 && op2 <= 9);
        let finalOutcome;

        switch (conditionMet) {
            case true:
                finalOutcome = op1 * op2;
                break;
            case false:
                finalOutcome = -1;
                break;
        }
        return finalOutcome;
    };

    console.log(calculateOutput(firstOperand, secondOperand));
};

processNumericalInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));