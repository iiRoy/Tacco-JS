/*
const {stdin} = require('process');
let input = "";
stdin.on('data', x => {input += x});
stdin.on('end', () => {
    let lines = input.split('\n');
    let [n, m] = lines[0].split(' ')
        .map(x=>parseInt(x.trim()));
    if (m === 0) {
        console.log(0);
        return;
    }
    let signs = [
        [ 1, 1, 1],
        [ 1, 1,-1],
        [ 1,-1, 1],
        [ 1,-1,-1],
        [-1, 1, 1],
        [-1, 1,-1],
        [-1,-1,-1],
    ]
    let points = [];
    for (let _ of signs) { points.push(new Array<number>()); }
    for (let i = 0; i < n; i++) {
        let [x, y, z] = lines[i+1].split(' ')
            .map(x=>parseInt(x.trim()));
        signs.forEach(([a,b,c], i) => {
            points[i].push(x*a + y*b + z*c);
        });
    }
    let pointMax = points.map(x => {
        x.sort((x, y) => y - x);
        return x.slice(0, m).reduce((x, y) => x + y);
    });
    pointMax.sort((x, y) => y - x);
    console.log(pointMax[0]);
});
*/

var stdin = require('process').stdin;
var input = "";
stdin.on('data', function (x) { input += x; });
stdin.on('end', function () {
    var lines = input.split('\n');
    var _a = lines[0].split(' ')
        .map(function (x) { return parseInt(x.trim()); }), n = _a[0], m = _a[1];
    if (m === 0) {
        console.log(0);
        return;
    }
    var signs = [
        [1, 1, 1],
        [1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1, -1, -1],
    ];
    var points = [];
    for (var _i = 0, signs_1 = signs; _i < signs_1.length; _i++) {
        var _ = signs_1[_i];
        points.push(new Array());
    }
    var _loop_1 = function (i) {
        var _a = lines[i + 1].split(' ')
            .map(function (x) { return parseInt(x.trim()); }), x = _a[0], y = _a[1], z = _a[2];
        signs.forEach(function (_a, i) {
            var a = _a[0], b = _a[1], c = _a[2];
            points[i].push(x * a + y * b + z * c);
        });
    };
    for (var i = 0; i < n; i++) {
        _loop_1(i);
    }
    var pointMax = points.map(function (x) {
        x.sort(function (x, y) { return y - x; });
        return x.slice(0, m).reduce(function (x, y) { return x + y; });
    });
    pointMax.sort(function (x, y) { return y - x; });
    console.log(pointMax[0]);
});
