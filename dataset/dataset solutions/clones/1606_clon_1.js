//const input = require("fs").readFileSync("/dev/stdin", "utf8")
var input = `5 2
2 4 5 1 3
3 4 -10 -8 8`
/*
var input = `2 6
2 1
10 -7`

var input = `3 3
3 1 2
-1000 -2000 -3000`
*/

var input = `10 58
9 1 6 7 8 4 3 2 10 5
695279662 988782657 -119067776 382975538 -151885171 -177220596 -169777795 37619092 389386780 980092719`

const lines = input.split('\n')
let [N, K] = lines[0].split(' ').map(Number)
const P = lines[1].split(' ').map(Number)
const C = lines[2].split(' ').map(Number)

P.unshift(null)
C.unshift(null)

const f = (start) => {
    const route = {}
    let i = start
    let sum = 0
    let peak = -1000000000
    let loop = false
    let k = 0
    for (k; k < K; k++) {
        route[i] = true
        i = P[i]
        sum += C[i]
        peak = Math.max(peak, sum)
        if (route[i]) {
            loop = true
            break
        }
    }
    //loopになっていない場合
    if (!loop) {
        return peak
    }
    //loopになっていて-の場合   
    if (sum < 0) {
        return peak
    }
    //loopになっていて+の場合
    const times = K % (k + 1) ? Math.floor(K / (k + 1)) : K / (k + 1) - 1

    i = start
    _sum = 0
    _peak = -1000000000
    _K = K % (k + 1)
    k = 0
    for (k; k < _K; k++) {
        i = P[i]
        _sum += C[i]
        _peak = Math.max(_peak, _sum)
    }

    return Math.max(sum * (times - 1) + peak, sum * times + _peak)
}

let ans = -1000000000
for (let start = 1; start <= N; start++) {
    ans = Math.max(ans, f(start))
}
console.log(ans)

//1回は実行する -がありえる