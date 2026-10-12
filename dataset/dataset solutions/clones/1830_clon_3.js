var input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
var T = input.shift();
var pdReg = new RegExp('[\\?|P][\\?|D]', 'g');
var result = T.replace(pdReg, function() {
  return 'PD';
});
console.log(result);