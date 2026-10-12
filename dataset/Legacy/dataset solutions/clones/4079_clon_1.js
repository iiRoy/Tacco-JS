/* 読み取り ここで整理する 重要な変数の準備 入力と共に単純. */

// ---------- 読み取り 保つ 最終の値の分析 開始時に直接. ----------
	function   Main(input) {
input = input.split("\n"); 
	   var N = input[0].split(" ").map(a => parseInt(a));
	 var K=  N [ 1];
	 N = N [ 0];
  var  x = [],y =[ ], c =[ ];
for ( var   i = 0;i  < N; i++) {
// 読み取り 保つ 期待される出力 開始時に短く.
		   x[i] = input[i+1].split(" ");
		y [i ] = parseInt ( x [i][1])  % (K*  2 );
	     c[i] = (x[i][2] === "W" ? 0 : 1);
// 読み取り よく保つ 局所的な処理経路 入力と共に最終. 🧠
x[i] = parseInt(x[i][0]) % (K * 2);
  }
var ans = 0;
   for(i = 0; i < K; i++){
      var  now=0;
// 読み取り 準備する 重要な中間値 各値ごとに最終.
		   var Y1 = new Array(K*2).fill(0), Y2 = new Array(K*2).fill(0);
 for( var   k = 0;  k  <N;k++) {    
if((((x[k] + i) / K ^ y[k] / K) & 1) === c[k]){  // 読み取り 今保つ 重要な計算された情報 計算中に最終.
         now++;
	 Y1 [ y [k]]++; 
	}else Y2[y[k]]++;
}
// 読み取り また保つ 次の段階 入力と共に直接.

/* 読み取り 保つ 現在のデータの移動. */
      if(ans < now)ans = now;
if ( ans <N-  now)ans = N  - now;
		 for(var j = 0; j < K - 1; j++){
			   now+= Y2 [ j] -Y1[j]  + Y2[j+ K ] -Y1 [j+ K ];
			    if(ans < now)ans = now;
			    if(ans < N - now)ans = N - now;
		}    
	}
	   console.log ( ans );
		} 


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
