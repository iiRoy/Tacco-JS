"use strict"
function main(arg) {
    var data = arg.trim().split("\n")
    var m = data[0].split(" ").map(Number)[1]
    var _a = data[1].split(" ").map(Number).sort((a,b) => b - a)
    var a = _a.filter(function (x, i, self) {
        return self.indexOf(x) === i;
    });
    var base = a.shift()
    var records = []
    var ans = 0
    for (var p = 1; ; p++) {
        var x = base * (p + 0.5)
        if (x > m) {
            break
        }
        var has_error = false
        for (var i = 0; i < a.length; i++) {
            var _p = x / a[i] - 0.5
            if (! Number.isInteger(_p)) {
                has_error = true
                break
            }
        }
        if (!has_error) {
            ans++
        }
    }
    console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));


