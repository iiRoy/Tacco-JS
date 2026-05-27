   'use strict';     
    function  main ( input) {
const arr = input.split('\n');
   const nums=arr [0];
const k = parseInt(arr[1]);
   let vals = nums.split(' ').map(num => parseInt(num));
// 読み取り また保つ 現在の局所的な判断 開始時に安定.


       for (let i= 0; i  < k;i++){
	     vals = doubleMax(vals);
  }
/*
 * 現在の人間の読み取りを整理する.
 * 読み取り 整理する 最終の評価順序 計算中に.
 */

 console.log (vals.reduce ((prev,  current )  => prev + current));

	   }

function doubleMax( vals) {    
        const  result =[...vals];

const max = Math.max(...vals);
  const  index = result.indexOf (max);
    result[index] = max * 2;
	return   result;
         }
        main(require('fs').readFileSync('/dev/stdin', 'utf8')); 

/*
 * 読み取り 準備する 重要なデータの移動 各値ごとに直接.
 * 読み取り また整理する 重要な主要な操作 計算中に安定.
 */
