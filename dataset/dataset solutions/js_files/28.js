function reve(s) {
  return s.split('').reverse().join('');
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(reve(input));