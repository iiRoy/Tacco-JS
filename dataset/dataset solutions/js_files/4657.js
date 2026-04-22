inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0].split(' ')
A = inp.shift() * 1
B = inp.shift() * 1
console.log(A + B > 24 ? A + B - 24 : A + B)