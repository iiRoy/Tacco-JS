let inputData = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split('\n')[0];

console.log(inputData.replace(/,/g, ' '));
