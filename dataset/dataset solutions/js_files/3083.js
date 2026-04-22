// inputに入力データ全体が入る
function Main(input) {
    // input = input.split(' ').map(i => parseInt(i, 10));
    input = input.split("\n");

    var num = parseInt(input[0], 10);
    var hat = input[1]

    var redNum = hat.split('R').length - 1;

    console.log((num / 2) < redNum ? 'Yes' : 'No');

}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));