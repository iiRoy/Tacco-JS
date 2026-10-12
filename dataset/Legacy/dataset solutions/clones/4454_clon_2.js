var valFromInput = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split('\n')[0] + 0; // Convert the first line of input to a number
console.log('ABC' + valFromInput);
