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
    var inputA = input[1].split(' ');
    var a = new Array(n);
    for (var i = 0; i < n; i++) {
        a[i] = parseInt(inputA[i], 10);
    }
    var ans = dfs(0, a);
    console.log(ans);

    return 0;
}

function dfs(i, a) {
    if (i >= a.length) {
        return 0;
    }
    var ans1 = 1;
    for (var j = i + 1; j < a.length; j++) {
        ans1 *= 3;
    }
    var ans2 = dfs(i + 1, a);
    var ans = 0;
    if (a[i] % 2 == 0) {
        ans = ans1 + 2 * ans2;
    }
    else {
        ans = 2 * ans1 + ans2;
    }
    return ans;
}
