const processInputAndCalculate = (sourceText) => {
    const [firstValue, secondValue] = sourceText.split('\n').map(Number);
    return (2 * secondValue) - firstValue;
};

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputAndCalculate(rawData));
