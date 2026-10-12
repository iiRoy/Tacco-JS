var GET = (function () {function f(s) {return new g(s);}function g(s) {this._s = s.trim().split("\n");}g.prototype.getValue = function (n) {return this._s[n];};g.prototype.getArray = function (n) {return this.stoa(this._s[n]);};g.prototype.slice = function (s, limit) {return this._s.slice(s, +limit + s || undefined).map(v => this.stox(v));};g.prototype.sliceArray = function (s, limit) {return this._s.slice(s, +limit + s || undefined).map(v => this.stoa(v));};g.prototype.stoa = function (s) {return s.split(" ").map(v => this.stox(v));};g.prototype.stox = function (v) {var i = +v;return (i === i) ? i : v;};return f;})();
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(main());
function main() {
    var l1 = o.getArray(0);
    var N = l1[0];
    var M = l1[1];

    var info = o.sliceArray(1);
    var keys = [];
    var ans = 0;
    for (var n = N; n > 0; n--) {
        ans += 1 << n;
    }

    for (var i = 0; M * 2 > i; i = i + 2) {
        keys.push({
            a: info[i][0],
            c: info[i + 1].reduce(function (a, c) {
                return a | 1 << c;
            }, 0)
        })
    }

    var result = calc(ans, keys);
    if (result.length === 0) {
        return -1;
    }

    var sorted = result.sort(function (a, b) {
        return a - b;
    });

    return sorted[0];
}

function calc(ans, keys, key) {
    var current = {
        a: !!key ? key.a : 0,
        c: !!key ? key.c : 0
    };

    var result = [];
    for (var i = 0; keys.length > i; i++) {
        var tempKey = keys[i];
        var value = {
            a: current.a + tempKey.a,
            c: current.c | tempKey.c
        };

        if (value.c === ans) {
            result.push(value.a);
        }

        result = result.concat(calc(ans, keys.slice(1), value));
    }

    return result;
}
