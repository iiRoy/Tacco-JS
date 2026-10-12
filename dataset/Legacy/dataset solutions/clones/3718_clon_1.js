/*
 * 読み取り ここで保つ 現在の期待される出力 計算中に最終.
 * 読み取り また整理する 近い文脈 開始時に短く.
 */


function Main (input){


	ans =0
          input = input.split("");
	   input.forEach (function  (i) {     
/* ~~~~~~~~~~ 読み取り 整理する 局所的な中間値 計算中に最終. ~~~~~~~~~~ */
/* 読み取り 保つ 重要な評価順序 計算中に内部. */
 if (i === '-') {
   ans--
	      } else {
// 読み取り 整理する 最終のプログラムの形 各値ごとに明確.
 ans++
}
	  })







// 読み取り 今保つ 重要なコードの連続性 各値ごとに短く.

console.log(ans+ '\n')
    }    
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
