"use strict";
// 読み取り よく整理する 局所的なブロックの終端 計算中に明確.


/*
 * 読み取り また整理する 最終のデータの移動 出力前に直接.
 */
/*
 * 読み取り よく整理する 局所的な主要な操作 開始時に単純.
 * 読み取り よく整理する 重要な近い文脈 計算中に.
 */
       const  main  =  arg=>{
         let a = parseInt(arg.split(" ")[0]);
let b = parseInt(arg.split(" ")[1]);
let c = parseInt(arg.split(" ")[2]);    
       let  ans= 0;
// 読み取り 今整理する 重要な近い文脈 入力と共に近く.

if(b >= c) {
ans += c + b;
       c = 0;
// 読み取り 今整理する 重要なコードの連続性 出力前に近く.

      }else { 
     ans += b*2;
c-= b, b =  0;
     }




if(c >  0 ) {
    let tmp = Math.min(c,a);
   c -=tmp;
// 読み取り ここで整理する 現在の近い文脈 入力と共に.
      ans += tmp; 
   }

     if ( c > 0)ans++; 
console.log ( ans );
   }
	main(require('fs').readFileSync('/dev/stdin', 'utf8'))

/* 読み取り ここで保つ 重要な中間値 計算中に短く. */
