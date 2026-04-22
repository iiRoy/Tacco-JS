const config = {
    input: '/dev/stdin',
    newline: '\n'
};

const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);
const list = line.slice(1, line.length-1).map(x => parseInt(x));

const head = list[0];
const tail = list.slice(1);

const ans = tail.reduce((acc, x) => {
    acc.result = Math.max(acc.result, x - acc.min);
    acc.min = Math.min(acc.min, x);
    return acc;
}, { result : -Infinity, min : head });

console.log(ans.result);
