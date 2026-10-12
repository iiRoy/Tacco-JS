inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
K = inp.shift() * 1
console.log(K % 2 ? Math.floor(K / 2) * Math.ceil(K / 2) : Math.pow(K / 2, 2))