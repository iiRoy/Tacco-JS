const processInputAndDetermineParity = (rawText) => {
    const numberMatches = rawText.match(/(-?\d+)\s+(-?\d+)/);

    const firstOperand = Number(numberMatches[1]);
    const secondOperand = Number(numberMatches[2]);

    const isFirstOdd = firstOperand & 1;
    const isSecondOdd = secondOperand & 1;

    const outcomeMap = {
        0: "Even",
        1: "Odd"
    };

    return outcomeMap[isFirstOdd & isSecondOdd];
};

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalResult = processInputAndDetermineParity(rawData);
console.log(finalResult);