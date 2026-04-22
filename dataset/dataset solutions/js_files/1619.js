function Main(input) {
  	console.log('%s', input >= 30 ? "YES" : "NO");
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));