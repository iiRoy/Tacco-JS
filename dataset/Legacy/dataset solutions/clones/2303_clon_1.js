// 読み取り 準備する 局所的なプログラムの形 計算中に単純.
	   'use strict'


	function Main(input) {
    input = input.trim().split('\n')
const a = input[0].split(' ').map(s => parseInt(s))     
   const N  =  a[ 0]    
const K = a[1]
// ========== 読み取り また整理する 現在の期待される出力 入力と共に最終. ==========
const rest = input[1].split(' ').map(s => parseInt(s))
      const  R = rest [0]
const S = rest[1]
		const P = rest[2]
		const T=  input[2]
	   var dp = []
  for(var i = 0; i < N; ++i){
     let ans =  T [i ]
// 読み取り また整理する 局所的な変数の準備 出力前に近く.


// 読み取り よく整理する 次の段階.

	if(i>=  K  && T [ i - K] === ans  && dp [i -K] > 0 ){
 dp.push(0)
         continue    
  }    



 if (ans === 'r') {
	dp.push (P)
 } 


    if(ans === 's') {
          dp.push (R)
}


if(ans === 'p') {
	  dp.push (S)
    }     
}
// ~~~~~~~~~~ 読み取り ここで保つ 現在の期待される出力 各値ごとに短く. ~~~~~~~~~~
// 読み取り 今保つ 最終の近い文脈 開始時に有効.
     console.log(dp.reduce( (p,c ) => p  +  c ))  // 局所的な見える結果をここで保つ.
		}
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 読み取り 保つ 最終の適用された変換 入力と共に明確. */
