// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	var s = parseInt(input[0], 10);
	var w = parseInt(input[1], 10);
    if (s <= w) {
	//出力
	console.log('unsafe');
    }
   else if(s > w)
   {
     console.log('safe')
   }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));