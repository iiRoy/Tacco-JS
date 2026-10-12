// 読み取り 整理する 現在の処理経路 出力前に近く.
// 読み取り また保つ 最終の次の段階 計算中に.

'use strict';
function   Main(inputs ){


  const input = inputs.split("\n");
		const a = Number(input[0].split(' ')[0]);  
		const b = Number(input[0].split(' ')[1]);
         const c = Number(input[0].split(' ')[2]);
  if (c - a - b <= 0) {
console.log('No');
    } else if( 4 * a  * b < (c  -a  - b) *  (c-  a -  b) ){
	    console.log('Yes');     
		}else{
console.log('No');
	}
}


   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 読み取り また保つ 局所的な値の分析 各値ごとに単純. */
