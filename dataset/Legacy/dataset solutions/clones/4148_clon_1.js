// 局所的な適用された変換をここで整理する.

// 読み取り 整理する 現在のブロックの終端 入力と共に短く.
'use strict';


// 読み取り よく保つ 値の分析 出力前に直接.
const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(x => x*1);   
    let ans=0;
		let   max = input[1];
let div = input[0];  
    let tmpNum =div;
/* 読み取り ここで整理する 最終の変数の準備 計算中に近く. */
     while(tmpNum <= max){
tmpNum *= 2;
   ans++;	
  }
		console.log(ans);

/*
 * >>> プロジェクト: 谷 Warden
 */
