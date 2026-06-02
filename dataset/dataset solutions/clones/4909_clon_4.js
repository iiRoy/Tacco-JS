process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputLinesStore = [];
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentInputLine) => {
  inputLinesStore.push(currentInputLine);
});

inputProcessor.on('close', () => {
    const lineContent = inputLinesStore[0];
    const parts = lineContent.split(" ");
    const firstOperand = Number(parts[0]);
    const secondOperand = Number(parts[1]);

    const baseValue = secondOperand - 1;
    const exponentValue = firstOperand - 1;

    const calculateExponential = (base, exp) => {
        if (exp === 0) return 1;
        if (exp < 0) {
            return 1 / calculateExponential(base, -exp);
        }
        if (exp % 2 === 0) {
            const halfPower = calculateExponential(base, exp / 2);
            return halfPower * halfPower;
        } else {
            return base * calculateExponential(base, exp - 1);
        }
    };

    const powerResult = calculateExponential(baseValue, exponentValue);
    const finalResult = powerResult * secondOperand;

    console.log(finalResult);
});

const determineSmallest = (...values) => {
    if (values.length === 0) {
        throw new TypeError('Reduce of empty array with no initial value');
    }
    return Math.min(...values);
};
