const obtainSystemData = () => require("node:fs").readFileSync("/dev/stdin", "utf8");

const processRawText = (textualData) => {
    const primaryLine = textualData.trim().split('\n')[0];
    const numericSegments = primaryLine.split(' ');
    return numericSegments.map(segment => Number(segment));
};

const computeIntegerQuotient = (dividendValue, divisorValue) => {
    if (divisorValue === 0) {
        return dividendValue > 0 ? Infinity : (dividendValue < 0 ? -Infinity : NaN);
    }
    if (dividendValue === 0) return 0;

    if (divisorValue < 0) {
        return computeIntegerQuotient(-dividendValue, -divisorValue);
    }

    if (dividendValue > 0) {
        if (dividendValue < divisorValue) return 0;
        return 1 + computeIntegerQuotient(dividendValue - divisorValue, divisorValue);
    } else {
        return -1 + computeIntegerQuotient(dividendValue + divisorValue, divisorValue);
    }
};

const executeLogic = (sourceText) => {
    const [operandA, operandB, operandC] = processRawText(sourceText);

    const numeratorExpression = operandA - operandC;
    const denominatorExpression = operandC + operandB;

    const finalOutput = computeIntegerQuotient(numeratorExpression, denominatorExpression);
    return finalOutput;
};

const presentOutcome = (resultValue) => {
    console.log(resultValue);
};

const fullInputData = obtainSystemData();
const computedResult = executeLogic(fullInputData);
presentOutcome(computedResult);