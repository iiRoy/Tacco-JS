const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const numericTokens = rawInputData.split(' ');

const firstValue = Number(numericTokens[0]);

const secondValue = Number(numericTokens[1]);

const thirdValue = Number(numericTokens[2]);

const calculateFinalOutcome = (inputK, inputA, inputB) => {
    const evaluationRules = [
        (kVal, aVal, bVal) => (kVal < aVal + 1) ? kVal + 1 : undefined,
        (kVal, aVal, bVal) => (bVal <= aVal + 2) ? kVal + 1 : undefined,
        (kVal, aVal, bVal) => {
            const termForK = kVal - aVal + 1;
            return (termForK % 2 === 0) ? aVal + (bVal - aVal) * termForK / 2 : undefined;
        },
        (kVal, aVal, bVal) => aVal + (bVal - aVal) * (kVal - aVal) / 2 + 1
    ];

    for (const ruleProcessor of evaluationRules) {
        const computedResult = ruleProcessor(inputK, inputA, inputB);
        if (computedResult !== undefined) {
            return computedResult;
        }
    }
    return 0;
};

console.log(calculateFinalOutcome(firstValue, secondValue, thirdValue));
