inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0].split(' ')
A = inp.shift() * 1
B = inp.shift() * 1
C = inp.shift() * 1
D = inp.shift() * 1
console.log(A * B > B * C ? A * B : C * D)
