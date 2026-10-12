var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var n = parseInt(input);
 
 
var primes = [];
 

for (var i = 2; i<n; i++) {
    while(n%i==0) {
        primes.push(i);
        n /= i;
    }
}

process.stdout.write(n + ': '); 
process.stdout.write(primes.join(' ')+"\n");
