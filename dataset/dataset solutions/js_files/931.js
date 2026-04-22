var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n');

var n = lines.shift() - 0;

var r = [];

for (var i = 1; i <= n; i++) {
    var arr = lines.shift().split(' ');
    r[i] = +arr[0];
    r[i + 1] = +arr[1];
}

var cost = [[-1]];
for (var i = 1; i <= n; i++) {
    var arr = [-1];
    cost.push(arr);
    for (var j = 1; j <= n; j++) {
        cost[i][j] = Number.POSITIVE_INFINITY;
    }
}

for (var i = 1; i <= n; i++) {
    cost[i][i] = 0;
}

for (var j = 1; j < n; j++) {
    for (var i = 1; i <= n - j; i++) {
        for (var k = i + 1; k <= i + j; k++) {
            var c = cost[i][k - 1] + cost[k][i + j] + r[i] * r[k] * r[i + j + 1];
            if (c < cost[i][i + j]) {
                cost[i][i + j] = c;
            }
        }
    }
}

console.log(cost[1][n]);