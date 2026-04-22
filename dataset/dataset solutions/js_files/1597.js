const input = require("fs").readFileSync("/dev/stdin", "utf8")
const lines = input.split('\n')
const N = lines[0] - 0
const L = lines[1].split(' ').map(Number)

const seq = (n, m) => {
    const ss = []
    const s = []
    let v = 0
    while (v !== undefined) {
        if (s.length === n) {
            ss.push([...s])
            s.pop()
        } else if (v >= m) {
            v = s.pop()
        } else {
            v++
            s.push(v)
        }
    }
    return ss
}

const s = seq(3, N)

let count = 0
for (let i = 0; i < s.length; i++) {
    const t = [L[s[i][0] - 1], L[s[i][1] - 1], L[s[i][2] - 1]]
    if (t[0] === t[1] || t[0] === t[2] || t[1] === t[2]) {
        continue
    }
    const l = Math.max(...t)
    const o = t.reduce((a, b) => a + b) - l
    if (l < o) {
        count++
    }
}

console.log(count)