// 0505 Questionnaire (??¢?????±??????)
// http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=0505
// Type III clone

'use strict';

var fs = require('fs');
var text = fs.readFileSync('/dev/stdin', 'utf8');
var raw = text.trim().split('\n');

function splitNumbers(source) {
    return source.split(' ').map(Number);
}

while (true) {
    var firstLine = raw.shift();
    var size = splitNumbers(firstLine);
    var rows = size[0];
    var cols = size[1];

    if (rows === 0) {
        break;
    }

    var count = {};
    for (var i = 0; i < rows; i++) {
        var rowText = raw.shift();
        var line = splitNumbers(rowText);
        for (var j = 0; j < cols; j++) {
            var id = j + 1;
            var oldValue = id in count ? count[id] : 0;
            count[id] = oldValue + line[j];
        }
    }

    var answer = Object.keys(count);
    answer.sort(function(a, b) {
        if (count[a] === count[b]) {
            return a - b;
        }
        return count[b] - count[a];
    });

    console.log(answer.join(' '));
}
