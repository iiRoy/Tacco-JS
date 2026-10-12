const calculateResult = (sourceContent) => {
    const parsedValue = parseInt(sourceContent);
    return (Math.PI + Math.PI) * parsedValue;
};

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(calculateResult(inputData));
