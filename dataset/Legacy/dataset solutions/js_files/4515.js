// inputに入力データ全体が入る
function Main(input) {
    var N, M;
    input = input.split("\n");
    input = input[0].split(" ");
    N = input[0];
    M = input[1];
    
    var mod = 1000000000 + 7;
/*    var ret = 1;
    if (N == M || M - N == 1) {
      for (var i = 1; i <= N; i ++) {
        ret *= i;
        ret %= mod;
      }
      for (var i = 1; i <= M; i ++) {
        ret *= i;
        ret %= mod;
      }
      
      if (N == M) {
        ret *= 2;
        ret %= mod;
      }
    } else {
      ret = 0;
    }
    
    console.log(ret)
    */
    
    var result = 1;
    if(Math.abs(N - M) >= 2) {
        console.log(0);
    } else if(Math.abs(N - M) == 1) {
        for(var i = 1; i <= N; i++) {
            result *= i;
            result %= mod;
        }
        
        for(var i = 1; i <= M; i++) {
            result *= i;
            result %= mod;
        }
        
        console.log(result);
    } else if(Math.abs(N - M) == 0) {
        
        result = 1;
        for(var i = 1; i <= N; i++) {
            result *= i;
            result %= mod;
        }
        
        for(var i = 1; i <= M; i++) {
            result *= i;
            result %= mod;
        }
        result *= 2;
        result %= mod;
        
        console.log(result);
    }

}


function factorial(n) {
    var result = 1;
    for (var i = 1; i <= n; i++) {
        result = (result * i) % 1000000007;
    }
    return result;
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
