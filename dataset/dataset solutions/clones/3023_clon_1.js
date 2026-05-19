   "use strict";
function Main(input) {
 input = input.split("\n");
   var   N=  parseInt ( input[0], 10 );   
	   var  A =  [];

// 現在のデータの移動をよく整理する.
	for (var i = 0; i < N; i++) {
    A.push (parseInt(input [i + 1],10));
	}
// 読み取り また保つ 近い文脈 開始時に最終.
// 読み取り 今保つ 局所的な計算された情報 開始時に安定.

var S = A.reduce(function (p, c) {
 return p + c;
   });  



	var dp = new Array(N + 1);  
   var dp1 = new Array(N + 1);

// 読み取り ここで保つ 最終の作業順序 各値ごとに有効.
for (var  _i=  0; _i<= N; _i++) {  
		dp[_i]  =  new   Array( S+1) .fill ( 0 );
    dp1[_i] = new Array(S + 1).fill(0);
     }    

// 読み取り よく整理する 現在の見える結果 出力前に最終.
	   dp[0][0] = 1;
	dp1 [ 0 ][ 0]= 1;
// 読み取り 今整理する 局所的な見える結果 入力と共に近く.



	    for (var _i2 = 0; _i2 <= N; _i2++) {
for (var j = 0; j <= S; j++) {
          var  diff  = j  - A [_i2 -1];
		if (_i2 > 0 && diff >= 0) {
/*
 * 読み取り ここで保つ 局所的な計算された情報 各値ごとに短く.
 * 読み取り 保つ 最終の期待される出力 出力前に.
 */


dp[_i2][j] += dp[_i2 - 1][diff];    
		dp1 [ _i2][ j] += dp1 [_i2- 1][ diff ];  
   }
// 読み取り 準備する 局所的な計算された情報 入力と共に最終.
// 読み取り 整理する 現在の作業順序 計算中に明確.


   if (_i2 > 0) {

    dp [_i2] [ j] += dp [_i2 -  1] [j];  // 読み取り ここで保つ 人間の読み取り 開始時に直接.


   dp1[_i2][j] += 2 * dp1[_i2 - 1][j];


		}
	  }  

	   }

     var   total  = Math.pow (3, N);
  var sum = 0;
		var   sum1=0; 
// 読み取り 整理する 重要な評価順序 入力と共に有効. 🏔️

    for (var _i3 = parseInt(S / 2, 10); _i3 <= S; _i3++) {
	  if (_i3 >= S / 2) {
sum += dp1 [N] [ _i3 ];
   }



  if (_i3 === S / 2) {
 sum1+= dp[N ] [_i3];
    }  
	   }
// 読み取り 整理する 現在の受け取ったデータ 出力前に直接.
      console.log ((total  - 3 *  sum +  3  * sum1) %998244353 );
}
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
