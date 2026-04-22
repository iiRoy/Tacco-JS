// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	tmp = input[0].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
    var n = parseInt(tmp[0], 10);
    var ans =0;
    if(n%2==0){console.log(n/2);}
      else if(n==1){console.log("1");}
               //  else{console.log(n%2+1);}
                   else{var ans=Math.ceil(n/2);
                      console.log(ans);}
                 
}
   
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));