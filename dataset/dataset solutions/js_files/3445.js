const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const list = input.split(' ');

console.log(Number(list[0]) + Number(list[1]) / 2);
