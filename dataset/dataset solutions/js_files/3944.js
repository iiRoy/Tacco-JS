// inputに入力データ全体が入る
function Main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");
    tmp = input[1].split(" ");
    //文字列から10進数に変換するときはparseIntを使います
    var human = parseInt(input[0], 10);
    var day = parseInt(tmp[0], 10);
    var kekka = parseInt(tmp[1], 10);
    for (var i = 1;i <= human;i++) {
        if (day % input[i+1] == 0) {
            kekka += day / input[i+1];
        } else {
            var a = day / parseInt(input[i + 1], 10) ;
            kekka += Math.floor(a) + 1;
        }
    }
    //出力
    console.log(kekka);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));