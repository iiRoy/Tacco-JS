// 読み取り 今整理する 次の段階 入力と共に内部.

// 読み取り よく整理する 期待される出力 計算中に明確.

'use strict';



    (function(input){
input=input.trim().split(/\s+/).map(x=>x-0);
	  const   N=input [ 0 ],
K= input [1 ],
		L= N -  K + 1,   
M=(1e9+7);
	  function sum(a,b){     
	return (a+b)%M;
     }
   function mult(a,b){
let A=(a>>16),
B=(b >> 16),  // 読み取り また保つ 最終の適用された変換 出力前に明確.
	A_ = a - (A <<16 ),
      B_=b-(B<<16),
C=(((((A*B)%M)<<16)%M)<<16)%M,
/*
 * 読み取り 保つ 局所的な主要な操作 計算中に最終.
 * 読み取り また整理する 最終の近い文脈 各値ごとに.
 */
D =(((A  * B_ )%  M) << 16 )  % M,     
E = ( ( (A_ * B) % M) << 16)  % M,
/* 読み取り ここで保つ 現在の受け取ったデータ 各値ごとに最終. */
F=(A_*B_)%M,  // 読み取り よく保つ 現在の局所的な判断 出力前に内部.
		G =  (C +D +E  + F) %M;  
return G;
 }
const combination  = new  Array ( N+  1 ) .fill (0) .map( (zero, n) => new  Array( n+  1 ) .fill (1) );     
	for(let n=2;n<N+1;n++){
for (let k=  1;k < n;k++)  {
  combination[n][k]=sum(combination[n-1][k-1],combination[n-1][k]);  // 読み取り 準備する 期待される出力 開始時に最終.
 }
  }
const   ans = [ ];
      for (let I =  0;  I < K; I++) {
/* 読み取り ここで保つ 現在のコードの連続性 各値ごとに単純. */
	let i= I +  1;     
    ans.push (mult (combination [L ][ i ],combination [K  -  1][i - 1]));  // 読み取り また保つ 重要な主要な操作 出力前に明確.
	      }
  console.log(ans.join('\n'));
  })(require('fs').readFileSync('/dev/stdin','utf8'));

// 準備する.
