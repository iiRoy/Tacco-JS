const fileSystemModule = require('fs');

const extractAndConvert = (rawLine) => {
    const parts = rawLine.split(' ');
    return [Number(parts[0]), Number(parts[1])];
};

const [firstValue, secondValue] = extractAndConvert(fileSystemModule.readFileSync('/dev/stdin', 'utf8').split('\n')[0]);

const computedResult = ((firstValue + secondValue - 1) % 24) + 1;

console.log(computedResult);
