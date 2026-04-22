inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
N = inp.shift() * 1
S = inp.shift()
sumE = 0
sumW = 0
W = []
E = []
W[0] = 0
E[N] = 0
for (i=0; i<N; i++) {
    if (S[i] == 'W') {
        sumW++
    }
    if (S[N-i-1] == 'E') {
        sumE++
    }
    W[i+1] = sumW
    E[N-i-1] = sumE 
}
min = N
for (i=0; i<=N; i++) {
    if (min > W[i] + E[i+1]) {
        min = W[i] + E[i+1]
    }
}
console.log(min)
