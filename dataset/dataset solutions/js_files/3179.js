// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
    start = input[0].split(" ");
    var sc = parseInt(start[0],10);//神社の数
    var tc = parseInt(start[1],10);//寺の数
    var qc = parseInt(start[2],10);//問題の数

    // 神社を配列に
    var sa = [];
    for(var i = 1; i <= sc; i++){
        sa.push(input[i]);
    }

    // 寺を配列に
    var ta = [];
    for(var i = 1; i <= tc; i++){
        ta.push(input[i + sc]);
    }

    for(var i = 1; i <= qc; i++){
        var ql = input[i + sc + tc];
        var movement = null;
        for(var s = 0; s < sa.length; s++){
            for(var t = s; t < ta.length; t++){
                //　神社と寺の組み合わせ
                var sl = sa[s];// 西から神社までの距離
                var tl = ta[t];// 西から寺までの距離
                // 神社からいった場合
                var ans = Math.abs(sl - tl) + Math.min(Math.abs(ql - sl),Math.abs(ql - tl));
                movement = (movement == null || movement > ans) ? ans : movement;
            }
        }
        console.log("%d",movement);
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));