const input = require("fs").readFileSync("/dev/stdin", "utf8")

;(input => {

    const lines = input.split('\n')
    const N = lines[0] - 0
    const X = lines[1].trim()

    const popcount = n => {
        let count = 0
        do {
            n & 1 ? count++ : count
        } while  (n = n >>> 1)
        return count
    }

    const f = n => {
        if (n === 0) {
            return 0
        }
        let count = 1
        while (n %= popcount(n)) {
            count++
        }
        return count
    }

    let count = 0n
    for (let i = 0; i < N; i++) {
        if (X[i] === '1') count++
    }
    const pr = count - 1n
    const nx = count + 1n
    const x = BigInt(parseInt(X, 2))
    for (let i = 0; i < N; i++) {
        let n = x ^ BigInt(Math.pow(2, N - i - 1))
        if (n === 0) {
            console.log(0)
        } else {
            const mod = Number(n % (X[i] === '1' ? pr : nx))
            console.log(f(mod) + 1)
        }
    }

})(input)
