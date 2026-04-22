"use strict"
function main(arg) {
    let s = arg.trim().split("\n")[0]
    let counter = 0
    for (let i = 0; i < s.length - 4; i++) {
        for (let j = i + 4; j < s.length + 1; j++) {
            // console.log()
            if (Number(s.slice(i, j)) % 2019 === 0) {
                counter++
            }
        }
    }
    console.log(counter)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function solve(src, str) {
    let counter = 0
    let start = 0
    for (;;) {
        let n = src.indexOf(str, start)
        if (n < 0) {
            return counter
        }
        if (n >= 0) {
            counter++
            start = n + 1
        }
    }
    return counter
}