inp = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n')
l = inp.shift().split(' ')
H = l.shift() * 1
W = l.shift() * 1 
N = inp.shift() * 1
ans = []
for (i=0; i<H; i++) {
    ans[i] = new Array(W)
}

h = 0
w = 0
a = inp.shift().split(' ')
m = 'R'
for (i=0; i<N; i++) {
    n = a[i] * 1
    for (j=0; j<n; j++) {
        if (ans[h][w] === undefined) {
            ans[h][w] = i+1
        }

        if (w == W - 1 && m == 'R') {
            h++
            m = 'L'
        } else if (w === 0 && m == 'L') {
            h++
            m = 'R'
        } else if (m == 'R') {
            w++
        } else if (m == 'L') {
            w--
        }
    }
}
console.log(ans.map(a => a.join(' ')).join('\n'))