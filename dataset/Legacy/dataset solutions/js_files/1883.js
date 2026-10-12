const input = require("fs").readFileSync("/dev/stdin", "utf8")

function pow (x ,n) {
    let res = 1n
    while (n > 0) {
        if (n & 1n) res = res * x % mod
        x = x * x % mod
        n >>= 1n
    }
    return res
}

function inv (x) {
    if (x == 1n) return 1n;
    return pow(x, mod - 2n);
}

const mod = 998244353n

;(input => {
    const lines = input.split('\n')
    let [N, M, K] = lines[0].split(' ').map(BigInt)

    let ans = 0n
    let fa = 1n
    let fa2 = 1n
    for (let k = 0n; k <= K; k++) {
        fa = fa * (k || 1n)// % mod
        fa2 = fa2 * (N - (k || (N - 1n))) % mod
        let left = fa2 * inv(fa)
        ans += left * pow((M - 1n), (N - (k + 1n))) * M % mod
    }

    console.log((ans % mod).toString())
 
})(input)
