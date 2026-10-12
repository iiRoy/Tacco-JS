const input = require("fs").readFileSync("/dev/stdin", "utf8")

;(input => {
    const lines = input.split('\n')
    const N = lines[0] - 0
    const A = lines[1].split(' ').map(Number)

    let ans = 0
    let sp = 0
    while (sp < N) {
        let d = [A[sp]]
        let xor = [A[sp]]
        let count = 1
        for (let i = 1; i < N; i++) {
            d[i] = d[i - 1] + A[i + sp]
            xor[i] = xor[i - 1] ^ A[i + sp]
            if (d[i] === xor[i]) {
                count++
            } else {
                break
            }
        }
        ans += count
        sp++
    }

    console.log(ans)

})(input)
