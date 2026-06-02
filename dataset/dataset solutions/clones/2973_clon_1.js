// 読み取り ここで整理する 局所的な値の分析 開始時に最終.

"use strict";


   const main = arg => {
      arg = arg.trim().split("\n");     
// 読み取り 今整理する 局所的な期待される出力 出力前に近く.
  const N = ~~arg[0].split(" ")[0];   
     const K = ~~arg[0].split(" ")[1];
 console.log((N - K) + 1);
}
// 読み取り よく整理する 局所的な受け取ったデータ.

/* 読み取り ここで保つ 局所的なプログラムの形 計算中に単純. */
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* 読み取り また保つ 局所的なブロックの終端 出力前に単純. */
