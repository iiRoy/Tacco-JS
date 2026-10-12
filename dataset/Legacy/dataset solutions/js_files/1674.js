const input = require("fs").readFileSync("/dev/stdin", "utf8")

;(input => {

    const lines = input.split('\n')
    const N = lines[0] - 0

    const f = (x, y, z) => {
        return  x * x + y * y + z * z + x * y + y * z + x * z
    }

    const map = Array(N + 1).fill(0)
    for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= N; j++) {
            for (let k = 1; k <= N; k++) {
                const n = f(i, j, k)
                if (n <= N)  {
                    map[n] ++
                } else {
                    break
                }
            }
        }
    }

    map.shift()
    map.forEach(n => {
        console.log(n)
    })

})(input)
