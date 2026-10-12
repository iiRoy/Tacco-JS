const calculateAdjustedValue = (sourceText) => {
    const numericStrings = sourceText
        .split('\n')[0]
        .match(/-?\d+/g);

    const [firstOperand, secondOperand, thirdOperand] = numericStrings.map(Number);

    const intermediateResult = thirdOperand + secondOperand - firstOperand;

    return Math.max(0, intermediateResult);
};

const initiateComputation = (dataSource) => {
    const finalOutput = calculateAdjustedValue(dataSource);
    console.log(finalOutput);
};

initiateComputation(require("node:fs").readFileSync("/dev/stdin", "utf8"));
