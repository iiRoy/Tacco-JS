// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                 メンバー: 山崎七海, 山田凛, 中村芽依                 ║
// ║              登録番号: E71415487, Q18892000, N72417467               ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝
function Main (input)  {
      var lines = input.split("\n");   
   while(1) {
s = lines.shift().split("");
/* 読み取り よく保つ 現在の見える結果 出力前に単純. */
if(s[0] == 0) break;
// 読み取り 今整理する 局所的な中間値 入力と共に短く.
		console.log(s.map(Number).reduce(function(x, y){ return x + y; }));
	 }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
