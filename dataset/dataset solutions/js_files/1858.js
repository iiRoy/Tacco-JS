const input = require("fs").readFileSync("/dev/stdin", "utf8")

;(input => {
    const rows = input.split('\n')
    const N = parseInt(rows[0].split(' ')[0], 10)
    const M = parseInt(rows[0].split(' ')[1], 10)
    const A = []
    const B = []
    for (var i = 0; i < M; i++) {
        A[i] = parseInt(rows[i + 1].split(' ')[0], 10)
        B[i] = parseInt(rows[i + 1].split(' ')[1], 10)
    }
    const map = Array(N + 1).fill(null).map(() => [])
    for (let i  = 0; i < M; i++) {
        map[A[i]].push(B[i])
        map[B[i]].push(A[i])
    }
    const res =[]
    const s = [1]
    let n = 0
    while (n = s.shift()) {
        for (var i = 0; i < M; i++) {
            if (!A[i]) break
            map[n].forEach(_n => {
                if (res[_n - 1] === undefined) {
                    s.push(_n)
                    res[_n - 1] = n
                }
            })
        }
    }

    if (res.indexOf(0) === -1) {
        res[0] = 'Yes'
        res.forEach(val => {
            console.log(val)
        })
    } else {
        console.log('No')
    }

})(input)
