input = require('fs').readFileSync('/dev/stdin', 'utf8')
lines = input.split('\n')
line = lines.shift().split(' ')
N = line[0] * 1
K = line[1] * 1 
S = lines.shift()

cnt = 0
s = S[0]
for (i=1; i<N; i++) {
    if (s != S[i]) {
        cnt++
        s = S[i]
    }
}

d = cnt - 2 * K
if (d < 1) {
    d = 0
}

console.log(N - 1 - d)