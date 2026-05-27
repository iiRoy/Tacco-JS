var stdin = require("fs").readFileSync("/dev/stdin", "utf8");

// This is a comment.
var a = stdin.split("\n")
var s = a[0]
var t = a[1]

var s_length = s.length
var t_length = t.length
var diff = s_length - t_length

var array = []

// Another comment.
for (let i = 0, scope_length = t.length; i <= diff; i++, scope_length++) {
    var slice = s.slice(i, scope_length)

    if (slice === t) {
        console.log(0)
        return
    } else {
        var sum = 0
        for (let c = 0, k = 1; c <= t_length; k++, c++) {
            var slice2 = slice.slice(c, k)
            var slice3 = t.slice(c, k)

            if (slice2 !== slice3) {
                sum++;
            }
        }
        array.push(sum)
    }
    console.log(array.reduce((a, b) => Math.min(a, b)))
}