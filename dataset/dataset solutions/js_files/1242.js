[a,b] = require('fs').readFileSync('/dev/stdin','utf8').split(' ').map(BigInt);
console.log(Math.floor(a/b),a%b,a/b)
