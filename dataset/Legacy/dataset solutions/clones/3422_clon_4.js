const streamInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const pattern = /^(3|5|7)$/;
const finalVerdict = pattern.test(streamInput) ? 'YES' : 'NO';
console.log(finalVerdict);
