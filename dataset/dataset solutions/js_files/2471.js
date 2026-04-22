// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");

	//文字列から10進数に変換するときはparseIntを使います
	var n = parseInt(input[0], 10);
	
	for(i=9;i>0;i--){
	  if (n%i==0){if(n/i<10){console.log('Yes');
                            break;}
	                 else{console.log('No');
                         break;}
	             }
	         }
	                 
   // console.log('No');
	
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));