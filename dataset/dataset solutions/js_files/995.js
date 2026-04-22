var numbers = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').map(Number);
var n = numbers.shift();

function isPrime(num) {
  if (num < 2) return 0;
  if (num === 2) return 1;
  if (num % 2 === 0) return 0;
  for (var i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return 0;
  }
  return 1;
}

console.log(numbers.reduce(function(acc, number) {
  return acc + isPrime(number);
}, 0));