const config = {
    input: '/dev/stdin',
    newline: '\n'
};

const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);

const solve = (arr1, arr2) => arr2.filter(x => arr1.some(y => x == y)).length;

const data1 = line[1].split(' ').map(x => parseInt(x));
const data2 = line[3].split(' ').map(x => parseInt(x));

console.log(solve(data1, data2));

