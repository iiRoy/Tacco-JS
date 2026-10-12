  // inputに入力データ全体が入る
  function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
  input = input.split("\n");
	tmp = input[0].split(" ");
  var N = Number(tmp[0]);
  var X = Number(tmp[1]);
  var Y = Number(tmp[2]);
	//文字列から10進数に変換するときはparseIntを使います
  var ans = [];
  for(i = 0; i<N-1; i++){
    ans[i] = 0;
  }

  for(i=1; i<=N-1; i++){
    for (var j = i+1; j <= N; j++) {
      // i in A, j in A ok
      if(1 <= i && i <= X && 1 <= j && j <= X){
        dis = j-i;
      }
      // i in A, j in B ok
      if(1 <= i && i <= X && X < j && j < Y){
        dis = X-i;

        rootA = j-X;
        rootB = Y-j+1;
        if(rootA < rootB) dis += rootA;
        else dis += rootB;
      }
      // i in A, j in C ok
      if(1 <= i && i <= X && Y <= j){
        dis = X-i + 1 + j-Y;
      }
      // i in B, j in B
      if(X < i && i < Y && X < j && j < Y){
        dis = 0;
        rootA = j-i;
        rootB = i-X + 1 + Y-j;
        if(rootA < rootB) dis += rootA;
        else dis += rootB;
      }
      // i in B, j in C ok
      if(X < i && i < Y && Y <= j){
        dis = j-Y;

        rootA = i-X+1;
        rootB = Y-i;
        if(rootA < rootB) dis += rootA;
        else dis += rootB;
      }
      // i in C, j in C ok
      if(Y <= i && Y <= j){
        dis = j-i;
      }
      ans[dis-1]++;
    }
  }

  ans = ans.join("\n");
	//出力
	console.log('%s', ans);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
