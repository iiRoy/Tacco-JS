"use strict"
function main(arg) {
    let [L,R,d] = arg.trim().split("\n")[0].split(" ").map(Number)
    let ans = 0
    for (let i = L; i <= R; i++) {
        if (i % d === 0) {
            ans++
        }
    }
    console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));