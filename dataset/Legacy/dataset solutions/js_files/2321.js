// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	//文字列から10進数に変換するときはparseIntを使います
	var n = parseInt(input[0], 10);
    var str = input[1].split(" ");
	var ans = '';
  	for(var i=0; i<n; i++){
    	ans += str[0].charAt(i);
          	ans += str[1].charAt(i);
    }
  console.log(ans);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));