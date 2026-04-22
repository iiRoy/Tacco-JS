const input = require("fs").readFileSync("/dev/stdin", "utf8")
;(input => {
    const lines = input.split('\n')
    const [H, W] = lines[0].split(' ').map(Number)
    const C = lines[1].split(' ').map(Number)
    const D = lines[2].split(' ').map(Number)

    const map = []
    for (let i = 0; i < H; i++) {
        map[i] = lines[i + 3].split('')
    }

    const wall = '#'
    const f = (h, w, score) => {
        let p = null
        if (map[h] && map[h][w]) {
            p = map[h][w]
        }
        if (p && p !== wall && dp[h][w] > score) {
            dp[h][w] = score
            return true
        } else {
            return false
        }
    }

    const dp = Array(H).fill().map(_ => Array(W).fill(Infinity))
    const stack = [[C[0] - 1, C[1] - 1]]
    let score = 0
    dp[C[0] - 1][C[1] - 1] = score
    let i = null
    while (i = stack.pop()) {
        const walk = [
            [i[0] + 1, i[1]],
            [i[0] - 1, i[1]],
            [i[0], i[1] + 1],
            [i[0], i[1] - 1]
        ]
        let n =null
        score = dp[i[0]][i[1]]
        while (n = walk.pop()) {
            if (f(n[0], n[1], score)) {
                stack.push([n[0], n[1]])
            }
        }
        const warp = [
            [i[0] + 2, i[1] + 2],
            [i[0] + 2, i[1] + 1],
            [i[0] + 2, i[1]],
            [i[0] + 2, i[1] - 1],
            [i[0] + 2, i[1] - 2],
            [i[0] + 1, i[1] + 2],
            [i[0] + 1, i[1] + 1],
            [i[0] + 1, i[1] - 1],
            [i[0] + 1, i[1] - 2],
            [i[0], i[1] + 2],
            [i[0], i[1] - 2],
            [i[0] - 1, i[1] + 2],
            [i[0] - 1, i[1] + 1],
            [i[0] - 1, i[1] - 1],
            [i[0] - 1, i[1] - 2],
            [i[0] - 2, i[1] + 2],
            [i[0] - 2, i[1] + 1],
            [i[0] - 2, i[1]],
            [i[0] - 2, i[1] - 1],
            [i[0] - 2, i[1] - 2]
        ]
        score++
        while (n = warp.pop()) {
            if (f(n[0], n[1], score)) {
                stack.push([n[0], n[1]])
            }
        }
    }

    const ans = dp[D[0] - 1][D[1] - 1]
    console.log(ans === Infinity ? -1 : ans)

})(input)
