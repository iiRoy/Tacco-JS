var GET = (function () {function f(s) {return new g(s);}function g(s) {this._s = s.trim().split("\n");}g.prototype.getValue = function (n) {return this._s[n];};g.prototype.getArray = function (n) {return this.stoa(this._s[n]);};g.prototype.slice = function (s, limit) {return this._s.slice(s, +limit + s || undefined).map(v => this.stox(v));};g.prototype.sliceArray = function (s, limit) {return this._s.slice(s, +limit + s || undefined).map(v => this.stoa(v));};g.prototype.stoa = function (s) {return s.split(" ").map(v => this.stox(v));};g.prototype.stox = function (v) {var i = +v;return (i === i) ? i : v;};return f;})();
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(main());
function main(){
    var N = o.getValue(0);
    var An = o.getArray(1);

    var last = 0;
    for(var j = N - 1; N > j; j++) {
        if (An[j] > An[j - 1]) {
            last = j
            break;
        }
    }

    var result = 1000;
    var num = 0;
    for(var i = 0; N > i; i++) {
        if (last === i || An[i] > An[i + 1] && num > 0) {
            result += An[i] * num;
            num = 0;
            continue;
        }

        if (An[i] < An[i + 1] && result >= An[i]) {
            var temp = result % An[i];
            num = (result - temp) / An[i]
            result = temp
        }
    }

    return result;
}
