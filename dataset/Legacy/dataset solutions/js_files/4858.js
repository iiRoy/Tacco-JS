
function vs(r,b){
	if(r == b)return r;
	else if(r > b)return r-b;
	else return b-r;
}

function Main(inputData) {
	init(inputData);
	
	var n = inI();
	n = Math.pow(2,n);
	var a = [];
	for(var i = 0; i < n; i++)a[i] = inI();

	var l = 0;
	while(n-l > 1){
		var r = a[l],b = a[l+1];
		l += 2;
		a[n++] = vs(r,b);
	}
	outln(a[n-1]);
}


////////////////////////////////////////////////////////////////////////////////////
var input,inputCnt;

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
	Main(document.getElementById("input").value);
}

function init(inputData){
    //配列inputに順番に代入
	input = inputData.replace( /\n/g , " " );
	input = input.split(" ");
	inputCnt = 0;
}
//output
const out = (output) => { console.log(output) }
const outln = (output) => { console.log(output+"\n") }

//input
const inS = () => {return input[inputCnt++]};
const inI = () => {return parseInt(inS(), 10)};
const inF = () => {return parseFloat(inS())};

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
