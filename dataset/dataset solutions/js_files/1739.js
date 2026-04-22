const a = require('fs').readFileSync('/dev/stdin', 'utf8')

console.log(/[A-Z]/.test(a) ? 'A' : 'a')