var inputStream = require('process').stdin;
var rawText = "";
inputStream.on('data', function (chunk) { rawText += chunk; });
inputStream.on('end', function () {
    var rows = rawText.split('\n');
    var _b = rows[0].split(' ')
        .map(function (value) { return parseInt(value.trim()); }), count = _b[0], choose = _b[1];
    if (choose === 0) {
        console.log(0);
        return;
    }
    var patterns = [
        [1, 1, 1],
        [1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1, -1, -1],
    ];
    var scores = [];
    for (var _j = 0, patterns_1 = patterns; _j < patterns_1.length; _j++) {
        var item = patterns_1[_j];
        scores.push(new Array());
    }
    var _loop_2 = function (idx) {
        var _b = rows[idx + 1].split(' ')
            .map(function (value) { return parseInt(value.trim()); }), px = _b[0], py = _b[1], pz = _b[2];
        patterns.forEach(function (_b, idx) {
            var sx = _b[0], sy = _b[1], sz = _b[2];
            scores[idx].push(px * sx + py * sy + pz * sz);
        });
    };
    for (var idx = 0; idx < count; idx++) {
        _loop_2(idx);
    }
    var bestScores = scores.map(function (value) {
        value.sort(function (left, right) { return right - left; });
        return value.slice(0, choose).reduce(function (left, right) { return left + right; });
    });
    bestScores.sort(function (left, right) { return right - left; });
    console.log(bestScores[0]);
});