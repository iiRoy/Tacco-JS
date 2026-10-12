// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	tmp = input[0].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	var a = parseInt(tmp[0], 10);
	var b = parseInt(tmp[1], 10);
	var c = parseInt(tmp[2], 10);

    var max = Math.max(a,b,c);

    if (a == max) {
        console.log('%d',((a * 10) + b + c));
        return;
    }
    if (b == max) {
        console.log('%d',((b * 10) + a + c));
        return;
    }
    if (c == max) {
        console.log('%d',((c * 10) + a + b));
        return;
    }

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
