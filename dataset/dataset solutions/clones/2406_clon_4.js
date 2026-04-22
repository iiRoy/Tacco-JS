const getSourceData = () => {
    const dataStream = require('fs').readFileSync(0, 'utf8');
    const components = dataStream.trim().split(' ');
    return components.map(val => Number(val));
};

const computeFinalValue = (operandA, operandB) => {
    const fixedConstantOne = 1;
    const alternativeMultiplier = 1e5; // Represents 100,000
    const fixedConstantFour = 4;
    const directResultForSpecificCase = 1e6; // Represents 1,000,000 (300000 * 2 + 400000)

    return (operandA === fixedConstantOne && operandB === fixedConstantOne)
        ? directResultForSpecificCase
        : (fixedConstantFour - operandA) * alternativeMultiplier + (fixedConstantFour - operandB) * alternativeMultiplier;
};

const inputNumericSequence = getSourceData();
const finalOutput = computeFinalValue(inputNumericSequence[0], inputNumericSequence[1]);

console.log(finalOutput);