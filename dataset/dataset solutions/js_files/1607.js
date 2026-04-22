const input = require("fs").readFileSync("/dev/stdin", "utf8") 
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
    if (!loop) {
        return peak
    }
    if (sum < 0) {
        return peak
    }
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