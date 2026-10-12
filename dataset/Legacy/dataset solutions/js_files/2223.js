"use strict"
function main(arg) {
    var N = arg.split("\n")[0].split(" ").map(Number)[0]
    var K = String(N).split("").length
    var count = 0
    for (var i = 1; i < N; i++) {
        var row = get_tip(i)
        // if (row[1] === 0) continue
        // console.log(row)
        var L = String(i).split("").length
        for (var j = 1; j <= K; j++) {
            //左辺が1けた
            if (L === 1) {
                // 右辺が1けた
                if (j === 1) {
                    count++
                    // console.log([i,i])
                }
                //右辺が2けた
                if (j === 2 && row[0] === row[1]) {
                    count++
                    // console.log([i, i + "" + i])
                }
                //右辺が複数けた
                if (j > 2 && row[0] === row[1]) {
                    for (var k = 0;; k++) {
                        var x = Number("" + i + k + i)
                        if (x > N) break 
                        // console.log([i, x])
                        count++
                    }
                }
            }
            //左辺が複数けた
            if (L > 1) {
                //右辺が1けた
                if (j === 1) {
                    if (row[0] === row[1])
                    // console.log([i,"--",row[0]])
                    count++
                }
                //右辺が2けた
                if (j === 2) {
                    if (row[0] === row[1])
                    // console.log([i,"--",row[1]  + "" + row[0]])
                    count++
                }
                //右辺が2けた
                if (j > 2) {
                    for (var k = 0;; k++) {
                        var x = Number("" + row[1] + k + row[0])
                        if (x > N) break 
                        // console.log([i, x])
                        count++
                    }
                }
                // if (j === 2 && row[0] === row[1]) {
                //     console.log([i,i])
                //     count++
                // }
            }
        }
    }
    console.log(count)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function get_tip(a) {
    var a_str = String(a)
    var x = String(a).split("").length
    if (x === 1) {
        return [a_str, a_str].map(Number)
    }
    if (x > 1) {
        return [a_str[0], a_str[x - 1]].map(Number)
    }
}