
function Main(arg) {
 
    var N = arg.split("\n")[0]-0;
    var S = arg.split("\n")[1];

    var dp = new Array(N);

    for (var i = 0; i < N; i++){
        dp[i] = new Array(N + 1);
        dp[i][N] = 0;
    }

    for (var j = N - 1; j >= 0; j--) {

        if (j === N - 1) {
            dp[N - 1][j] = 0;
            continue;
        }

        if (S[N - 1] === S[j]) {
            dp[N - 1][j] = 1;            
        }
        else {
            dp[N - 1][j] = 0;
        }
    }

    for (var i = N - 2; i >= 0; i--){
        for (var j = N - 1; j >= 0; j--) {
            if (i === j) {
                dp[i][j] = 0;
                continue;
            }
            
            if (S[i] === S[j]) {
                dp[i][j] = dp[i + 1][j + 1] + 1;
            }
            else {
                dp[i][j] = 0;
            }
        }
    }

    var ary2 = Array.prototype.concat.apply([], dp);
    
    var max = Math.max.apply(null, ary2);

    console.log(max);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));