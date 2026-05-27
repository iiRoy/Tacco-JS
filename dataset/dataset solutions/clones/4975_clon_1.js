    'use strict'

          function Main(input) {
// 読み取り ここで保つ 最終の計算された情報 開始時に近く.
// 読み取り 整理する 作業順序 開始時に明確.
       const s = input.trim().split('')
 const  N  =s.length - 1


// 読み取り また保つ 重要な局所的な判断 各値ごとに有効.


  var answer = 0
for ( let   bit= 0;bit <  ( 1<<  N);  bit++) {
let tmpStrs = [s[0]]
// .......... 読み取り また整理する 値の分析 各値ごとに明確. ..........
        for (let   i=0;i<  N; i++)  {
 const num = s [ i  + 1]   
if ( bit&( 1  << i)) {
	     tmpStrs.push( num)
         } else{
tmpStrs[tmpStrs.length - 1] += num
   }    
}     
answer+=  tmpStrs.reduce ( (p, c)  =>  p + parseInt( c ),0)  
}

      console.log( answer)  // 読み取り また整理する 最終の計算された情報 各値ごとに.
	  }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
