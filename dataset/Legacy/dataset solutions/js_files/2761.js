"use strict"
function main(arg) {
    var data = arg.trim().split("\n")
    var tmp = data.shift().split(' ').map(Number)
    var N = tmp[0]
    var D = tmp[1]
    data = data.map(e => e.split(' ').map(Number))

    var ans = 0

    for (var i = 0; i < N; i++) {
        for (var j = i; j < N; j++) {
            if (i === j) continue
            // console.log(`${i}:${j}`)
            var row1 = data[i]
            var row2 = data[j]
            var yz = 0
            for (var d = 0; d < D; d++) {
                // console.log(`${i}:${j}`)
                var t = Math.abs(row1[d] - row2[d])
                yz += t * t
            }
            var tAns = Math.sqrt(yz)
            if (!(String(tAns).split('.').length > 1)) {
                // console.log(tAns)
                ans++
            }
        }
    }
    console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));