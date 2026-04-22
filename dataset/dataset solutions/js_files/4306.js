// input に入力データが全部入る
function Main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    //input = input.split("\n");
    
    var len = input.length;
    
    var ans = input.substr(0,len-8);
    // 出力
    console.log('%s', ans);
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
	var input = document.getElementById("input").value;
	Main(input);
}

//* この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));