const initialBalance = 100;
const periodCount = ~~(require('fs').readFileSync('/dev/stdin', 'utf8'));

const finalBalance = Array.from({ length: periodCount }).reduce((currentValue) => {
  return Math.ceil(currentValue * 1.05);
}, initialBalance);

console.log(finalBalance * 1000);
