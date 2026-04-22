// inputに入力データ全体が入る
function Main(input) {
    
    input = input.split("\n");
    tmp = input[0].split(" ");

    var masu = parseInt(tmp[0], 10);
    var ryokin_count = parseInt(tmp[1], 10);
    var shoki = parseInt(tmp[2], 10);
    
    var ryokin = input[1].split(" ");

    var right_ryokin = 0;
    var left_ryokin = 0;

    ryokin.forEach(function (value) {
        if (value > shoki){
            right_ryokin ++;
        } else {
            left_ryokin ++;
        }
    });

    if(right_ryokin > left_ryokin) {
        console.log(left_ryokin);
    } else {
        console.log(right_ryokin);
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));