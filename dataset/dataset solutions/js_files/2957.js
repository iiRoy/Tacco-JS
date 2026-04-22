input = require('fs').readFileSync('/dev/stdin', 'utf8')
lines = input.split('\n')
line = lines.shift().split(' ')
N = line[0] * 1
K = line[1] * 1
sum = 0
for (i=1; i <= N; i++) {
    x = i
    c = 0
    while (x < K) {
        x  = x * 2
        c++
    }
    sum += (1 / N) * (1 / Math.pow(2, c)) 
}
console.log(sum)