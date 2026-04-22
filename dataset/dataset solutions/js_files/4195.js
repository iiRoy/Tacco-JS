process.stdin.resume();
process.stdin.setEncoding('utf8');

var g_input = '';
process.stdin.on('data', function(chunk) {
    g_input += chunk;
});

process.stdin.on('end', function() {
    Main(g_input.split(/\r?\n/));
});

function Main(input) {

    var n = parseInt(input[0], 10);
    var f = new Array(n);
    for (var i = 0; i < n; i++) {
        f[i] = new Array(10);
        var args = input[1 + i].split(' ');
        for (var j = 0; j < 10; j++) {
            f[i][j] = parseInt(args[j], 10);
        }
    }
    var p = new Array(n);
    for (var i = 0; i < n; i++) {
        p[i] = new Array(10);
        var args = input[1 + n + i].split(' ');
        for (var j = 0; j < 10; j++) {
            p[i][j] = parseInt(args[j], 10);
        }
    }

    var open = new Array(10);
    open.fill(false);

    var ret = 0;
    ret = dfs(0, open, f, p);

    console.log(ret);

    return 0;
}

function dfs(i, open, f, p) {

    if (i >= 10) {

        var allClosed = true;
        for (var i = 0; i < open.length; i++) {
            if (open[i]) {
                allClosed = false;
                break;
            }
        }

        if (allClosed) {
            return Number.MIN_SAFE_INTEGER;
        }

        var both = new Array(10);
        both.fill(0);
        for (var i = 0; i < f.length; i++) {
            for (var j = 0; j < 10; j++) {
                if (open[j] && f[i][j] == 1) {
                    both[i]++;
                }
            }
        }

        var ret = 0;
        for (var i = 0; i < p.length; i++) {
            ret += p[i][both[i]];
        }

        return ret;
    }

    var ret1 = 0;
    var ret2 = 0;

    ret1 = dfs(i + 1, open, f, p);
    open[i] = true;
    ret2 = dfs(i + 1, open, f, p);
    open[i] = false;

    if (ret1 > ret2) {
        return ret1;
    }
    else {
        return ret2;
    }
}
