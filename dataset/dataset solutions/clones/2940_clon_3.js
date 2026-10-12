function Main(input) {
    var lines = input.trim().split('\n');
    var first = lines.shift().split(' ');
    var n = Number(first[0]);
    var m = Number(first[1]);
    var cs = lines.shift().split(' ').map(function(v){ return Number(v); }).sort(function (a, b) { return a - b; });
    var ls = lines.slice(0, m).sort(function(a, b) {
        return Number(b.split(' ')[1]) - Number(a.split(' ')[1]);
    });

    var idx = 0;

    for (var i = 0; i < ls.length; i++) {
        var l = ls[i].split(' ');
        var b = Number(l[0]);
        var c = Number(l[1]);

        for (var j = 0; j < b; j++) {
            if (idx >= n) {
                break;
            }
            if (cs[idx] < c) {
                cs[idx] = c;
                idx++;
            } else {
                j = b;
            }
        }

        if (idx >= n) {
            break;
        }
    }

    var ans = 0;
    for (var i = 0; i < cs.length; i++) {
        ans += cs[i];
    }

    console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));