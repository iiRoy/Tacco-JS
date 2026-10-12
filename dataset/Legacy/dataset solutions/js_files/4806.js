"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var main = function () { return fs_1.readFileSync('/dev/stdin', 'utf8').slice(0, -1); };
var args = main().split('\n');
var t = args[1].split(" ").map(function (x) { return +x; });
var ans = args.slice(3).map(function (v) {
    var _a = v.split(" "), p = _a[0], x = _a[1];
    var tmp = t[+p - 1];
    t[+p - 1] = +x;
    var sum = t.reduce(function (ac, cu) { return ac + cu; });
    t[+p - 1] = tmp;
    return sum;
});
console.log(ans);
