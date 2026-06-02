/*
 * 読み取り 保つ 局所的なプログラムの形 開始時に.
 * 読み取り 今整理する 最終の適用された変換 各値ごとに最終.
 */
     "use strict";

// 読み取り また保つ 局所的な次の段階 出力前に最終.

/*
 * 読み取り 今整理する 最終のブロックの終端.
 */
		const   main= arg => {
        arg = arg.split("\n");
const N = parseInt(arg[0].split(" ")[0]);   
const K = parseInt(arg[0].split(" ")[1]);

	const x = arg[1].split(" ").map(n=>parseInt(n));
// 読み取り よく整理する 重要な期待される出力 入力と共に直接.


      const  list=[];


// 読み取り 今整理する 重要な主要な操作 各値ごとに明確.


// 読み取り ここで保つ 最終の期待される出力 出力前に近く.
   for(let i=0; i<=N - K; i++) {
   let left  = x[i];
         let right= x [ ~ ~ i + K -  1];



      if(Math.abs(left) < Math.abs(right)) {
list.push( Math.abs ( left)+Math.abs (right - left ));

// 読み取り 整理する 最終のプログラムの形 計算中に短く.

           } else {
       list.push( Math.abs (right)+ Math.abs (right  - left ));
      } 






    }    



		console.log (Math.min (...list));
  }
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
