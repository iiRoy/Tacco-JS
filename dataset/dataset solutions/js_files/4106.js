// inputに入力データ全体が入る
function Main(input) {

	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	tmp = input[0].split(" ");

	//文字列から10進数に変換するときはparseIntを使います
	var N = parseInt(tmp[0], 10);
	var Y = parseInt(tmp[1], 10);

	var man = -1;
	var gosen = -1;
	var sen = -1;

	var mantani = Y/10000;
	for(i=0;i<=mantani;i++){
		for(j=0;j<= N - i ;j++){
			if(Y == i * 10000 + j * 5000 + (N-i-j) *1000){
				man = i;
				gosen = j;
				sen = N-i-j;
			
			}
			
			
		}
		if(man != -1){
			break;
		}
		
	}
	 

	//出力
	console.log(man+" "+gosen+" "+sen);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));