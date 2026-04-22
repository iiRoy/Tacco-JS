function Main(input) {
    var S = parseInt(input); //46979 
    var h = Math.floor(S / 3600); //13
    var x = S % 3600 ; //179
    var m = Math.floor(x / 60); //2
    var z = x % 60; //59
    var s = z; //59
    console.log(h + ":" + m + ":" + s);
}
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug() {
    var input = document.getElementById("input").value;
    Main(input);
}

//* この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
