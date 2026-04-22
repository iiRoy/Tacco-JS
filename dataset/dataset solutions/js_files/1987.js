const gcdb = (a, b) => b ? gcdb(b, a % b) : a
function gcd() {
    let res = arguments[0]
    for (var i = 1; i < arguments.length; i++) {
        res = gcdb(res, arguments[i]); 
    }
    return res 
}

const input = require("fs").readFileSync("/dev/stdin", "utf8")

;(input => {
 
    const lines = input.split('\n')
    const K = lines[0] - 0

    let ans = 0
    for (let i = 1; i <= K; i++) {
        for (let j = 1; j <= K; j++) {
            for (let k = 1; k <= K; k++) {
                ans += gcd(i, j, k)
            }
        }
    }

    console.log(ans)

})(input)
