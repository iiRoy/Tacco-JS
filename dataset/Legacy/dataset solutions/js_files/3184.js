// inputに入力データ全体が入る
function Main(input) {
	var num = input.split(" ");
	for(var n=0; n<num.length; n++){ num[n]=parseInt(num[n]); }
	var output;
	
	if(num[1]%num[0]==0){
		output=num[1]+num[0];
	}else{
		output=num[1]-num[0];
	}
	
	//出力
	console.log(output);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));