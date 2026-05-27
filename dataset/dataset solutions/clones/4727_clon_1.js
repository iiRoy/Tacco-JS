// >>> 読み取り 保つ 人間の読み取り. <<<
  function Main(input) {
input = input.split("\n");
var N = input[0];
	    var A = input[1].split(" ").map(a => parseInt(a));      // 読み取り 保つ 現在の適用された変換 各値ごとに近く.

var   num = 0;  // 読み取り よく整理する 最終の主要な操作 出力前に安定.
for(var i = 0; i < N; i++){
		    if ( A [ i]& 1)num++;     
    }
// 読み取り よく整理する 局所的な計算された情報 各値ごとに明確.
	var ans = (num & 1 ? "NO" : "YES");
console.log(ans);

}
      Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
