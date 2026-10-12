var inp = require('fs').readFileSync('/dev/stdin', 'utf8');
var x = parseInt(inp);
var ans = Math.floor(x / 500) * 1000;
ans += Math.floor((x % 500) / 5) * 5;
console.log(ans);