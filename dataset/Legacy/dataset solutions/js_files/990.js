const config = {
    input: '/dev/stdin',
    newline: '\n'
};

const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);
const gcd = (a, b) => b === 0 ? a : gcd(b, a%b);
console.log(gcd(...line[0].split(' ').map(x => parseInt(x))));

