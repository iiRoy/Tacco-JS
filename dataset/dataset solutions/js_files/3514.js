const input = require("fs").readFileSync("/dev/stdin", "utf8")

const lines = input.split('\n')
let n = lines[0].trim() - 0
let v = lines[1].trim().split(' ').map(Number)

const s = {}
const b = {}
for (let i = 0; i < n; i += 2) {
    s[v[i]] = s[v[i]] ? s[v[i]] + 1 : 1
    b[v[i + 1]] = b[v[i + 1]] ? b[v[i + 1]] + 1 : 1
}

const a1 = []
for (let key in s) {
    a1.push([key, s[key]])
}

const a2 = []
for (let key in b) {
    a2.push([key, b[key]])
}

a1.sort((a, b) => b[1] - a[1])
a2.sort((a, b) => b[1] - a[1])

let as = 0
if (a1[0][0] !== a2[0][0]) {
    as = a1[0][1] + a2[0][1]
} else {
    as = Math.max(
        a1[0][1] + (a2[1] ? a2[1][1] : 0),
        (a1[1] ? a1[1][1] : 0) + a2[0][1]
    )
}

console.log(n - as)
