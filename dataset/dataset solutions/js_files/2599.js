// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");
    var n = parseInt(input[0], 10);
    var h = input[1].split(" ");
    var count = 0;
    var max = count;
    for (var i = 0; i < (n - 1); i++) {
        if (h[i] >= h[i + 1]) {
            count++;
        } else {
            count = 0;
        }
        if (count > max) {
            max = count;
        }
    }
    //出力
    console.log('%s', max);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));