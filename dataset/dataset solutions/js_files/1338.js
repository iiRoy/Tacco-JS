var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
//var input = 14;
var n = parseInt(input);
var on = n;

var primes = [];

for (var i = 2; i <= n / 2; i++) {
    while (n % i == 0) {
        primes.push(i);
        n /= i;
    }
}

console.log(on + ': ' + primes.join(' '));
