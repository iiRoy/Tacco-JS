inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
N = inp.shift() * 1
A = inp.shift() * 1
B = inp.shift() * 1
console.log(N == 1 ? 'Hello World' : A + B) 
