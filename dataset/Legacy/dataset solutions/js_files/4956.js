inp = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n')
N = inp.shift() * 1
A = inp.shift().split(' ')
o = {}
cnt = 0
for(i=0;i<N;i++) {
    u = A[i] * 1
    if (o[u]) {
        if (o[u] == i+1) {
            cnt++
        }
    } else {
        o[i+1] = u
    }
}
console.log(cnt)