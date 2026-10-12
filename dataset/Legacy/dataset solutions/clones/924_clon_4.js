const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split('\n');
const count = lines.shift();
const booleanStrings = lines.shift().split(' ');

const evaluatePair = (firstOperand, secondOperand) => {
    const truthTable = {
        "TT": "T",
        "TF": "F",
        "FT": "T",
        "FF": "T"
    };
    return truthTable[firstOperand + secondOperand];
};

const finalResult = booleanStrings.reduce((accumulator, currentElement) => {
    return evaluatePair(accumulator, currentElement);
});

console.log(finalResult);
