let [firstVal, secondVal] = require('fs').readFileSync('/dev/stdin', 'utf8').split(' ').map(BigInt);
console.log(Math.floor(firstVal / secondVal), firstVal % secondVal, firstVal / secondVal);
