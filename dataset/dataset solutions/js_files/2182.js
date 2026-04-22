"use strict"
function main(arg) {
    var a = Number(arg.trim().split("\n")[0])
    var b = Number(arg.trim().split("\n")[1])
    var ans = z1(a, b)
    console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function z1(a, b) {
    var l = String(a).length
    var ans = 0
    for (var i = 0; i < 100; i++) {
        var mask = i.toString(2)
        if (mask.length > l) {
            break
        }
        if (mask.split('1').length - 1 !== b) {
            continue
        }
        // console.log(mask)
        if (mask.length < l) {
            //最大けたではない
            ans += Math.pow(9, mask.split('1').length - 1)
        } else {
            // 最大けたのとき
            // console.log(l)
            for (var j = 111; j <= 999; j++) {
                if (!(String(j).split("0") > 1)) continue
                // console.log(j)
            //     if (mask.split('1').length - 1)
                var t = replace9(mask, j)
                if (t > a) {
                    break
                }
                ans += 1
                // console.log([mask, j, t])
            }
        }
        
    }
    return ans
}

function replace9(mask, r) {
    var fix_mask = String(mask).split("").reverse()
    var fix_r = String(r).split("").reverse()
    var ans = []
    var count = 0
    for (var i = 0; i < fix_mask.length; i++) {
        if (fix_mask[i] === '1') {
            ans.push(fix_r[count])
            count++
        } else {
            ans.push(fix_mask[i])
        }
    }
    return Number(ans.reverse().join(""))
}