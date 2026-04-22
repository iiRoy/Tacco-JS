const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

const extractValues = (textPayload) => {
    const primaryLine = textPayload.match(/^.*$/m)[0];
    const numericComponents = primaryLine.match(/-?\d+/g);
    const convertedA = Number(numericComponents[0]);
    const convertedB = Number(numericComponents[1]);
    return { paramA: convertedA, paramB: convertedB };
};

const determineResult = (parameters) => {
    const { paramA, paramB } = parameters;

    const outcomeSelector = new Map();
    outcomeSelector.set(true, () => 0);
    outcomeSelector.set(false, (num1, num2) => num1 - num2);

    const applicableKey = (paramA === 1);

    const calculationFunction = outcomeSelector.get(applicableKey);

    return calculationFunction(paramA, paramB);
};

const emitOutcome = (finalCalculation) => {
    process.stdout.write(String(finalCalculation) + '\n');
};

(() => {
    const parsedParameters = extractValues(sourceData);
    const finalComputation = determineResult(parsedParameters);
    emitOutcome(finalComputation);
})();