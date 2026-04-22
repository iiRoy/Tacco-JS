inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0].split(' ')
n = inp.shift() * 1
m = inp.shift() * 1
console.log((n - 1) * (m - 1))