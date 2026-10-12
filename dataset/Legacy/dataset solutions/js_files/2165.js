"use strict"
function main(arg) {
    var data = arg.trim().split("\n")
    var c = data[0].split(" ")
    var c_n = data[1].split(" ").map(Number)
    var x = data[2]

    if (x === c[0]) {
        console.log(String(c_n[0] - 1) + " " + String(c_n[1]))
    } else {
        console.log(String(c_n[0]) + " " + String(c_n[1] - 1))
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));