var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
//var input = 1463616;
var n = parseInt(input);
var on = n;

var primes = [];
while (n % 2 == 0) {
    primes.push(2);
    n = n / 2;
}
for (var i = 3; i <= Math.sqrt(n); i += 2) {
    while (n % i == 0) {
        primes.push(i);
        n /= i;
    }
}
if (n > 1) primes.push(n);

console.log(on + ': ' + primes.join(' '));
