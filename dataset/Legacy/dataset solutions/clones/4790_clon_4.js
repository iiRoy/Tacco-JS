const obtainNumericInputs = () => {
    const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    const [firstLine] = rawInput.split('\n');
    const [valAStr, valBStr] = firstLine.split(' ');
    return {
        firstOperand: Number(valAStr),
        secondOperand: Number(valBStr)
    };
};

const determineInitialAdjustment = (operandA, operandB) => {
    if (operandA === operandB) {
        return 0;
    }

    const signOfA = Math.sign(operandA);
    const signOfB = Math.sign(operandB);
    const aIsGreaterThanB = operandA > operandB;

    const adjustmentRules = {
        "1_1_true": 2,
        "1_1_false": 0,
        "-1_-1_true": 2,
        "-1_-1_false": 0,
        "1_-1_true": 1,
        "-1_1_false": 1,
        "0_1_false": 0,
        "0_-1_true": 2,
        "1_0_true": 2,
        "-1_0_false": 0,
    };

    const ruleKey = `${signOfA}_${signOfB}_${aIsGreaterThanB}`;
    return adjustmentRules[ruleKey] || 0;
};

const { firstOperand, secondOperand } = obtainNumericInputs();

let totalCount = determineInitialAdjustment(firstOperand, secondOperand);

totalCount += Math.abs(Math.abs(firstOperand) - Math.abs(secondOperand));

console.log(totalCount);
