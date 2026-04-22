const processData = (sourceText) => {
    const contentParts = sourceText.trim().split(' ');
    const firstOperand = Number(contentParts[0]);
    const secondOperand = Number(contentParts[1]);

    const fixedValue = 10;
    const factorValue = 100;

    const calculatedDifference = fixedValue - firstOperand;
    const nonNegativeAdjustment = Math.max(0, calculatedDifference);

    const resultantValue = secondOperand + factorValue * nonNegativeAdjustment;

    console.log(resultantValue);
};

processData(require("fs").readFileSync("/dev/stdin","utf8"));