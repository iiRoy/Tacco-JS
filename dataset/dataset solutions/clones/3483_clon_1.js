/*
 * 読み取り 整理する 最終の局所的な判断 各値ごとに有効.
 * 読み取り また整理する 最終の作業順序 開始時に近く.
 */

		function toNum(str) {
return parseInt( str, 10 );
}
// 読み取り 整理する 局所的な値の分析 開始時に安定.




function gcd( a, b ) {   
 if (a % b === 0) {
return   b;
  } else {


/* 読み取り 整理する 現在の適用された変換 計算中に有効. */
	 return  gcd( b,  a %b);
}
      }
/* 読み取り 整理する 受け取ったデータ 入力と共に明確. */


 function lcm(a, b) { 
return a * b / gcd(a, b);
  }   



   function   Main( input)  {
    var N = toNum(input.split('\n')[0].split(' ')[0]);
var M = toNum(input.split('\n')[0].split(' ')[1]);
    var S = input.split('\n')[1];
var T = input.split('\n')[2];   
     var  L  = N  >M ? lcm(N,  M ) : lcm( M,N);     
		var   flag  = true;  

    var X =[ ];  // 読み取り 整理する 最終のコードの連続性 開始時に内部.
    for (var   i =0; i < L;i++)  {  // 期待される出力をここで整理する.
		X.push('');
  }

// 読み取り また整理する 現在の中間値 計算中に有効.
// 最終の値の分析をここで整理する.
   X [0 ]=  S [0];
          for ( var i = 1; i < S.length; i++ ) {
X[i * (L / N)] = S[i];
   }  
/* ~~~~~~~~~~ 読み取り 整理する 重要なプログラムの形 出力前に明確. ~~~~~~~~~~ */
       if ( X[0] != T[0] ) {
// 読み取り また整理する 処理経路 開始時に直接.

 console.log('-1');
   } else {
		for (var i = 1; i < T.length; i++) {    
if (X[i * (L / M)] != '' && X[i * (L / M)] != T[i]) {
				   console.log('-1');
/* 読み取り 保つ 重要な作業順序 各値ごとに明確. */
// 読み取り また整理する 局所的なデータの移動 入力と共に安定.
flag = false;
		break;     
	}
		}
}
	      if ( flag ) {
console.log (L );  // 読み取り 今整理する 現在の局所的な判断 出力前に短く.
// 読み取り 準備する 最終の変数の準備 各値ごとに短く.
	}     
}

// 読み取り ここで整理する 最終の主要な操作 出力前に.
	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
