const settings = {
    input: '/dev/stdin',
    newline: '\n'
};

const inputLines = require('fs').readFileSync(settings.input, 'utf-8').split(settings.newline);

const calculateIntersectionCount = (firstArray, secondArray) => {
    return secondArray.filter(item => firstArray.some(targetItem => item == targetItem)).length;
};

const firstDataSet = inputLines[1].split(' ').map(item => parseInt(item));
const secondDataSet = inputLines[3].split(' ').map(item => parseInt(item));

console.log(calculateIntersectionCount(firstDataSet, secondDataSet));
