function Main(input) {
    var strArr = input.split("\n");
    var s = strArr[0];
    var t = strArr[1];
    var n = s.length;
    var m = t.length;
    var dp = [];
    for (var i = 0; i <= n; i++) {
        dp[i] = [];
        dp[i][0] = i;
    }
    for (var i = 0; i <= m; i++) {
        dp[0][i] = i;
    }
    for (var i = 1; i <= n; i++) {
        for (var j = 1; j <= m; j++) {
            dp[i][j] = Math.min(Math.min(dp[i - 1][j], dp[i][j - 1]) + 1,
                                dp[i - 1][j - 1] + (s[i - 1] == t[j - 1] ? 0 : 1));
        }
    }
    console.log(dp[n][m]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));