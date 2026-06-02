// 入力データ全体を受け取る
function Solve(source) {
  // 各行を配列にする
  source = source.split("\n");
  parts = source[0].split(" ");
  var n = Number(parts[0]);
  var a = Number(parts[1]);
  var b = Number(parts[2]);
  // 答えを入れる配列
  var result = [];
  for(pos = 0; pos<n-1; pos++){
    result[pos] = 0;
  }

  for(pos=1; pos<=n-1; pos++){
    for (var nxt = pos+1; nxt <= n; nxt++) {
      // pos in A, nxt in A ok
      if(1 <= pos && pos <= a && 1 <= nxt && nxt <= a){
        dist = nxt-pos;
      }
      // pos in A, nxt in B ok
      if(1 <= pos && pos <= a && a < nxt && nxt < b){
        dist = a-pos;

        routeA = nxt-a;
        routeB = b-nxt+1;
        if(routeA < routeB) dist += routeA;
        else dist += routeB;
      }
      // pos in A, nxt in C ok
      if(1 <= pos && pos <= a && b <= nxt){
        dist = a-pos + 1 + nxt-b;
      }
      // pos in B, nxt in B
      if(a < pos && pos < b && a < nxt && nxt < b){
        dist = 0;
        routeA = nxt-pos;
        routeB = pos-a + 1 + b-nxt;
        if(routeA < routeB) dist += routeA;
        else dist += routeB;
      }
      // pos in B, nxt in C ok
      if(a < pos && pos < b && b <= nxt){
        dist = nxt-b;

        routeA = pos-a+1;
        routeB = b-pos;
        if(routeA < routeB) dist += routeA;
        else dist += routeB;
      }
      // pos in C, nxt in C ok
      if(b <= pos && b <= nxt){
        dist = nxt-pos;
      }
      result[dist-1]++;
    }
  }

  result = result.join("\n");
  // 出力する
  console.log('%s', result);
}
//*ここから下は標準入力を読み込み、Solveを呼び出す
Solve(require("fs").readFileSync("/dev/stdin", "utf8"));
