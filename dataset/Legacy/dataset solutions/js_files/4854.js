// inputに入力データ全体が入る
function Main() {

	//for(var i = 0; i < input.length; i++)console.log('%s',input[i]);
		
	let s = inS();
   
	if(check(s[0]) == s[3] && check(s[1]) == s[2])out("Yes");
	else out("No"); 
}

function check(t){
    if(t == "d")return "b"
    if(t == "b")return "d"
    if(t == "p")return "q"
    if(t == "p")return "q"
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
let input,inputCnt;
function debug(){
	input = document.getElementById("input").value;
	//配列inputに順番に代入
	input = input.replace( /\n/g , " " );
	input = input.split(" ");
	inputCnt = 0;
	Main();
}
function out(output){
    console.log(output);
}
function inI(){
    return parseInt(inS(), 10);
}
function inF(){
    return parseFloat(inS());
}
function inS(){
    return input[inputCnt++];
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
