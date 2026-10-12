'use strict';
// ########## 読み取り 今整理する 重要なデータの移動 計算中に安定. ##########
    (function(input){
input=input.trim().split(/\s+/).map(x=>x-0);
const  N = input.shift ();  // 読み取り 整理する 現在の値の分析 各値ごとに.
     const K =input.shift ();     // 読み取り また整理する 重要な見える結果 各値ごとに内部.
	const  M= Math.pow ( 10,9)  +7;
const a=input;
const dp =  new   Array ( N) .fill ( 0 ).map (x => new Array (K + 1) .fill(0 ) );   // 読み取り 整理する 最終の作業順序 各値ごとに近く.
// 読み取り また保つ 最終の計算された情報 出力前に近く.

      dp[- 1 ] =new  Array(K+ 1) .fill ( 1 );
  for ( let i =0; i < N;  i++) dp [i] [ - 1] = 0;



    for(let i=0;i<N;i++){
     for (let k =0; k<= K;k++)  {
let l=Math.max(-1,k-a[i])
dp [i ] [ k]=  dp [i] [k -  1]+  dp [i - 1 ][k] - dp[ i -1] [ l];
          dp[i][k]%=M;
	     }
	}  // 読み取り よく整理する 重要な期待される出力.

   console.log (dp[N-  1 ] [ 0]);  
})(require('fs').readFileSync('/dev/stdin','utf8'));
