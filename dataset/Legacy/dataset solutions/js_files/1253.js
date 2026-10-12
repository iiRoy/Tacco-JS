/// <reference path="node.d.ts" />
/// <reference path="lib.ts" />
function main(input) {
    var n = +input.shift();
    var a = [];
    for (var i = 0; i < n; ++i)
        a.push(+input.shift());
    var ans = [];
    ans.push(_.min(a));
    ans.push(_.max(a));
    ans.push(_.sum(a));
    process.stdout.write(ans.join(' '));
}
/// <reference path="node.d.ts" />
/// <reference path="main.ts" />
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    main(chunk.split(/\s+/));
});
// based on lodash
var _;
(function (_) {
    function min(a) {
        return Math.min.apply(Math, a);
    }
    _.min = min;
    function max(a) {
        return Math.max.apply(Math, a);
    }
    _.max = max;
    function reduce(a, func, init) {
        var result = init;
        for (var i = 0; i < a.length; ++i)
            result = func(result, a[i]);
        return result;
    }
    _.reduce = reduce;
    function sum(a) {
        return reduce(a, function (result, v) { return result + v; }, 0);
    }
    _.sum = sum;
})(_ || (_ = {}));