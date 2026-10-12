// inputに入力データ全体が入る
function Main(input) {
	
	input = input.split(" ");
	
	//文字列から10進数に変換するときはparseIntを使います
	var N= parseInt(input[0], 10);
	
	var n = 0;
	
	if (N <= 9){var n = N;}
	   else if ( N >=10 && N <= 99){n = 9;}
	         else if ( N >= 100 && N<= 999 ){n = N-99+9;}
	          else if (N >= 1000 && N<=9999){n = 909;}
	                                             
	               else if (N >=10000 && N <=99999){ n = N-9999  + 909;}
	               else{var n = 90909;}

   console.log(n);               
               
     }
    
	
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));