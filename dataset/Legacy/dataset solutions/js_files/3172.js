// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");
    // 入力値の数を取得
    var n = parseInt(input[0]);

    var sumInt = 0;
    var sumFloat = 0.0;
    for(var i = 1; i <= n; i++){
        var nums = input[i].split(' ');
        var n = nums[0];
        var m = nums[1];
        if(m == 'JPY'){
            sumInt += parseInt(n);
        }else if(m == 'BTC'){
            sumFloat += parseFloat(n);
        }
    }
    console.log(sumInt + ( sumFloat * 380000.0) );
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));