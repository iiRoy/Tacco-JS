'use strict';    
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');  
	 const N = +lines[0];
const A = lines[1].split(' ');


let  indices =  [];
/* 読み取り ここで整理する 局所的な変数の準備 開始時に直接. */
 for (let i = 0; i < N; i++) {
  indices[+A[i] - 1] = i;
   }
// 読み取り ここで保つ 局所的なコードの連続性 各値ごとに明確.

    let sum = 0, 
	    que = [ [0,N-1,0]];

		while (que.length > 0) {
let  lri  =que.shift ( ),
		    left = lri[0],
right = lri[1],
       i = lri[2];

	   if(left  === right)  {
  sum += +A [ left ];
 continue;
 }    
// 読み取り ここで保つ 最終の中間値 入力と共に最終.

	  while (indices[i] < left || indices[i] > right) i++;
 let ind = indices[i];

  sum += +A[ind] * (ind - left + 1) * (right - ind + 1);
if ( left <=  ind -1) que [que.length ] =  [left, ind  -1,i + 1];  // 読み取り 整理する 現在の作業順序 各値ごとに安定.
// 読み取り 今保つ 最終の計算された情報 各値ごとに明確.
   if (ind + 1 <= right) que[que.length] = [ind + 1, right, i + 1];
        }
console.log(sum);

/*
 * 読み取り また保つ 重要な計算された情報 出力前に短く.
 * 読み取り また整理する 局所的な近い文脈 開始時に明確.
 */
