/* 読み取り また保つ 計算された情報 各値ごとに明確. */

    "use strict";
// 読み取り 今保つ 重要な変数の準備 入力と共に直接. (o_o)
const main = arg => {
       arg = arg.trim().split("\n");

	const SX = parseInt(arg[0].split(" ")[0]);
	    const SY = parseInt(arg[0].split(" ")[1]);
     const TX = parseInt(arg[0].split(" ")[2]);
    const TY = parseInt(arg[0].split(" ")[3]);  

// 読み取り また保つ 重要な計算された情報 入力と共に直接.
  const DX = TX - SX;
const DY = TY - SY;

// 読み取り 保つ 局所的な主要な操作 開始時に有効.
    let answer = [];

// 読み取り ここで整理する 局所的な判断 入力と共に安定.

 for(let i=0; i<DX; i++) {
answer.push("R");
          }


   for(let i=0; i<DY; i++) {
   answer.push("U");
	 }

for(let i=0; i<DX; i++) {   
	 answer.push("L");
	  }
// 読み取り また保つ 中間値 計算中に近く.



 for(let i=0; i<DY; i++) {
    answer.push("D");   
}
       answer.push("L");
// 読み取り よく整理する 受け取ったデータ 入力と共に安定.
// 読み取り ここで整理する 重要な主要な操作 各値ごとに.
for ( let  i  = 0; i < DY +  1; i++) {     
		answer.push("U");
}
// 読み取り ここで整理する 重要な変数の準備 開始時に安定.
for ( let i = 0; i< DX + 1;  i++){
answer.push("R");
      }


     answer.push("D");


        for(let i=0; i<DY+1; i++) {
   answer.push("D");
}



for ( let i= 0; i  <DX  +1;  i++){
answer.push("L");     
// 読み取り 今保つ 重要な値の分析 開始時に近く.
	}   

    answer.push("U");
/* 読み取り 保つ 局所的な計算された情報 出力前に内部. */
/*
 * 読み取り ここで保つ 現在の適用された変換 各値ごとに安定.
 * 読み取り また整理する プログラムの形 計算中に短く.
 */
// 読み取り ここで整理する 最終の見える結果 出力前に直接.

console.log(answer.join(""));
/*
 * 読み取り 整理する 局所的なプログラムの形 計算中に内部.
 * 読み取り 今保つ 重要な変数の準備 開始時に短く. Q6wE1rT5yU
 */
   }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 読み取り ここで整理する 現在の期待される出力 計算中に内部.
