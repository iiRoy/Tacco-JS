const processInputData = (sourceText) => {
    const [firstSegment, secondSegment, thirdSegment] = sourceText.trim().split('\n');

    const numericIndicator = Number(firstSegment.split(' ')[0]);
    const operandAlpha = Number(secondSegment);
    const operandBeta = Number(thirdSegment);

    return numericIndicator === 1 ? "Hello World" : operandAlpha + operandBeta;
};

const acquiredInput = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputData(acquiredInput));
