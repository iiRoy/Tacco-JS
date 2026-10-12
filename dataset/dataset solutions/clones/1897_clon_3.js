const Main = function(input) {
    var array = input.trim().split('\n');
    var NM = array.shift().split(' ').map(function(item) {
        return parseInt(item, 10);
    });
    var H = array.shift().split(' ').map(function(item) {
        return parseInt(item, 10);
    });
    var A = array.map(function(item) {
        return item.split(' ').map(function(value) {
            return parseInt(value, 10);
        });
    });

    var answer = F(NM[0], NM[1], H, A);
    console.log(answer);
};

const F = function(N, M, H, A) {
    var road = [];

    for (var i = 0; i <= N; i++) {
        road[i] = [];
    }

    for (var j = 0; j < M; j++) {
        var from = A[j][0];
        var to = A[j][1];

        road[from].push(to);
        road[to].push(from);
    }

    var count = 0;

    for (var k = 1; k <= N; k++) {
        if (road[k].length === 0) {
            count = count + 1;
            continue;
        }

        var max = -1;

        for (var x = 0; x < road[k].length; x++) {
            var item = road[k][x];
            if (H[item - 1] > max) {
                max = H[item - 1];
            }
        }

        if (max < H[k - 1]) {
            count++;
        }
    }

    return count;
};

Main(require("fs").readFileSync("/dev/stdin", "utf8"));